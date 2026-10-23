"""
CircularTech AI — Recovery Recommendation Decision Engine
Deterministic, transparent, rule-based expert engine for e-waste lifecycle guidance.
Follows a strict safety-first priority hierarchy with complete explainability.
"""

from typing import List, Optional, Tuple
from backend.app.schemas import (
    DeviceAssessmentInput,
    RecommendationOutput,
    RecoveryPathway,
    FinancialSummary,
    FunctionalCondition,
    BatteryCondition,
    BatterySafetyConcern,
    WarrantyStatus,
    UserPreference,
    DeviceCategory
)

DECISION_ENGINE_VERSION = "1.0.0"
ECONOMIC_REPAIR_THRESHOLD = 0.60 # Repair is viable if repair_cost <= 60% of post-repair value
OBSOLETE_AGE_THRESHOLD_YEARS = 9.0

def recommend_recovery(device: DeviceAssessmentInput) -> RecommendationOutput:
    reasons: List[str] = []
    warnings: List[str] = []
    missing_info: List[str] = []
    next_steps: List[str] = []
    financial_summary: Optional[FinancialSummary] = None
    alternative_pathway: Optional[RecoveryPathway] = None
    safety_alert: Optional[str] = None

    # Calculate financial metrics ONLY if relevant values are explicitly present
    econ = device.economics
    repair_cost = econ.estimated_repair_cost
    post_repair_value = econ.estimated_post_repair_value
    currency = econ.currency or "INR"

    if repair_cost is not None and post_repair_value is not None:
        net_val = round(post_repair_value - repair_cost, 2)
        ratio = round(repair_cost / post_repair_value, 4) if post_repair_value > 0 else 999.0
        viable = ratio <= ECONOMIC_REPAIR_THRESHOLD and net_val > 0
        financial_summary = FinancialSummary(
            net_value_after_repair=net_val,
            repair_cost_ratio=ratio,
            is_financially_viable=viable,
            currency=currency
        )
    elif repair_cost is None and device.functional_condition in [
        FunctionalCondition.functional_minor_issues,
        FunctionalCondition.partially_functional,
        FunctionalCondition.does_not_power_on
    ]:
        missing_info.append("Estimated repair cost (get a shop quote to confirm financial viability)")

    if post_repair_value is None and device.functional_condition in [
        FunctionalCondition.functional_minor_issues,
        FunctionalCondition.partially_functional
    ]:
        missing_info.append("Estimated device value after repair (market resale benchmark)")

    # Data privacy check for digital storage devices
    device_stores_data = device.category in [
        DeviceCategory.phone,
        DeviceCategory.laptop,
        DeviceCategory.tablet,
        DeviceCategory.desktop
    ] or device.has_personal_data is True

    # =========================================================================
    # RULE 0: Critical Battery Safety & Hazard Override (Highest Priority)
    # =========================================================================
    is_battery_hazard = (
        device.battery.safety_concern in [
            BatterySafetyConcern.swollen,
            BatterySafetyConcern.leaking,
            BatterySafetyConcern.overheating,
            BatterySafetyConcern.punctured
        ] or device.battery.condition == BatteryCondition.swollen_damaged
    )

    if is_battery_hazard:
        hazard_type = device.battery.safety_concern.value if device.battery.safety_concern != BatterySafetyConcern.none_known else "swollen/damaged"
        safety_alert = (
            f"CRITICAL SAFETY WARNING: Reported battery condition is '{hazard_type}'. "
            "Do not charge, power on, puncture, or attempt to disassemble or repair the device. "
            "Keep the device in a cool, well-ventilated, fire-safe container away from combustible materials "
            "and take it immediately to an authorized hazardous battery collection center."
        )
        warnings.append("Acute safety risk: Compromised lithium-ion batteries present severe thermal runaway and chemical hazards.")
        reasons.append(f"Battery integrity failure ({hazard_type}) overrides all standard reuse or repair options.")
        next_steps.extend([
            "Disconnect any charging cables immediately.",
            "Do not attempt home disassembly or battery removal.",
            "Place the device in a non-flammable buffer (metal box or sand container if swollen).",
            "Deliver to an authorized hazardous e-waste / battery drop-off center."
        ])

        return RecommendationOutput(
            pathway=RecoveryPathway.AUTHORIZED_RECYCLING,
            headline="Immediate Authorized Hazardous E-Waste Handling Required",
            explanation="The device cannot be safely used or repaired due to critical battery compromise.",
            reasons=reasons,
            warnings=warnings,
            safety_alert=safety_alert,
            missing_information=missing_info,
            next_steps=next_steps,
            alternative_pathway=None,
            financial_summary=financial_summary,
            decision_version=DECISION_ENGINE_VERSION
        )

    # Battery health degradation advisory (non-hazardous)
    if device.battery.health_percentage is not None and device.battery.health_percentage < 70:
        warnings.append(f"Reported battery health is low ({device.battery.health_percentage}%). Battery replacement may be needed for practical mobile use.")

    # =========================================================================
    # RULE 1: Active Warranty & Manufacturer Service
    # =========================================================================
    has_active_warranty = (device.warranty_status == WarrantyStatus.active)
    has_fault = device.functional_condition not in [FunctionalCondition.fully_functional]

    if has_active_warranty and has_fault:
        reasons.append("Device has an active warranty and an existing operational fault.")
        warnings.append("Do not open the device or pay unauthorized third-party technicians, as this will likely void your warranty coverage.")
        next_steps.append("File an official warranty service claim with the manufacturer or authorized warranty center first.")

    # =========================================================================
    # RULE 2: Fully Functional Devices
    # =========================================================================
    if device.functional_condition == FunctionalCondition.fully_functional:
        if device_stores_data:
            warnings.append("Data Security: Device stores personal or corporate information. Ensure a verified cryptographic factory reset is performed before transferring.")

        if device.user_preference == UserPreference.sell_donate:
            reasons.append("The device is reported fully functional and you requested resale or donation.")
            reasons.append("Transferring a working device to a secondary user prevents new product manufacturing emissions.")
            next_steps.extend([
                "Perform full data backup and cloud account unlinking (iCloud, Google, Microsoft).",
                "Execute factory reset and confirm device wipes successfully.",
                "Remove all physical SIM cards and external memory cards.",
                "List on certified resale platforms or donate to educational / charitable organizations."
            ])
            return RecommendationOutput(
                pathway=RecoveryPathway.RESELL_DONATE,
                headline="Resell or Donate — Give Your Functional Device a Second Home",
                explanation="Your device is fully operational. Re-homing it maximizes its economic value and minimizes environmental footprint.",
                reasons=reasons,
                warnings=warnings,
                safety_alert=None,
                missing_information=missing_info,
                next_steps=next_steps,
                alternative_pathway=RecoveryPathway.REUSE_CONTINUE,
                financial_summary=financial_summary,
                decision_version=DECISION_ENGINE_VERSION
            )
        else:
            reasons.append("The device is reported fully functional with no safety hazards.")
            reasons.append("Continuing to use existing hardware is the most environmentally beneficial circular outcome.")
            next_steps.extend([
                "Clean dust buildup from vents, fans, and connection ports.",
                "Ensure operating system and security patches are up to date.",
                "Optimize battery charging habits (avoid continuous 100% plug-in if supported)."
            ])
            return RecommendationOutput(
                pathway=RecoveryPathway.REUSE_CONTINUE,
                headline="Continue Using — Best Environmental & Financial Outcome",
                explanation="Your device remains functional and useful. Continued active use prevents unnecessary e-waste generation.",
                reasons=reasons,
                warnings=warnings,
                safety_alert=None,
                missing_information=missing_info,
                next_steps=next_steps,
                alternative_pathway=RecoveryPathway.RESELL_DONATE if device.user_preference == UserPreference.unsure else None,
                financial_summary=financial_summary,
                decision_version=DECISION_ENGINE_VERSION
            )

    # =========================================================================
    # RULE 3: Repairable Issue with Financial Evaluation
    # =========================================================================
    if device.functional_condition in [
        FunctionalCondition.functional_minor_issues,
        FunctionalCondition.partially_functional
    ]:
        if financial_summary is not None:
            if financial_summary.is_financially_viable:
                reasons.append(f"Repair cost ({currency} {repair_cost:,.0f}) is viable: represents {financial_summary.repair_cost_ratio*100:.1f}% of estimated post-repair value ({currency} {post_repair_value:,.0f}).")
                reasons.append(f"Projected net equity after repair: {currency} {financial_summary.net_value_after_repair:,.0f}.")
                next_steps.extend([
                    "Obtain a written repair estimate and warranty from a certified technician.",
                    "Verify replacement part authenticity and labor warranty (at least 90 days recommended).",
                    "Back up data prior to handing the device to a repair technician."
                ])
                return RecommendationOutput(
                    pathway=RecoveryPathway.REPAIR,
                    headline="Repair Recommended — Economically Viable Restoration",
                    explanation="Repairing this device is practical and financially justified based on your cost and value estimates.",
                    reasons=reasons,
                    warnings=warnings,
                    safety_alert=None,
                    missing_information=missing_info,
                    next_steps=next_steps,
                    alternative_pathway=RecoveryPathway.REFURBISH_ASSESS,
                    financial_summary=financial_summary,
                    decision_version=DECISION_ENGINE_VERSION
                )
            else:
                reasons.append(f"Estimated repair cost ({currency} {repair_cost:,.0f}) exceeds the economic viability threshold ({financial_summary.repair_cost_ratio*100:.1f}% of post-repair value).")
                warnings.append("Investing in repairs may cost more than acquiring an equivalent refurbished device.")
                next_steps.extend([
                    "Evaluate if specific functional components (RAM, SSD, screen) can be salvaged for spare parts.",
                    "Ensure personal data is completely destroyed or sanitized.",
                    "Deliver remaining hardware to an authorized R2 / e-Stewards certified recycler for materials recovery."
                ])
                return RecommendationOutput(
                    pathway=RecoveryPathway.AUTHORIZED_RECYCLING,
                    headline="Authorized Recycling Recommended — Uneconomic to Repair",
                    explanation="Repairing this unit is uneconomic compared to its anticipated market value after repair.",
                    reasons=reasons,
                    warnings=warnings,
                    safety_alert=None,
                    missing_information=missing_info,
                    next_steps=next_steps,
                    alternative_pathway=RecoveryPathway.REFURBISH_ASSESS,
                    financial_summary=financial_summary,
                    decision_version=DECISION_ENGINE_VERSION
                )
        else:
            # No financial quote provided
            reasons.append("Device is partially functional or has minor issues, but complete repair cost quotes were not supplied.")
            next_steps.extend([
                "Request a diagnostics estimate from an authorized repair technician.",
                "Compare repair cost against the price of an equivalent working device.",
                "Re-run this assessment with the quote to determine financial viability."
            ])
            return RecommendationOutput(
                pathway=RecoveryPathway.REFURBISH_ASSESS,
                headline="Professional Assessment Recommended",
                explanation="The device appears salvageable, but financial quotes are needed to confirm whether repair makes economic sense.",
                reasons=reasons,
                warnings=warnings,
                safety_alert=None,
                missing_information=missing_info,
                next_steps=next_steps,
                alternative_pathway=RecoveryPathway.REPAIR,
                financial_summary=None,
                decision_version=DECISION_ENGINE_VERSION
            )

    # =========================================================================
    # RULE 4: Does Not Power On or Water Damage
    # =========================================================================
    if device.functional_condition == FunctionalCondition.does_not_power_on or device.water_damage is True:
        age = device.device_age_years or (2026 - device.purchase_year if device.purchase_year else None)
        if age is not None and age >= OBSOLETE_AGE_THRESHOLD_YEARS:
            reasons.append(f"Device does not power on / has liquid damage and is approximately {age:.1f} years old.")
            reasons.append("Board-level diagnostics and obsolete microchip sourcing typically exceed practical recovery value.")
            next_steps.extend([
                "Remove any separate storage drives (SSD/HDD) to recover data independently if needed.",
                "Deliver device to an authorized e-waste recycler for raw mineral and precious metal extraction."
            ])
            return RecommendationOutput(
                pathway=RecoveryPathway.AUTHORIZED_RECYCLING,
                headline="Authorized Recycling — Advanced Age & Non-Functional Hardware",
                explanation="Severe non-power or liquid issues on aging hardware generally cannot be repaired economically.",
                reasons=reasons,
                warnings=warnings,
                safety_alert=None,
                missing_information=missing_info,
                next_steps=next_steps,
                alternative_pathway=None,
                financial_summary=financial_summary,
                decision_version=DECISION_ENGINE_VERSION
            )
        else:
            reasons.append("Device does not power on or suffered moisture ingress; cause cannot be established by visual inspection.")
            warnings.append("Do not attempt repeated power-on attempts after water exposure, as it can cause short-circuit board corrosion.")
            next_steps.extend([
                "Have a qualified technician perform multimeter board-level power rail diagnostics.",
                "Check for blown capacitors, charging IC damage, or blown fuses.",
                "Obtain a written repair estimate before proceeding."
            ])
            return RecommendationOutput(
                pathway=RecoveryPathway.REFURBISH_ASSESS,
                headline="Professional Diagnostic Inspection Needed",
                explanation="A technician must test power rails and internal circuitry to diagnose the root cause.",
                reasons=reasons,
                warnings=warnings,
                safety_alert=None,
                missing_information=missing_info,
                next_steps=next_steps,
                alternative_pathway=RecoveryPathway.AUTHORIZED_RECYCLING,
                financial_summary=financial_summary,
                decision_version=DECISION_ENGINE_VERSION
            )

    # =========================================================================
    # RULE 5: Physically Damaged or Extreme Obsolescence
    # =========================================================================
    if device.functional_condition == FunctionalCondition.physically_damaged:
        reasons.append("Extensive physical structural damage reported.")
        next_steps.extend([
            "Check if any modular sub-assemblies (chassis, brackets, power supply) can be salvaged.",
            "Recycle remainder through an authorized e-waste collector."
        ])
        return RecommendationOutput(
            pathway=RecoveryPathway.AUTHORIZED_RECYCLING,
            headline="Authorized Recycling — Severe Physical Damage",
            explanation="Physical trauma usually damages interconnected flex cables and board traces beyond reliable repair.",
            reasons=reasons,
            warnings=warnings,
            safety_alert=None,
            missing_information=missing_info,
            next_steps=next_steps,
            alternative_pathway=RecoveryPathway.REFURBISH_ASSESS,
            financial_summary=financial_summary,
            decision_version=DECISION_ENGINE_VERSION
        )

    # =========================================================================
    # RULE 6: Unknown Condition / Needs More Info
    # =========================================================================
    missing_info.append("Working condition (test if device powers on and screen displays)")
    reasons.append("Functional condition was marked as unknown or untested.")
    next_steps.append("Test the device with a compatible charger to observe power indicators or display output.")

    return RecommendationOutput(
        pathway=RecoveryPathway.NEEDS_MORE_INFO,
        headline="Additional Device Information Required",
        explanation="We need more details on whether the device powers on or functions to formulate a confident pathway recommendation.",
        reasons=reasons,
        warnings=warnings,
        safety_alert=None,
        missing_information=missing_info,
        next_steps=next_steps,
        alternative_pathway=None,
        financial_summary=financial_summary,
        decision_version=DECISION_ENGINE_VERSION
    )
