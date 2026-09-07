// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "AI/VanguardBotController.h"
#include "Kismet/GameplayStatics.h"

AVanguardBotController::AVanguardBotController()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AVanguardBotController::OnPossess(APawn* InPawn)
{
    Super::OnPossess(InPawn);
    CurrentBotState = EBotState::Patrolling;
}

void AVanguardBotController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    EvaluateTacticalBehavior();
}

void AVanguardBotController::EvaluateTacticalBehavior()
{
    // Search for nearest line-of-sight enemies
    if (CurrentTargetEnemy)
    {
        CurrentBotState = EBotState::Engaging;
        // Aim toward target with accuracy variance
        FVector EnemyLoc = CurrentTargetEnemy->GetActorLocation();
        SetFocus(CurrentTargetEnemy);
    }
}

void AVanguardBotController::EngageTarget(AActor* TargetEnemy)
{
    CurrentTargetEnemy = TargetEnemy;
}
