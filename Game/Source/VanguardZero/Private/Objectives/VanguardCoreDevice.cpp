// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "Objectives/VanguardCoreDevice.h"
#include "Kismet/GameplayStatics.h"

AVanguardCoreDevice::AVanguardCoreDevice()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AVanguardCoreDevice::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (CoreState == ECoreState::Planting)
    {
        CurrentPlantProgress += DeltaSeconds;
        if (CurrentPlantProgress >= TotalPlantDuration)
        {
            CompletePlanting();
        }
    }
    else if (CoreState == ECoreState::Active || CoreState == ECoreState::Defusing)
    {
        DetonationTimer -= DeltaSeconds;

        if (CoreState == ECoreState::Defusing)
        {
            CurrentDefuseProgress += DeltaSeconds;
            if (CurrentDefuseProgress >= (TotalDefuseDuration * 0.5f))
            {
                bHasHalfwayCheckpoint = true;
            }

            if (CurrentDefuseProgress >= TotalDefuseDuration)
            {
                CoreState = ECoreState::Defused;
            }
        }

        if (DetonationTimer <= 0.0f)
        {
            CoreState = ECoreState::Detonated;
        }
    }
}

void AVanguardCoreDevice::StartPlanting(AActor* PlanterActor)
{
    if (CoreState == ECoreState::Carried)
    {
        CoreState = ECoreState::Planting;
        CurrentPlantProgress = 0.0f;
    }
}

void AVanguardCoreDevice::CancelPlanting()
{
    if (CoreState == ECoreState::Planting)
    {
        CoreState = ECoreState::Carried;
        CurrentPlantProgress = 0.0f;
    }
}

void AVanguardCoreDevice::CompletePlanting()
{
    CoreState = ECoreState::Active;
    DetonationTimer = TotalDetonationDuration;
}

void AVanguardCoreDevice::StartDefusing(AActor* DefuserActor)
{
    if (CoreState == ECoreState::Active)
    {
        CoreState = ECoreState::Defusing;
        if (!bHasHalfwayCheckpoint)
        {
            CurrentDefuseProgress = 0.0f;
        }
        else
        {
            CurrentDefuseProgress = TotalDefuseDuration * 0.5f;
        }
    }
}

void AVanguardCoreDevice::CancelDefusing()
{
    if (CoreState == ECoreState::Defusing)
    {
        CoreState = ECoreState::Active;
    }
}
