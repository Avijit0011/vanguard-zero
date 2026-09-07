// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "VanguardBotController.generated.h"

UENUM(BlueprintType)
enum class EBotState : uint8
{
    Buying          UMETA(DisplayName = "Buying"),
    Patrolling      UMETA(DisplayName = "Patrolling"),
    Engaging        UMETA(DisplayName = "Engaging"),
    PlantingCore    UMETA(DisplayName = "Planting Core"),
    DefusingCore    UMETA(DisplayName = "Defusing Core"),
    RetakingSite    UMETA(DisplayName = "Retaking Site")
};

UCLASS()
class VANGUARDZERO_API AVanguardBotController : public AAIController
{
    GENERATED_BODY()

public:
    AVanguardBotController();

    virtual void OnPossess(APawn* InPawn) override;
    virtual void Tick(float DeltaSeconds) override;

    UFUNCTION(BlueprintCallable, Category = "Vanguard|AI")
    void EvaluateTacticalBehavior();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|AI")
    void EngageTarget(AActor* TargetEnemy);

protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|AI")
    EBotState CurrentBotState = EBotState::Buying;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|AI")
    AActor* CurrentTargetEnemy;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|AI")
    float ReactionTime = 0.25f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|AI")
    float BotAimAccuracy = 0.82f;
};
