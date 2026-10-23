# CircularTech AI — Vision Model Evaluation Report

> **Model Architecture:** MobileNetV3-Small (Transfer Learning from ImageNet)  
> **Dataset:** E-Tadweer Image Dataset (ETID) — 6,269 images (7 categories)  
> **Test Samples:** 947  
> **Overall Test Accuracy:** **97.78%**  
> **Evaluation Date:** Current Evaluation

---

## 1. Overall Performance Summary

| Metric | Score |
|---|---|
| **Overall Accuracy** | **97.78%** |
| **Macro Average F1-Score** | **97.74%** |
| **Weighted Average F1-Score** | **97.78%** |

---

## 2. Per-Class Precision, Recall, and F1-Score

| Category | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **battery** | 98.6% | 96.3% | 97.5% | 219.0 |
| **cable** | 96.6% | 100.0% | 98.2% | 28.0 |
| **circuit_board** | 97.3% | 98.9% | 98.1% | 181.0 |
| **keyboard** | 99.0% | 97.1% | 98.1% | 104.0 |
| **laptop** | 98.7% | 93.8% | 96.2% | 80.0 |
| **mobile_phone** | 95.4% | 98.2% | 96.8% | 169.0 |
| **mouse** | 98.8% | 100.0% | 99.4% | 166.0 |
| **Macro Avg** | 97.8% | 97.8% | 97.7% | 947 |
| **Weighted Avg** | 97.8% | 97.8% | 97.8% | 947 |

---

## 3. Confusion Matrix

The confusion matrix below illustrates the distribution of true vs predicted classes across the test partition:

```text
[[211   1   4   0   0   3   0]
 [  0  28   0   0   0   0   0]
 [  1   0 179   1   0   0   0]
 [  0   0   0 101   1   2   0]
 [  1   0   1   0  75   3   0]
 [  1   0   0   0   0 166   2]
 [  0   0   0   0   0   0 166]]
```

Image plot saved to: `docs/confusion_matrix.png`

---

## 4. Key Observations & Edge Cases
1. **High Confidence Classes:** Classes with distinct geometries (such as `keyboard`, `mouse`, and `cable`) show very high discriminative accuracy.
2. **Close Visual Resemblance:** Phones and small tablets or thin laptops occasionally overlap depending on angle and bezel visibility.
3. **Safety & Verification:** Model confidence is surfaced directly in the UI as a percentage, and users are always prompted to confirm or correct the predicted category before proceeding to decision evaluation.
