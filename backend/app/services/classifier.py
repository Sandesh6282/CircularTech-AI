"""
CircularTech AI — Vision Classification Service
Performs image classification on uploaded electronic waste photos using
the trained MobileNetV3 model with confidence estimation and fallback guards.
"""

import io
import json
from pathlib import Path
from typing import Optional, List, Dict, Tuple
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models

from backend.app.schemas import DeviceCategory, CategoryPredictionOutput, CandidatePrediction

MODELS_DIR = Path("/Users/sandeshj/CircularTech-AI/backend/models")
CHECKPOINT_PATH = MODELS_DIR / "ewaste_classifier.pt"
INDICES_PATH = MODELS_DIR / "class_indices.json"

# Maps dataset internal classes to DeviceCategory enum
DATASET_TO_CATEGORY_MAP = {
    "battery": DeviceCategory.battery,
    "cable": DeviceCategory.charger_cable,
    "circuit_board": DeviceCategory.circuit_board,
    "keyboard": DeviceCategory.other,
    "laptop": DeviceCategory.laptop,
    "mobile_phone": DeviceCategory.phone,
    "mouse": DeviceCategory.other
}

class EWasteClassifierService:
    def __init__(self, checkpoint_path: Path = CHECKPOINT_PATH):
        self.checkpoint_path = checkpoint_path
        self.device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
        self.model: Optional[nn.Module] = None
        self.class_names: List[str] = []
        self.model_version = "1.0.0"
        self.model_name = "MobileNetV3-Small-ETID"
        self.is_loaded = False

        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self._load_model()

    def _load_model(self):
        if not self.checkpoint_path.exists():
            print(f"[ClassifierService] Warning: Checkpoint not found at {self.checkpoint_path}. Operating in fallback mode.")
            return

        try:
            checkpoint = torch.load(self.checkpoint_path, map_location=self.device, weights_only=False)
            self.class_names = checkpoint.get("class_names", [])
            if not self.class_names and INDICES_PATH.exists():
                with open(INDICES_PATH) as f:
                    data = json.load(f)
                    self.class_names = [data["idx_to_class"][str(i)] for i in range(len(data["idx_to_class"]))]

            num_classes = len(self.class_names)
            base_model = models.mobilenet_v3_small(weights=None)
            in_features = base_model.classifier[3].in_features
            base_model.classifier[3] = nn.Linear(in_features, num_classes)
            base_model.load_state_dict(checkpoint["model_state_dict"])
            base_model = base_model.to(self.device)
            base_model.eval()

            self.model = base_model
            self.is_loaded = True
            print(f"[ClassifierService] Successfully loaded {self.model_name} with {num_classes} classes.")
        except Exception as e:
            print(f"[ClassifierService] Error loading model weights: {e}")
            self.is_loaded = False

    def predict(self, image_bytes: bytes) -> CategoryPredictionOutput:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image format or corrupted file: {e}")

        # If model is not loaded yet (e.g., during active training), return honest fallback
        if not self.is_loaded or self.model is None:
            self._load_model() # Retry once in case checkpoint just finished
            if not self.is_loaded or self.model is None:
                return CategoryPredictionOutput(
                    predicted_category=DeviceCategory.other,
                    confidence=0.0,
                    model_name="Fallback-Pre-trained",
                    model_version="0.0.1",
                    top_candidates=[],
                    needs_user_confirmation=True,
                    message="Model weights are compiling. Please select your device category manually."
                )

        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.softmax(outputs, dim=1).squeeze(0)

        # Get Top-4 predictions to allow for category deduplication
        top_k = min(5, len(self.class_names))
        top_probs, top_indices = torch.topk(probabilities, k=top_k)

        top_candidates: List[CandidatePrediction] = []
        seen_categories = set()
        for prob, idx in zip(top_probs, top_indices):
            raw_cls = self.class_names[idx.item()]
            mapped_cat = DATASET_TO_CATEGORY_MAP.get(raw_cls, DeviceCategory.other)
            if mapped_cat.value not in seen_categories:
                seen_categories.add(mapped_cat.value)
                top_candidates.append(CandidatePrediction(
                    category=mapped_cat.value,
                    confidence=round(prob.item(), 4)
                ))
            if len(top_candidates) >= 3:
                break

        top_raw_class = self.class_names[top_indices[0].item()]
        top_confidence = round(top_probs[0].item(), 4)
        predicted_category = DATASET_TO_CATEGORY_MAP.get(top_raw_class, DeviceCategory.other)

        # Confidence threshold rule: Always prompt confirmation if confidence < 0.65
        needs_user_confirmation = top_confidence < 0.65 or predicted_category == DeviceCategory.other

        return CategoryPredictionOutput(
            predicted_category=predicted_category,
            confidence=top_confidence,
            model_name=self.model_name,
            model_version=self.model_version,
            top_candidates=top_candidates,
            needs_user_confirmation=needs_user_confirmation,
            message=f"Identified as {predicted_category.value.title()} with {top_confidence*100:.1f}% confidence."
        )

# Global singleton
classifier_service = EWasteClassifierService()
