// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "VanguardEconomyComponent.generated.h"

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class VANGUARDZERO_API UVanguardEconomyComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UVanguardEconomyComponent();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Economy")
    bool BuyWeapon(FString WeaponID, int32 Cost);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Economy")
    bool BuyArmor(int32 ArmorTier, int32 Cost);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Economy")
    bool BuyAbilityCharge(int32 AbilitySlot, int32 Cost);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Economy")
    void AddCredits(int32 Amount);

    UFUNCTION(BlueprintPure, Category = "Vanguard|Economy")
    int32 GetCredits() const { return CurrentCredits; }

protected:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vanguard|Economy")
    int32 CurrentCredits = 800; // Starting credit for Round 1 pistol round

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Economy")
    int32 MaxCredits = 9000;
};
