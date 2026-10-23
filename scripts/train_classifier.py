#!/usr/bin/env python3
"""
CircularTech AI — Model Training Script
Trains a MobileNetV3-Small classifier on the e-waste dataset with transfer learning.
"""

import os
import sys
import ssl
import json
import time
import argparse
from pathlib import Path

# Fix macOS Python SSL certificate verification for downloading pretrained weights
ssl._create_default_https_context = ssl._create_unverified_context

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

DATASET_DIR = Path("/Users/sandeshj/CircularTech-AI/datasets/etid")
MODELS_DIR = Path("/Users/sandeshj/CircularTech-AI/backend/models")

def get_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")

def get_transforms():
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform

def train_model(
    epochs: int = 5,
    batch_size: int = 32,
    lr: float = 0.001,
    dataset_dir: Path = DATASET_DIR,
    output_dir: Path = MODELS_DIR
):
    device = get_device()
    print(f"==> Training on Device: {device}")
    output_dir.mkdir(parents=True, exist_ok=True)

    train_dir = dataset_dir / "train"
    val_dir = dataset_dir / "val"

    if not train_dir.exists() or not val_dir.exists():
        print(f"Error: dataset directories not found in {dataset_dir}. Run prepare_dataset.py first.")
        sys.exit(1)

    train_tf, val_tf = get_transforms()
    train_dataset = datasets.ImageFolder(str(train_dir), transform=train_tf)
    val_dataset = datasets.ImageFolder(str(val_dir), transform=val_tf)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    class_names = train_dataset.classes
    num_classes = len(class_names)
    print(f"==> Classes ({num_classes}): {class_names}")
    print(f"==> Samples: Train={len(train_dataset)}, Val={len(val_dataset)}")

    # Save class indices mapping
    class_to_idx = train_dataset.class_to_idx
    idx_to_class = {v: k for k, v in class_to_idx.items()}
    with open(output_dir / "class_indices.json", "w") as f:
        json.dump({"class_to_idx": class_to_idx, "idx_to_class": idx_to_class}, f, indent=2)

    # Load MobileNetV3-Small pretrained on ImageNet
    print("==> Loading pretrained MobileNetV3-Small backbone...")
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

    # Freeze earlier feature extractor layers for fast transfer learning
    for param in model.features[:-4].parameters():
        param.requires_grad = False

    # Replace the classification head
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW([
        {"params": model.features[-4:].parameters(), "lr": lr * 0.1},
        {"params": model.classifier.parameters(), "lr": lr}
    ], weight_decay=1e-4)

    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    best_weights_path = output_dir / "ewaste_classifier.pt"
    history = []

    print("\n" + "=" * 65)
    print(f"{'Epoch':<8} | {'Train Loss':<12} | {'Train Acc':<10} | {'Val Loss':<10} | {'Val Acc':<10} | {'Time':<8}")
    print("=" * 65)

    for epoch in range(1, epochs + 1):
        start_time = time.time()
        
        # --- Training ---
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for images, targets in train_loader:
            images = images.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            train_total += targets.size(0)
            train_correct += predicted.eq(targets).sum().item()

        epoch_train_loss = train_loss / train_total
        epoch_train_acc = train_correct / train_total

        # --- Validation ---
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, targets in val_loader:
                images = images.to(device)
                targets = targets.to(device)

                outputs = model(images)
                loss = criterion(outputs, targets)

                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                val_total += targets.size(0)
                val_correct += predicted.eq(targets).sum().item()

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = val_correct / val_total
        scheduler.step()

        elapsed = time.time() - start_time
        print(f"{epoch:<8} | {epoch_train_loss:<12.4f} | {epoch_train_acc*100:<9.2f}% | {epoch_val_loss:<10.4f} | {epoch_val_acc*100:<9.2f}% | {elapsed:<6.1f}s")

        history.append({
            "epoch": epoch,
            "train_loss": epoch_train_loss,
            "train_acc": epoch_train_acc,
            "val_loss": epoch_val_loss,
            "val_acc": epoch_val_acc,
            "time_seconds": elapsed
        })

        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "class_names": class_names,
                "val_acc": best_val_acc,
                "epoch": epoch,
                "architecture": "mobilenet_v3_small"
            }, best_weights_path)
            print(f"    --> Saved new best checkpoint (Val Acc: {best_val_acc*100:.2f}%) to {best_weights_path}")

    print("=" * 65)
    print(f"Training Complete! Best Validation Accuracy: {best_val_acc*100:.2f}%")
    
    with open(output_dir / "training_history.json", "w") as f:
        json.dump(history, f, indent=2)

    return best_weights_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CircularTech AI e-waste classifier")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    train_model(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
