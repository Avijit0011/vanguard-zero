// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "VanguardGameMode.generated.h"

UENUM(BlueprintType)
enum class EVanguardMatchPhase : uint8
{
    Warmup          UMETA(DisplayName = "Warmup"),
    BuyPhase        UMETA(DisplayName = "Buy Phase"),
    ActionPhase     UMETA(DisplayName = "Action Phase"),
    PostRound       UMETA(DisplayName = "Post Round"),
    Halftime        UMETA(DisplayName = "Halftime"),
    Overtime        UMETA(DisplayName = "Overtime"),
    MatchEnded      UMETA(DisplayName = "Match Ended")
};

UENUM(BlueprintType)
enum class EVanguardTeam : uint8
{
    None            UMETA(DisplayName = "None"),
    Attackers       UMETA(DisplayName = "Attackers"),
    Defenders       UMETA(DisplayName = "Defenders"),
    Spectators      UMETA(DisplayName = "Spectators")
};

USTRUCT(BlueprintType)
struct FVanguardTeamState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    EVanguardTeam TeamRole = EVanguardTeam::None;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Score = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 ConsecutiveLosses = 0;
};

/**
 * VanguardGameMode
 * Authoritative 5v5 Tactical FPS Game Mode for UE5.
 * Handles match flow, economy payout calculations, side-swap, Core plant/defuse, and round outcomes.
 */
UCLASS()
class VANGUARDZERO_API AVanguardGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AVanguardGameMode();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

    // Phase Management
    UFUNCTION(BlueprintCallable, Category = "Vanguard|Rules")
    void StartBuyPhase();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Rules")
    void StartActionPhase();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Rules")
    void EndRound(EVanguardTeam WinningTeam, FString Reason);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Rules")
    void SwapSides();

    // Objective Calls
    UFUNCTION(BlueprintCallable, Category = "Vanguard|Objective")
    void OnCorePlanted(AActor* Planter, FVector Location);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Objective")
    void OnCoreDefused(AActor* Defuser);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Objective")
    void OnCoreDetonated();

    // Economy
    UFUNCTION(BlueprintCallable, Category = "Vanguard|Economy")
    void DistributeRoundPayouts(EVanguardTeam WinningTeam);

    // Getters
    UFUNCTION(BlueprintPure, Category = "Vanguard|State")
    EVanguardMatchPhase GetCurrentPhase() const { return CurrentPhase; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|State")
    int32 GetCurrentRound() const { return CurrentRound; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|State")
    float GetPhaseTimeRemaining() const { return PhaseTimer; }

protected:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Rules")
    int32 RoundsToWin = 13;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Rules")
    float BuyPhaseDuration = 30.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Rules")
    float ActionPhaseDuration = 100.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Rules")
    float CoreDetonationDuration = 45.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Rules")
    float PostRoundDuration = 7.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    EVanguardMatchPhase CurrentPhase = EVanguardMatchPhase::Warmup;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    int32 CurrentRound = 1;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    float PhaseTimer = 0.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    bool bIsCorePlanted = false;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    FVanguardTeamState AttackerState;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|State")
    FVanguardTeamState DefenderState;
};
