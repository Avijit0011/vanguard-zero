// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "VanguardWeaponBase.generated.h"

UENUM(BlueprintType)
enum class EVanguardWeaponCategory : uint8
{
    Pistol          UMETA(DisplayName = "Pistol"),
    SMG             UMETA(DisplayName = "SMG"),
    Shotgun         UMETA(DisplayName = "Shotgun"),
    Rifle           UMETA(DisplayName = "Rifle"),
    Sniper          UMETA(DisplayName = "Sniper"),
    Heavy           UMETA(DisplayName = "Heavy"),
    Melee           UMETA(DisplayName = "Melee")
};

USTRUCT(BlueprintType)
struct FVanguardRecoilPoint
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float PitchOffset = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float YawOffset = 0.0f;
};

UCLASS()
class VANGUARDZERO_API AVanguardWeaponBase : public AActor
{
    GENERATED_BODY()

public:
    AVanguardWeaponBase();

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Weapon")
    void FireWeapon(FVector CameraLocation, FVector CameraDirection, bool bIsCharacterMoving, bool bIsCrouching);

    UFUNCTION(BlueprintCallable, Category = "Vanguard|Weapon")
    void ReloadWeapon();

    // Getters
    UFUNCTION(BlueprintPure, Category = "Vanguard|Weapon")
    FString GetWeaponName() const { return WeaponName; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Weapon")
    int32 GetCurrentAmmo() const { return CurrentAmmo; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Weapon")
    int32 GetCost() const { return Cost; }

protected:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    FString WeaponName = "Assault Rifle";

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    EVanguardWeaponCategory Category = EVanguardWeaponCategory::Rifle;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    int32 Cost = 2900;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float BaseDamage = 38.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float HeadshotMultiplier = 4.0f; // 152 headshot damage (one-tap kill)

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float LegMultiplier = 0.85f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float FireRate = 600.0f; // Rounds per minute

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    int32 MagazineCapacity = 25;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|Stats")
    int32 CurrentAmmo = 25;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float ReloadDuration = 2.2f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    float MovementSpreadPenalty = 4.5f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Stats")
    TArray<FVanguardRecoilPoint> RecoilPattern;

    int32 CurrentShotCount = 0;
    float LastShotTimestamp = 0.0f;
};
