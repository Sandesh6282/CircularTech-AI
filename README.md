# CircularTech AI — E-Waste Recovery Intelligence

> **Tagline:** *Give Every Device a Second Life*  
> **Mission:** Transform e-waste management with transparent, explainable AI that guides households, institutions, and repairers to the optimal recovery pathway: **Reuse**, **Repair**, **Refurbish**, **Resell/Donate**, or **Certified Hazardous Recycling**.

[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Test Set Accuracy](https://img.shields.io/badge/Model%20Accuracy-97.8%25-brightgreen.svg)](#model-performance)
[![Decision Engine Tests](https://img.shields.io/badge/pytest-15%2F15%20passing-success.svg)](#testing)

---

## 1. Problem Statement

Electronic waste (e-waste) is the world's fastest-growing domestic waste stream, generating over **62 million metric tonnes** annually. Less than **23%** is documented as formally collected and recycled. 

Devices are frequently discarded prematurely even when minor repairs or battery replacements could extend their useful life by years. Conversely, users frequently store or improperly dispose of devices with compromised lithium-ion batteries (swollen, punctured, or leaking), causing toxic fires in landfills and municipal waste trucks.

**CircularTech AI solves this:**
- Visual computer vision identifies broad device categories from photos (with mandatory user confirmation).
- A deterministic, explainable decision engine analyzes condition, battery safety, remaining warranty, and economic repair ratios.
- Immediate safety overrides isolate hazardous batteries and direct users to authorized drop-off depots.
- Transparent mathematical explanations show *why* a specific recovery pathway was recommended.

---

## 2. System Architecture

```mermaid
graph TD
    User([User Device Photo + Metrics]) --> FE[Next.js 16 Responsive Frontend]
    
    subgraph Frontend Layer
        FE --> UI_Upload[Image Preview & Instant Scanner]
        FE --> UI_Form[Structured Assessment Form]
        FE --> UI_Presets[1-Click Demo Scenarios]
        FE --> UI_Result[Recommendation & Action Checklist Card]
    end

    subgraph Backend API (FastAPI)
        FE -->|POST /api/v1/predict-category| API_Predict[Vision Classifier API]
        FE -->|POST /api/v1/recommend| API_Recommend[Decision Engine API]
        
        API_Predict --> VisionModel[MobileNetV3-Small Classifier]
        API_Recommend --> DecisionRules[Deterministic Hierarchy Engine]
    end

    subgraph Intelligence Core
        VisionModel --> Weights[(Trained ETID Checkpoint - 97.8% Acc)]
        DecisionRules --> HazardGuard[Battery Thermal Runaway Override]
        DecisionRules --> EconFormula[Repair Cost Ratio: cost / post_value <= 0.6]
        DecisionRules --> PrivacyProtocol[Data Sanitization Checklist]
    end
```

---

## 3. Decision Engine Rule Hierarchy

The decision engine ([`backend/app/services/decision_engine.py`](backend/app/services/decision_engine.py)) strictly enforces an explainable, safety-first cascade:

| Priority | Rule Check | Condition | Recommended Pathway | Action / Output |
|---|---|---|---|---|
| **0** | **Safety Override** | Battery swollen, leaking, overheating, or punctured | `Authorized recycling` | **CRITICAL HAZARD ALERT**: Disconnect charger, isolate in fire-safe box, take to hazardous depot. |
| **1** | **Active Warranty** | Warranty active + operational fault | `Repair` / `Refurbish` | File OEM warranty claim first before paying third-party fees. |
| **2** | **Fully Functional** | Working device + Sell/Donate intention | `Resell / Donate` | Cryptographic factory reset + cloud account unlinking checklist. |
| **2b** | **Fully Functional** | Working device + Keep intention | `Reuse / Continue using` | OS maintenance, dust cleaning, and battery charging optimization. |
| **3** | **Economic Repair** | $\frac{\text{Repair Cost}}{\text{Post-Repair Value}} \le 0.60$ | `Repair` | Economically viable; displays net equity and written quote guidance. |
| **3b** | **Uneconomic Repair** | $\frac{\text{Repair Cost}}{\text{Post-Repair Value}} > 0.60$ | `Authorized recycling` | Repair costs exceed post-repair value; suggest parts salvage or recycling. |
| **4** | **Uncertain / No Power** | No boot or water contact, age < 9 yrs | `Refurbish / Professionally assess` | Multimeter power-rail diagnosis required before committing funds. |
| **5** | **Obsolescence** | Age $\ge 9$ years and non-functional | `Authorized recycling` | Obsolete microchips; route to certified recycler for metal recovery. |
| **6** | **Missing Data** | Untested or conflicting metrics | `Needs more information` | Clear prompt for missing shop quote or battery testing. |

---

## 4. Machine Learning & Model Performance

### Dataset: E-Tadweer Image Dataset (ETID)
- Curated benchmark dataset of **6,269 RGB images** across 7 common e-waste categories: `battery`, `cable`, `circuit_board`, `keyboard`, `laptop`, `mobile_phone`, `mouse`.
- Stratified 70/15/15 split: **Train (4,385)**, **Validation (937)**, **Test (947)**.

### Model Architecture
- **MobileNetV3-Small** transfer learning initialized from ImageNet weights.
- Trained on Apple Silicon MPS for 6 epochs with Cosine Annealing learning rate schedule.

### Evaluation on Held-Out Test Set (947 Images)
*Detailed report available in [`docs/evaluation.md`](docs/evaluation.md)*

| Category | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Battery** | 98.6% | 96.3% | **97.5%** | 219 |
| **Cable / Charger** | 96.6% | 100.0% | **98.2%** | 28 |
| **Circuit Board (PCB)** | 97.3% | 98.9% | **98.1%** | 181 |
| **Keyboard** | 99.0% | 97.1% | **98.1%** | 104 |
| **Laptop** | 98.7% | 93.8% | **96.2%** | 80 |
| **Mobile Phone** | 95.4% | 98.2% | **96.8%** | 169 |
| **Mouse** | 98.8% | 100.0% | **99.4%** | 166 |
| **Overall Accuracy** | — | — | **97.78%** | **947** |
| **Macro Average** | 97.8% | 97.8% | **97.74%** | 947 |

---

## 5. Quickstart & Installation

### Prerequisites
- Python 3.10+ (macOS / Linux / Windows)
- Node.js 18+ and npm

### 1. Clone & Set Up Python Backend
```bash
git clone https://github.com/Sandesh6282/CircularTech-AI.git
cd CircularTech-AI

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run full test suite
PYTHONPATH=. pytest backend/tests/
```

### 2. Start Backend API Server
```bash
source .venv/bin/activate
PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API documentation is automatically available at: `http://localhost:8000/docs`

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Testing & Quality Verification

Run all unit tests and API integration tests:
```bash
PYTHONPATH=. pytest backend/tests/ -v
```
All 15 automated test cases pass:
- `test_fully_functional_laptop_reuse` (Reuse pathway)
- `test_fully_functional_resell_donate` (Resell with data sanitization)
- `test_economically_viable_repair` (Cost ratio viable)
- `test_uneconomic_repair_recycle` (Cost ratio exceeded)
- `test_does_not_power_on_professional_assessment` (Technician assessment)
- `test_active_warranty_claim_priority` (Manufacturer warranty check)
- `test_battery_swollen_hazard_override` (Critical hazard alert override)
- `test_missing_repair_and_resale_values` (Missing data isolation)
- `test_unknown_condition_needs_more_info` (Unknown status prompt)
- `test_obsolete_aged_nonfunctional_device` (14-year-old hardware recycling)
- `test_health_endpoint` (API health check)
- `test_recommend_endpoint_success` (REST recommendation contract)
- `test_recommend_hazard_override` (REST safety alert contract)
- `test_predict_category_invalid_file_type` (Input file-type guard)
- `test_predict_category_valid_synthetic_image` (Vision model inference contract)

---

## 7. Ethical Engineering Principles

1. **Honest AI Bounds:** Computer vision is strictly bounded to device category identification. The system explicitly discloses to the user that external photos cannot establish internal board-level faults or battery chemical degradation.
2. **Safety First:** Swollen, leaking, or overheating batteries immediately override standard reuse/repair pathways with hazardous waste warnings.
3. **No Fabricated Data:** Unknown inputs are never silently treated as zero; the system prompts the user for missing quotes to evaluate financial viability accurately.
4. **Data Privacy First:** Devices that store sensitive personal data are provided with a dedicated data sanitization checklist prior to resale, donation, or recycling.