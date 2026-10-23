#!/usr/bin/env python3
"""
CircularTech AI — Dataset Preparation Script
Extracts, cleans, and splits the E-Tadweer Image Dataset (ETID) into train/val/test splits.
"""

import os
import sys
import shutil
import zipfile
import random
from pathlib import Path
from PIL import Image

CLASS_MAPPING = {
    "Battery": "battery",
    "Cable": "cable",
    "Keyboard": "keyboard",
    "Laptop": "laptop",
    "Mobile": "mobile_phone",
    "Mouse": "mouse",
    "PCB": "circuit_board"
}

DEFAULT_ZIP_PATH = Path("/Users/sandeshj/Downloads/E-Tadweer Image Dataset (ETID).zip")
TARGET_DATASET_DIR = Path("/Users/sandeshj/CircularTech-AI/datasets/etid")

def is_valid_image(image_path: Path) -> bool:
    try:
        with Image.open(image_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def extract_and_prepare(
    zip_path: Path = DEFAULT_ZIP_PATH,
    output_dir: Path = TARGET_DATASET_DIR,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
):
    if not zip_path.exists():
        print(f"Error: Dataset archive not found at {zip_path}")
        sys.exit(1)

    print(f"==> Inspecting archive: {zip_path} ({zip_path.stat().st_size / 1e9:.2f} GB)")
    random.seed(random_seed)

    raw_dir = output_dir.parent / "raw_etid"
    if raw_dir.exists():
        shutil.rmtree(raw_dir)
    raw_dir.mkdir(parents=True, exist_ok=True)

    print("==> Extracting outer and inner archives...")
    with zipfile.ZipFile(zip_path, 'r') as outer_zip:
        inner_zips = [f for f in outer_zip.namelist() if f.endswith(".zip")]
        if inner_zips:
            inner_name = inner_zips[0]
            print(f"    Extracting nested archive {inner_name}...")
            # Extract inner zip directly to disk first
            temp_inner_zip_path = raw_dir / "inner.zip"
            with open(temp_inner_zip_path, "wb") as f_inner:
                f_inner.write(outer_zip.read(inner_name))
            
            print("    Unpacking nested image directory...")
            with zipfile.ZipFile(temp_inner_zip_path, 'r') as inner_zip:
                inner_zip.extractall(raw_dir)
            temp_inner_zip_path.unlink() # delete intermediate zip
        else:
            outer_zip.extractall(raw_dir)

    print("==> Indexing extracted images by category...")
    class_files = {target_cls: [] for target_cls in CLASS_MAPPING.values()}

    for root, dirs, files in os.walk(raw_dir):
        if "__MACOSX" in root:
            continue
        folder_name = os.path.basename(root)
        if folder_name in CLASS_MAPPING:
            target_cls = CLASS_MAPPING[folder_name]
            for f in files:
                if f.startswith(".") or not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    continue
                full_path = Path(root) / f
                if is_valid_image(full_path):
                    class_files[target_cls].append(full_path)

    print("\n==> Valid images verified:")
    total_valid = 0
    for target_cls, files in sorted(class_files.items()):
        print(f"    - {target_cls:15s}: {len(files):5d} images")
        total_valid += len(files)
    print(f"    Total: {total_valid} images")

    # Clean existing destination splits
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    for split in ["train", "val", "test"]:
        for target_cls in CLASS_MAPPING.values():
            (output_dir / split / target_cls).mkdir(parents=True, exist_ok=True)

    print("\n==> Splitting into train / val / test...")
    stats = {
        "train": {c: 0 for c in CLASS_MAPPING.values()},
        "val": {c: 0 for c in CLASS_MAPPING.values()},
        "test": {c: 0 for c in CLASS_MAPPING.values()}
    }

    for target_cls, files in class_files.items():
        random.shuffle(files)
        n_total = len(files)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        splits = {
            "train": files[:n_train],
            "val": files[n_train:n_train + n_val],
            "test": files[n_train + n_val:]
        }

        for split_name, split_files in splits.items():
            dest_dir = output_dir / split_name / target_cls
            for idx, img_path in enumerate(split_files):
                dest_path = dest_dir / f"{target_cls}_{idx:05d}{img_path.suffix.lower()}"
                shutil.copy2(img_path, dest_path)
                stats[split_name][target_cls] += 1

    # Cleanup temporary raw directory
    shutil.rmtree(raw_dir)

    print("\n==> Final Partitioning Complete:")
    print(f"{'Class':<16} | {'Train':<8} | {'Val':<8} | {'Test':<8} | {'Total':<8}")
    print("-" * 56)
    for target_cls in sorted(CLASS_MAPPING.values()):
        tr = stats["train"][target_cls]
        va = stats["val"][target_cls]
        te = stats["test"][target_cls]
        tot = tr + va + te
        print(f"{target_cls:<16} | {tr:<8} | {va:<8} | {te:<8} | {tot:<8}")

    total_tr = sum(stats["train"].values())
    total_va = sum(stats["val"].values())
    total_te = sum(stats["test"].values())
    print("-" * 56)
    print(f"{'TOTAL':<16} | {total_tr:<8} | {total_va:<8} | {total_te:<8} | {total_tr+total_va+total_te:<8}")
    print(f"\nDataset successfully prepared at: {output_dir}")

if __name__ == "__main__":
    extract_and_prepare()
