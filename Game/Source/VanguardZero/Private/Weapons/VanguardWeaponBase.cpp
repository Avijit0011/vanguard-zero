// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "Weapons/VanguardWeaponBase.h"
#include "DrawDebugHelpers.h"
#include "Engine/World.h"

AVanguardWeaponBase::AVanguardWeaponBase()
{
    PrimaryActorTick.bCanEverTick = false;

    // Define original default recoil pattern (T-shaped recoil rise & spray)
    RecoilPattern.Add({ 0.0f, 0.0f });
    RecoilPattern.Add({ 0.8f, 0.0f });
    RecoilPattern.Add({ 1.8f, 0.1f });
    RecoilPattern.Add({ 3.0f, -0.2f });
    RecoilPattern.Add({ 4.2f, -0.5f });
    RecoilPattern.Add({ 5.0f, -0.8f });
    RecoilPattern.Add({ 5.2f, 0.6f });
    RecoilPattern.Add({ 5.3f, 0.9f });
}

void AVanguardWeaponBase::FireWeapon(FVector CameraLocation, FVector CameraDirection, bool bIsCharacterMoving, bool bIsCrouching)
{
    if (CurrentAmmo <= 0) return;

    CurrentAmmo--;

    float CurrentTime = GetWorld()->GetTimeSeconds();
    if (CurrentTime - LastShotTimestamp > 0.4f)
    {
        CurrentShotCount = 0; // Reset recoil pattern after pause
    }
    LastShotTimestamp = CurrentTime;

    // Determine recoil offset from pattern
    FVanguardRecoilPoint RecoilOffset = RecoilPattern[FMath::Min(CurrentShotCount, RecoilPattern.Num() - 1)];
    CurrentShotCount++;

    // Calculate spread penalty
    float RandomSpread = 0.0f;
    if (bIsCharacterMoving)
    {
        RandomSpread += MovementSpreadPenalty;
    }
    if (bIsCrouching)
    {
        RandomSpread *= 0.6f;
    }

    // Fire Raycast / Hitscan Trace
    FVector FireDirection = CameraDirection;
    FireDirection += FVector(0, FMath::RandRange(-RandomSpread, RandomSpread) * 0.01f, (RecoilOffset.PitchOffset + FMath::RandRange(-RandomSpread, RandomSpread)) * 0.01f);
    FireDirection.Normalize();

    FVector TraceEnd = CameraLocation + (FireDirection * 10000.0f);

    FHitResult HitResult;
    FCollisionQueryParams QueryParams;
    QueryParams.AddIgnoredActor(this);

    bool bHit = GetWorld()->LineTraceSingleByChannel(HitResult, CameraLocation, TraceEnd, ECC_Visibility, QueryParams);

    if (bHit && HitResult.GetActor())
    {
        bool bIsHeadshot = HitResult.BoneName.ToString().Contains(TEXT("head"));
        // Apply custom damage to target character
    }
}

void AVanguardWeaponBase::ReloadWeapon()
{
    CurrentAmmo = MagazineCapacity;
    CurrentShotCount = 0;
}
