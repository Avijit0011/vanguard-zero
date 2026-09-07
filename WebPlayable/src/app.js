// VANGUARD: ZERO Main Application Entrypoint
document.addEventListener('DOMContentLoaded', () => {
    console.log('[VANGUARD: ZERO] Initializing Interactive 3D Playable Web Application...');

    // 1. Initialize UI Engine
    window.uiManager = new window.UIManager();
    window.uiManager.init();

    // 2. Initialize 3D Game Engine
    window.gameInstance = new window.VanguardGame();

    console.log('[VANGUARD: ZERO] Game & UI engines ready!');
});
