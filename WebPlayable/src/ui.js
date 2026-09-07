// VANGUARD: ZERO UI Management Engine
class UIManager {
    constructor() {
        this.activeTab = 'play';
        this.selectedHero = window.HEROES_DATA[0]; // Default Nyx
        this.selectedWeapon = window.WEAPONS_DATA[5]; // Default Aether V Rifle
        this.initEventListeners();
    }

    initEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Mode Launchers
        const btnBotMatch = document.getElementById('btn-start-bot-match');
        if (btnBotMatch) {
            btnBotMatch.addEventListener('click', () => {
                this.launchGameMode('5v5');
            });
        }

        const btnRange = document.getElementById('btn-start-range');
        if (btnRange) {
            btnRange.addEventListener('click', () => {
                this.launchGameMode('range');
            });
        }

        const btnLock = document.getElementById('btn-lock-pointer');
        if (btnLock) {
            btnLock.addEventListener('click', () => {
                document.getElementById('click-to-play-banner').classList.add('hidden');
                document.getElementById('game-canvas').requestPointerLock();
            });
        }

        // Settings Sensitivity slider
        const sensInput = document.getElementById('setting-sens');
        if (sensInput) {
            sensInput.addEventListener('input', (e) => {
                document.getElementById('sens-val').innerText = e.target.value;
                if (window.gameInstance) {
                    window.gameInstance.mouseSensitivity = parseFloat(e.target.value);
                }
            });
        }

        // Close Buy Menu button
        const closeBuyBtn = document.getElementById('btn-close-buy');
        if (closeBuyBtn) {
            closeBuyBtn.addEventListener('click', () => {
                this.toggleBuyMenu(false);
            });
        }

        this.renderHeroSelector();
        this.renderHeroesTab();
        this.renderArsenalTab();
        this.renderBuyMenu();
    }

    launchGameMode(mode) {
        this.hideMainMenu();
        if (window.gameInstance) {
            window.gameInstance.startMatch(mode, this.selectedHero);
        }
        // Show click to lock pointer prompt if not locked
        if (!document.pointerLockElement) {
            document.getElementById('click-to-play-banner').classList.remove('hidden');
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
        const targetPane = document.getElementById(`tab-${tabName}`);

        if (targetBtn && targetPane) {
            targetBtn.classList.add('active');
            targetPane.classList.add('active');
            this.activeTab = tabName;
        }
    }

    renderHeroSelector() {
        const grid = document.getElementById('hero-selection-grid');
        if (!grid) return;

        grid.innerHTML = '';
        window.HEROES_DATA.forEach(hero => {
            const chip = document.createElement('div');
            chip.className = `hero-chip ${hero.id === this.selectedHero.id ? 'active' : ''}`;
            chip.innerHTML = `
                <div class="hero-chip-name">${hero.name}</div>
                <div class="hero-chip-role">${hero.role.toUpperCase()}</div>
            `;
            chip.addEventListener('click', () => {
                this.selectedHero = hero;
                document.querySelectorAll('.hero-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
            grid.appendChild(chip);
        });
    }

    renderHeroesTab() {
        const sidebar = document.getElementById('hero-sidebar');
        const detail = document.getElementById('hero-detail-view');
        if (!sidebar || !detail) return;

        sidebar.innerHTML = '';
        window.HEROES_DATA.forEach((hero, index) => {
            const item = document.createElement('div');
            item.className = `hero-chip ${index === 0 ? 'active' : ''}`;
            item.style.marginBottom = '10px';
            item.innerHTML = `
                <div class="hero-chip-name">${hero.name}</div>
                <div class="hero-chip-role">${hero.role.toUpperCase()} • ${hero.country}</div>
            `;
            item.addEventListener('click', () => {
                sidebar.querySelectorAll('.hero-chip').forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                this.showHeroDetails(hero, detail);
            });
            sidebar.appendChild(item);
        });

        this.showHeroDetails(window.HEROES_DATA[0], detail);
    }

    showHeroDetails(hero, detailContainer) {
        detailContainer.innerHTML = `
            <div style="background:var(--bg-card); padding:30px; border-left:4px solid var(--accent-cyan);">
                <span style="color:var(--accent-gold); font-family:var(--font-heading); font-size:0.9rem; letter-spacing:2px;">ROLE: ${hero.role.toUpperCase()}</span>
                <h1 style="font-family:var(--font-heading); font-size:3rem; margin:5px 0;">${hero.name}</h1>
                <p style="color:var(--text-muted); font-size:1.1rem; margin-bottom:25px;">${hero.bio}</p>
                <div style="margin-bottom:20px;">
                    <h3 style="color:var(--accent-cyan); font-family:var(--font-heading);">PASSIVE ABILITY</h3>
                    <p style="margin-top:5px; font-size:1.05rem;">${hero.passive}</p>
                </div>
                <h3 style="color:var(--accent-gold); font-family:var(--font-heading); margin-bottom:15px;">TACTICAL ABILITIES</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    ${hero.abilities.map(a => `
                        <div style="background:rgba(255,255,255,0.05); padding:15px; border:1px solid rgba(255,255,255,0.1);">
                            <span style="background:var(--accent-gold); color:#000; padding:2px 8px; font-family:var(--font-heading); font-weight:800; font-size:0.8rem;">${a.key}</span>
                            <span style="font-family:var(--font-heading); font-weight:700; margin-left:8px;">${a.name}</span>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-top:8px;">${a.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderArsenalTab() {
        const container = document.getElementById('arsenal-view-container');
        if (!container) return;

        container.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
                ${window.WEAPONS_DATA.map(w => `
                    <div style="background:var(--bg-card); padding:20px; border:1px solid rgba(255,255,255,0.1);">
                        <span style="color:var(--accent-cyan); font-size:0.8rem; font-family:var(--font-heading);">${w.category.toUpperCase()}</span>
                        <h3 style="font-family:var(--font-heading); font-size:1.4rem; margin:5px 0;">${w.name}</h3>
                        <div style="color:var(--accent-green); font-family:var(--font-heading); font-weight:800; font-size:1.1rem; margin-bottom:12px;">$${w.cost}</div>
                        <div style="font-size:0.95rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>BODY DAMAGE:</span> <strong style="color:#fff;">${w.damage}</strong>
                        </div>
                        <div style="font-size:0.95rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>HEADSHOT DMG:</span> <strong style="color:var(--accent-gold);">${Math.round(w.damage * w.headshotMult)}</strong>
                        </div>
                        <div style="font-size:0.95rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                            <span>FIRE RATE:</span> <strong style="color:#fff;">${w.fireRate} RPM</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBuyMenu() {
        const grid = document.getElementById('buy-weapons-grid');
        if (!grid) return;

        grid.innerHTML = '';
        window.WEAPONS_DATA.forEach(w => {
            const card = document.createElement('div');
            card.className = 'buy-card';
            card.innerHTML = `
                <div>
                    <span style="font-size:0.75rem; color:var(--accent-cyan); font-family:var(--font-heading);">${w.category.toUpperCase()}</span>
                    <h4>${w.name}</h4>
                </div>
                <div class="cost">$${w.cost}</div>
            `;
            card.addEventListener('click', () => {
                if (window.gameInstance && window.gameInstance.buyWeapon(w)) {
                    this.updateBuyMenuCredits(window.gameInstance.playerCredits);
                }
            });
            grid.appendChild(card);
        });
    }

    updateBuyMenuCredits(credits) {
        const el = document.getElementById('buy-credits-val');
        if (el) el.innerText = `$${credits}`;
    }

    hideMainMenu() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-hud').classList.remove('hidden');
    }

    showMainMenu() {
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('click-to-play-banner').classList.add('hidden');
    }

    toggleBuyMenu(show) {
        const buyMenu = document.getElementById('buy-menu');
        if (show) {
            buyMenu.classList.remove('hidden');
            if (window.gameInstance) {
                this.updateBuyMenuCredits(window.gameInstance.playerCredits);
            }
        } else {
            buyMenu.classList.add('hidden');
        }
    }

    toggleScoreboard(show) {
        const sb = document.getElementById('scoreboard');
        if (show) {
            sb.classList.remove('hidden');
        } else {
            sb.classList.add('hidden');
        }
    }

    addKillfeedEntry(killer, weapon, victim, isHeadshot) {
        const feed = document.getElementById('killfeed');
        if (!feed) return;

        const item = document.createElement('div');
        item.className = 'killfeed-item';
        item.innerHTML = `
            <span class="killer">${killer}</span>
            <span class="weapon-icon">[${weapon}]${isHeadshot ? ' 🎯' : ''}</span>
            <span class="victim">${victim}</span>
        `;
        feed.appendChild(item);
        setTimeout(() => item.remove(), 4000);
    }
}

window.uiManager = new UIManager();
