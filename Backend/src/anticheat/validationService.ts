export class ValidationService {
    private MAX_WALK_SPEED = 750.0; // Max allowed u/s
    private MAX_FIRE_RATE_MARGIN = 1.15; // 15% tolerance margin for latency jitter

    validateMovement(prevPos: { x: number; y: number; z: number }, newPos: { x: number; y: number; z: number }, deltaTime: number): boolean {
        const dx = newPos.x - prevPos.x;
        const dy = newPos.y - prevPos.y;
        const dz = newPos.z - prevPos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const speed = distance / Math.max(0.001, deltaTime);

        if (speed > this.MAX_WALK_SPEED) {
            console.warn(`[AntiCheat Alert] Impossible speed detected: ${speed.toFixed(1)} u/s`);
            return false;
        }
        return true;
    }

    validateHitscanShot(shooterPos: { x: number; y: number; z: number }, targetPos: { x: number; y: number; z: number }, weaponId: string, timestamp: number): boolean {
        const dx = targetPos.x - shooterPos.x;
        const dy = targetPos.y - shooterPos.y;
        const dz = targetPos.z - shooterPos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Maximum effective range check (e.g. 200m = 20000 units)
        if (distance > 25000) {
            console.warn(`[AntiCheat Alert] Impossible shot distance: ${distance} units`);
            return false;
        }

        return true;
    }
}
