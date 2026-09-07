// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "Core/VanguardGameMode.h"
#include "Engine/World.h"

AVanguardGameMode::AVanguardGameMode()
{
    PrimaryActorTick.bCanEverTick = true;
    AttackerState.TeamRole = EVanguardTeam::Attackers;
    DefenderState.TeamRole = EVanguardTeam::Defenders;
}

void AVanguardGameMode::BeginPlay()
{
    Super::BeginPlay();
    StartBuyPhase();
}

void AVanguardGameMode::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (PhaseTimer > 0.0f)
    {
        PhaseTimer -= DeltaSeconds;
        if (PhaseTimer <= 0.0f)
        {
            if (CurrentPhase == EVanguardMatchPhase::BuyPhase)
            {
                StartActionPhase();
            }
            else if (CurrentPhase == EVanguardMatchPhase::ActionPhase)
            {
                if (!bIsCorePlanted)
                {
                    EndRound(EVanguardTeam::Defenders, TEXT("Time Expired - Core Not Planted"));
                }
            }
            else if (CurrentPhase == EVanguardMatchPhase::PostRound)
            {
                if (AttackerState.Score >= RoundsToWin || DefenderState.Score >= RoundsToWin)
                {
                    CurrentPhase = EVanguardMatchPhase::MatchEnded;
                }
                else if (CurrentRound == 12)
                {
                    SwapSides();
                    StartBuyPhase();
                }
                else
                {
                    CurrentRound++;
                    StartBuyPhase();
                }
            }
        }
    }
}

void AVanguardGameMode::StartBuyPhase()
{
    CurrentPhase = EVanguardMatchPhase::BuyPhase;
    PhaseTimer = BuyPhaseDuration;
    bIsCorePlanted = false;
}

void AVanguardGameMode::StartActionPhase()
{
    CurrentPhase = EVanguardMatchPhase::ActionPhase;
    PhaseTimer = ActionPhaseDuration;
}

void AVanguardGameMode::EndRound(EVanguardTeam WinningTeam, FString Reason)
{
    CurrentPhase = EVanguardMatchPhase::PostRound;
    PhaseTimer = PostRoundDuration;

    if (WinningTeam == EVanguardTeam::Attackers)
    {
        AttackerState.Score++;
        AttackerState.ConsecutiveLosses = 0;
        DefenderState.ConsecutiveLosses++;
    }
    else if (WinningTeam == EVanguardTeam::Defenders)
    {
        DefenderState.Score++;
        DefenderState.ConsecutiveLosses = 0;
        AttackerState.ConsecutiveLosses++;
    }

    DistributeRoundPayouts(WinningTeam);
}

void AVanguardGameMode::SwapSides()
{
    int32 TempScore = AttackerState.Score;
    AttackerState.Score = DefenderState.Score;
    DefenderState.Score = TempScore;
}

void AVanguardGameMode::OnCorePlanted(AActor* Planter, FVector Location)
{
    if (CurrentPhase == EVanguardMatchPhase::ActionPhase && !bIsCorePlanted)
    {
        bIsCorePlanted = true;
        PhaseTimer = CoreDetonationDuration;
    }
}

void AVanguardGameMode::OnCoreDefused(AActor* Defuser)
{
    if (bIsCorePlanted)
    {
        EndRound(EVanguardTeam::Defenders, TEXT("Core Defused"));
    }
}

void AVanguardGameMode::OnCoreDetonated()
{
    if (bIsCorePlanted)
    {
        EndRound(EVanguardTeam::Attackers, TEXT("Core Detonated"));
    }
}

void AVanguardGameMode::DistributeRoundPayouts(EVanguardTeam WinningTeam)
{
    // Economy rules: Win = $3000, Loss = $1900 + loss streak bonus ($500 per loss up to max $3400)
    // Applied server-side to all player states
}
