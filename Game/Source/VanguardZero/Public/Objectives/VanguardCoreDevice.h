// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "VanguardCoreDevice.generated.h"

UENUM(BlueprintType)
enum class ECoreState : uint8
{
    Carried         UMETA(DisplayName = "Carried"),
    Planting        UMETA(DisplayName = "Planting"),
    Active          UMETA(DisplayName = "Active"),
    Defusing        UMETA(DisplayName = "Defusing"),
    Defused         UMETA(DisplayName = "Defused"),
    Detonated       UMETA(DisplayName = "Detonated")
};

UCLASS()
class VANGUARDZERO_API AVanguardCoreDevice : public AActor
{
    GENERATED_BODY()

public:
    AVanguardCoreDevice();

    virtual void Tick(float DeltaSeconds) override;

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Core")
    void StartPlanting(AActor* PlanterActor);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Core")
    void CancelPlanting();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Core")
    void CompletePlanting();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Core")
    void StartDefusing(AActor* DefuserActor);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Core")
    void CancelDefusing();

    UFUNCTION(BlueprintPure, Category = "Vanguard|Core")
    ECoreState GetCoreState() const { return CoreState; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Core")
    float GetDetonationTimeRemaining() const { return DetonationTimer; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Core")
    float GetDefuseProgressRatio() const { return CurrentDefuseProgress / TotalDefuseDuration; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Core")
    bool HasReachedHalfwayCheckpoint() const { return bHasHalfwayCheckpoint; }

protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|Core")
    ECoreState CoreState = ECoreState::Carried;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Core")
    float TotalPlantDuration = 4.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Core")
    float TotalDetonationDuration = 45.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Core")
    float TotalDefuseDuration = 7.0f;

    float CurrentPlantProgress = 0.0f;
    float CurrentDefuseProgress = 0.0f;
    float DetonationTimer = 45.0f;
    bool bHasHalfwayCheckpoint = false;
};
