"""
CircularTech AI — Comprehensive Test Suite for Decision Engine
Validates all recovery pathways, battery safety overrides, economic formulas,
and edge cases according to project specification.
"""

import pytest
from backend.app.schemas import (
    DeviceAssessmentInput,
    DeviceCategory,
    FunctionalCondition,
    BatteryAssessment,
    BatteryCondition,
    BatterySafetyConcern,
    WarrantyStatus,
    EconomicMetrics,
    UserPreference,
    RecoveryPathway
)
from backend.app.services.decision_engine import recommend_recovery, ECONOMIC_REPAIR_THRESHOLD

def test_fully_functional_laptop_reuse():
    """Case 1: Fully functional device defaults to REUSE_CONTINUE."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.laptop,
        functional_condition=FunctionalCondition.fully_functional,
        battery=BatteryAssessment(health_percentage=85, condition=BatteryCondition.good),
        warranty_status=WarrantyStatus.expired,
        user_preference=UserPreference.keep_repair
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.REUSE_CONTINUE
    assert result.safety_alert is None
    assert any("functional" in r.lower() for r in result.reasons)

def test_fully_functional_resell_donate():
    """Case 1b: Fully functional device with sell/donate preference -> RESELL_DONATE."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.phone,
        functional_condition=FunctionalCondition.fully_functional,
        battery=BatteryAssessment(health_percentage=90, condition=BatteryCondition.good),
        user_preference=UserPreference.sell_donate,
        has_personal_data=True
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.RESELL_DONATE
    # Verify data sanitization next steps are included
    assert any("reset" in s.lower() or "backup" in s.lower() for s in result.next_steps)

def test_economically_viable_repair():
    """Case 2: Minor issues with repair cost well below post-repair value -> REPAIR."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.phone,
        functional_condition=FunctionalCondition.functional_minor_issues,
        battery=BatteryAssessment(condition=BatteryCondition.good),
        economics=EconomicMetrics(
            estimated_repair_cost=1500,
            estimated_post_repair_value=5000,
            currency="INR"
        )
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.REPAIR
    assert result.financial_summary is not None
    assert result.financial_summary.is_financially_viable is True
    assert result.financial_summary.repair_cost_ratio == 0.30
    assert result.financial_summary.net_value_after_repair == 3500

def test_uneconomic_repair_recycle():
    """Case 3: Repair cost exceeds viability threshold -> AUTHORIZED_RECYCLING."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.monitor,
        functional_condition=FunctionalCondition.partially_functional,
        economics=EconomicMetrics(
            estimated_repair_cost=4000,
            estimated_post_repair_value=5000, # 80% ratio > 60% threshold
            currency="INR"
        )
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.AUTHORIZED_RECYCLING
    assert result.financial_summary is not None
    assert result.financial_summary.is_financially_viable is False
    assert result.alternative_pathway == RecoveryPathway.REFURBISH_ASSESS

def test_does_not_power_on_professional_assessment():
    """Case 4: Device does not power on, no quotes -> REFURBISH_ASSESS."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.laptop,
        device_age_years=3.0,
        functional_condition=FunctionalCondition.does_not_power_on
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.REFURBISH_ASSESS
    assert any("diagnost" in r.lower() or "power" in r.lower() for r in result.reasons)

def test_active_warranty_claim_priority():
    """Case 5: Active warranty with fault flags OEM claim first."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.laptop,
        functional_condition=FunctionalCondition.functional_minor_issues,
        warranty_status=WarrantyStatus.active,
        warranty_remaining_months=6
    )
    result = recommend_recovery(device)
    assert any("warranty" in s.lower() for s in result.next_steps)
    assert any("warranty" in w.lower() for w in result.warnings)

def test_battery_swollen_hazard_override():
    """Case 6: Swollen battery triggers critical safety override to AUTHORIZED_RECYCLING."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.phone,
        functional_condition=FunctionalCondition.fully_functional, # Even if reported working!
        battery=BatteryAssessment(
            condition=BatteryCondition.swollen_damaged,
            safety_concern=BatterySafetyConcern.swollen
        ),
        economics=EconomicMetrics(
            estimated_repair_cost=500,
            estimated_post_repair_value=10000
        )
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.AUTHORIZED_RECYCLING
    assert result.safety_alert is not None
    assert "CRITICAL SAFETY WARNING" in result.safety_alert
    assert "swollen" in result.safety_alert
    # Standard repair/resale should be overridden completely
    assert any("battery integrity" in r.lower() for r in result.reasons)

def test_missing_repair_and_resale_values():
    """Case 7: Partial functionality with missing economics -> REFURBISH_ASSESS with missing info."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.laptop,
        functional_condition=FunctionalCondition.partially_functional,
        economics=EconomicMetrics() # Empty metrics
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.REFURBISH_ASSESS
    assert len(result.missing_information) > 0
    assert any("repair cost" in m.lower() for m in result.missing_information)

def test_unknown_condition_needs_more_info():
    """Case 8: Unknown / untested condition -> NEEDS_MORE_INFO."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.tablet,
        functional_condition=FunctionalCondition.unknown_not_tested
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.NEEDS_MORE_INFO
    assert len(result.missing_information) > 0

def test_obsolete_aged_nonfunctional_device():
    """Case 9: 12-year-old non-powering device -> AUTHORIZED_RECYCLING."""
    device = DeviceAssessmentInput(
        category=DeviceCategory.desktop,
        purchase_year=2012,
        device_age_years=14.0,
        functional_condition=FunctionalCondition.does_not_power_on
    )
    result = recommend_recovery(device)
    assert result.pathway == RecoveryPathway.AUTHORIZED_RECYCLING
    assert any("age" in r.lower() or "obsolete" in r.lower() for r in result.reasons)
