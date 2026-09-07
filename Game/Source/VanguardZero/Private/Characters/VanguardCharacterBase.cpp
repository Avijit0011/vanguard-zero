// Copyright (c) 2026 VANGUARD: ZERO Project. All Rights Reserved.

#include "Characters/VanguardCharacterBase.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"

AVanguardCharacterBase::AVanguardCharacterBase()
{
    PrimaryActorTick.bCanEverTick = true;

    // Set up FPS Capsule size
    GetCapsuleComponent()->InitCapsuleSize(40.0f, 90.0f);

    // Camera initialization
    FirstPersonCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FirstPersonCamera"));
    FirstPersonCamera->SetupAttachment(GetCapsuleComponent());
    FirstPersonCamera->SetRelativeLocation(FVector(0.f, 0.f, 64.f));
    FirstPersonCamera->bUsePawnControlRotation = true;

    // Tactical FPS Movement setup
    GetCharacterMovement()->MaxWalkSpeed = 600.0f;
    GetCharacterMovement()->MaxWalkSpeedCrouched = 300.0f;
    GetCharacterMovement()->AirControl = 0.15f; // Precision tactical jump, minimal air strafe abusing
    GetCharacterMovement()->BrakingFrictionFactor = 2.0f;
}

void AVanguardCharacterBase::BeginPlay()
{
    Super::BeginPlay();
    CurrentHealth = MaxHealth;
}

void AVanguardCharacterBase::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    PlayerInputComponent->BindAxis("MoveForward", this, &AVanguardCharacterBase::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &AVanguardCharacterBase::MoveRight);
    PlayerInputComponent->BindAxis("Turn", this, &APawn::AddControllerYawInput);
    PlayerInputComponent->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);

    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    PlayerInputComponent->BindAction("Crouch", IE_Pressed, this, &AVanguardCharacterBase::StartCrouching);
    PlayerInputComponent->BindAction("Crouch", IE_Released, this, &AVanguardCharacterBase::StopCrouching);

    PlayerInputComponent->BindAction("Fire", IE_Pressed, this, &AVanguardCharacterBase::PrimaryAttack);
    PlayerInputComponent->BindAction("AltFire", IE_Pressed, this, &AVanguardCharacterBase::SecondaryAttack);

    PlayerInputComponent->BindAction("Ability1", IE_Pressed, this, &AVanguardCharacterBase::TriggerAbility1);
    PlayerInputComponent->BindAction("Ability2", IE_Pressed, this, &AVanguardCharacterBase::TriggerAbility2);
    PlayerInputComponent->BindAction("SignatureAbility", IE_Pressed, this, &AVanguardCharacterBase::TriggerSignatureAbility);
    PlayerInputComponent->BindAction("UltimateAbility", IE_Pressed, this, &AVanguardCharacterBase::TriggerUltimateAbility);
}

UAbilitySystemComponent* AVanguardCharacterBase::GetAbilitySystemComponent() const
{
    return AbilitySystemComponent;
}

void AVanguardCharacterBase::MoveForward(float Value)
{
    if (Value != 0.0f)
    {
        AddMovementInput(GetActorForwardVector(), Value);
    }
}

void AVanguardCharacterBase::MoveRight(float Value)
{
    if (Value != 0.0f)
    {
        AddMovementInput(GetActorRightVector(), Value);
    }
}

void AVanguardCharacterBase::StartCrouching()
{
    Crouch();
}

void AVanguardCharacterBase::StopCrouching()
{
    UnCrouch();
}

void AVanguardCharacterBase::PrimaryAttack()
{
    // Fire weapon hitscan
}

void AVanguardCharacterBase::SecondaryAttack()
{
    // ADS zoom or alt fire
}

void AVanguardCharacterBase::TriggerAbility1() {}
void AVanguardCharacterBase::TriggerAbility2() {}
void AVanguardCharacterBase::TriggerSignatureAbility() {}
void AVanguardCharacterBase::TriggerUltimateAbility() {}

void AVanguardCharacterBase::EquipWeapon(AVanguardWeaponBase* NewWeapon)
{
    EquippedWeapon = NewWeapon;
}

void AVanguardCharacterBase::ApplyDamageCustom(float BaseDamage, bool bIsHeadshot, AActor* InstigatorActor)
{
    float FinalDamage = bIsHeadshot ? (BaseDamage * 2.5f) : BaseDamage;

    // Armor absorption: 66% absorbed by armor up to remaining armor balance
    if (CurrentArmor > 0.0f)
    {
        float ArmorAbsorb = FinalDamage * 0.66f;
        if (CurrentArmor >= ArmorAbsorb)
        {
            CurrentArmor -= ArmorAbsorb;
            FinalDamage -= ArmorAbsorb;
        }
        else
        {
            FinalDamage -= CurrentArmor;
            CurrentArmor = 0.0f;
        }
    }

    CurrentHealth = FMath::Max(0.0f, CurrentHealth - FinalDamage);

    if (CurrentHealth <= 0.0f)
    {
        // Handle Elimination & Ragdoll
    }
}
