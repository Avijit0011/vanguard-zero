// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AbilitySystemInterface.h"
#include "VanguardCharacterBase.generated.h"

class UAbilitySystemComponent;
class UVanguardAttributeSet;
class AVanguardWeaponBase;

UENUM(BlueprintType)
enum class EHeroRole : uint8
{
    Assault     UMETA(DisplayName = "Assault"),
    Recon       UMETA(DisplayName = "Recon"),
    Support     UMETA(DisplayName = "Support"),
    Control     UMETA(DisplayName = "Control")
};

UCLASS()
class VANGUARDZERO_API AVanguardCharacterBase : public ACharacter, public IAbilitySystemInterface
{
    GENERATED_BODY()

public:
    AVanguardCharacterBase();

    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
    virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override;

    // Movement & Combat Input Handlers
    void MoveForward(float Value);
    void MoveRight(float Value);
    void StartSprinting();
    void StopSprinting();
    void StartCrouching();
    void StopCrouching();
    void PrimaryAttack();
    void SecondaryAttack();

    // Ability Slot Triggers
    void TriggerAbility1();
    void TriggerAbility2();
    void TriggerSignatureAbility();
    void TriggerUltimateAbility();

    // Weapon Management
    UFUNCTION(BlueprintCallable, Category = "Vanguard|Weapons")
    void EquipWeapon(AVanguardWeaponBase* NewWeapon);

    UFUNCTION(BlueprintPure, Category = "Vanguard|Weapons")
    AVanguardWeaponBase* GetEquippedWeapon() const { return EquippedWeapon; }

    // Health / Armor
    UFUNCTION(BlueprintCallable, Category = "Vanguard|Health")
    void ApplyDamageCustom(float BaseDamage, bool bIsHeadshot, AActor* InstigatorActor);

    // Getters
    UFUNCTION(BlueprintPure, Category = "Vanguard|Hero")
    FString GetHeroName() const { return HeroName; }

    UFUNCTION(BlueprintPure, Category = "Vanguard|Hero")
    EHeroRole GetHeroRole() const { return HeroRole; }

protected:
    virtual void BeginPlay() override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|Abilities")
    UAbilitySystemComponent* AbilitySystemComponent;

    UPROPERTY()
    UVanguardAttributeSet* AttributeSet;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Hero")
    FString HeroName = "Default Hero";

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Vanguard|Hero")
    EHeroRole HeroRole = EHeroRole::Assault;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vanguard|Health")
    float MaxHealth = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vanguard|Health")
    float CurrentHealth = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vanguard|Health")
    float MaxArmor = 50.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vanguard|Health")
    float CurrentArmor = 0.0f;

    UPROPERTY(VisibleInstanceOnly, BlueprintReadOnly, Category = "Vanguard|Weapons")
    AVanguardWeaponBase* EquippedWeapon;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Vanguard|Camera")
    class UCameraComponent* FirstPersonCamera;
};
