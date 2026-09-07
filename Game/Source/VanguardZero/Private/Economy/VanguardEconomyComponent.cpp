// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "Economy/VanguardEconomyComponent.h"

UVanguardEconomyComponent::UVanguardEconomyComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UVanguardEconomyComponent::BuyWeapon(FString WeaponID, int32 Cost)
{
    if (CurrentCredits >= Cost)
    {
        CurrentCredits -= Cost;
        return true;
    }
    return false;
}

bool UVanguardEconomyComponent::BuyArmor(int32 ArmorTier, int32 Cost)
{
    if (CurrentCredits >= Cost)
    {
        CurrentCredits -= Cost;
        return true;
    }
    return false;
}

bool UVanguardEconomyComponent::BuyAbilityCharge(int32 AbilitySlot, int32 Cost)
{
    if (CurrentCredits >= Cost)
    {
        CurrentCredits -= Cost;
        return true;
    }
    return false;
}

void UVanguardEconomyComponent::AddCredits(int32 Amount)
{
    CurrentCredits = FMath::Min(MaxCredits, CurrentCredits + Amount);
}
