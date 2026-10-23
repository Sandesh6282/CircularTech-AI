"""
CircularTech AI — Pydantic Data Contracts & Schemas
Defines all input, output, and domain entities for device assessments,
image category predictions, and recovery pathway recommendations.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DeviceCategory(str, Enum):
    phone = "phone"
    laptop = "laptop"
    tablet = "tablet"
    monitor = "monitor"
    tv = "tv"
    desktop = "desktop"
    printer = "printer"
    charger_cable = "charger_cable"
    battery = "battery"
    circuit_board = "circuit_board"
    other = "other"

class FunctionalCondition(str, Enum):
    fully_functional = "fully_functional"
    functional_minor_issues = "functional_minor_issues"
    partially_functional = "partially_functional"
    does_not_power_on = "does_not_power_on"
    physically_damaged = "physically_damaged"
    unknown_not_tested = "unknown_not_tested"

class BatteryCondition(str, Enum):
    good = "good"
    degraded = "degraded"
    swollen_damaged = "swollen_damaged"
    not_applicable = "not_applicable"
    unknown = "unknown"

class BatterySafetyConcern(str, Enum):
    none_known = "none_known"
    swollen = "swollen"
    leaking = "leaking"
    overheating = "overheating"
    punctured = "punctured"
    unknown = "unknown"

class WarrantyStatus(str, Enum):
    active = "active"
    expired = "expired"
    unknown = "unknown"

class UserPreference(str, Enum):
    keep_repair = "keep_repair"
    sell_donate = "sell_donate"
    recycle = "recycle"
    unsure = "unsure"

class RecoveryPathway(str, Enum):
    REUSE_CONTINUE = "Reuse / Continue using"
    REPAIR = "Repair"
    REFURBISH_ASSESS = "Refurbish / Professionally assess"
    RESELL_DONATE = "Resell / Donate"
    AUTHORIZED_RECYCLING = "Authorized recycling"
    NEEDS_MORE_INFO = "Needs more information"

# --- Models ---

class BatteryAssessment(BaseModel):
    health_percentage: Optional[int] = Field(None, ge=0, le=100, description="Battery health percentage 0-100")
    typical_runtime_hours: Optional[float] = Field(None, ge=0)
    condition: BatteryCondition = BatteryCondition.unknown
    replaceable: Optional[bool] = None
    replacement_cost: Optional[float] = Field(None, ge=0)
    safety_concern: BatterySafetyConcern = BatterySafetyConcern.none_known

class EconomicMetrics(BaseModel):
    estimated_repair_cost: Optional[float] = Field(None, ge=0)
    estimated_post_repair_value: Optional[float] = Field(None, ge=0)
    estimated_current_resale_value: Optional[float] = Field(None, ge=0)
    replacement_cost_equivalent: Optional[float] = Field(None, ge=0)
    repair_quote_source: Optional[str] = None
    currency: str = "INR"

class DeviceAssessmentInput(BaseModel):
    category: DeviceCategory
    category_confirmed_by_user: bool = True
    brand: Optional[str] = None
    model_name: Optional[str] = None
    purchase_year: Optional[int] = Field(None, ge=1970, le=2030)
    device_age_years: Optional[float] = Field(None, ge=0)
    approximate_weight_kg: Optional[float] = Field(None, ge=0)
    functional_condition: FunctionalCondition
    known_faults: Optional[str] = None
    screen_condition: Optional[str] = "unknown"
    water_damage: Optional[bool] = None
    charging_works: Optional[str] = "unknown"
    battery: BatteryAssessment = Field(default_factory=BatteryAssessment)
    warranty_status: WarrantyStatus = WarrantyStatus.unknown
    warranty_remaining_months: Optional[int] = Field(None, ge=0)
    economics: EconomicMetrics = Field(default_factory=EconomicMetrics)
    user_preference: UserPreference = UserPreference.unsure
    has_personal_data: Optional[bool] = None
    can_securely_reset: Optional[bool] = None
    user_notes: Optional[str] = None

class FinancialSummary(BaseModel):
    net_value_after_repair: Optional[float] = None
    repair_cost_ratio: Optional[float] = None
    is_financially_viable: Optional[bool] = None
    currency: str = "INR"

class RecommendationOutput(BaseModel):
    pathway: RecoveryPathway
    headline: str
    explanation: str
    reasons: List[str]
    warnings: List[str]
    safety_alert: Optional[str] = None
    missing_information: List[str]
    next_steps: List[str]
    alternative_pathway: Optional[RecoveryPathway] = None
    financial_summary: Optional[FinancialSummary] = None
    decision_version: str = "1.0.0"

class CandidatePrediction(BaseModel):
    category: str
    confidence: float

class CategoryPredictionOutput(BaseModel):
    predicted_category: DeviceCategory
    confidence: float
    model_name: str
    model_version: str
    top_candidates: List[CandidatePrediction]
    needs_user_confirmation: bool = True
    message: str = "Please verify or correct the predicted device category."
