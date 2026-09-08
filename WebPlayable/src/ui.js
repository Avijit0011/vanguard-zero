// VANGUARD: ZERO UI Management Engine
class UIManager {
    constructor() {
        this.activeTab = 'play';
        this.selectedHero = (window.HEROES_DATA && window.HEROES_DATA.length > 0) ? window.HEROES_DATA[0] : null;
        this.selectedWeapon = (window.WEAPONS_DATA && window.WEAPONS_DATA.length > 5) ? window.WEAPONS_DATA[5] : null;
    }

    init() {
        this.initEventListeners();
        this.renderHeroSelector();
        this.renderHeroesTab();
        this.renderArsenalTab();
        this.renderBuyMenu();
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

        // Leave Match Button
        const btnLeave = document.getElementById('btn-leave-match');
        if (btnLeave) {
            btnLeave.addEventListener('click', () => {
                this.showMainMenu();
            });
        }

        // Settings Sensitivity slider
        const sensInput = document.getElementById('setting-sens');
        if (sensInput) {
            sensInput.addEventListener('input', (e) => {
                const valEl = document.getElementById('sens-val');
                if (valEl) valEl.innerText = e.target.value;
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
    }

    launchGameMode(mode) {
        this.hideMainMenu();
        if (window.gameInstance) {
            window.gameInstance.startMatch(mode, this.selectedHero);
        }
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.requestPointerLock();
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
        if (!grid || !window.HEROES_DATA) return;

        grid.innerHTML = '';
        window.HEROES_DATA.forEach(hero => {
            const chip = document.createElement('div');
            chip.className = `hero-chip ${this.selectedHero && hero.id === this.selectedHero.id ? 'active' : ''}`;
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
        if (!sidebar || !detail || !window.HEROES_DATA) return;

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
        if (!hero || !detailContainer) return;
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
        if (!container || !window.WEAPONS_DATA) return;

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
        if (!grid || !window.WEAPONS_DATA) return;

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
        const menu = document.getElementById('main-menu');
        const hud = document.getElementById('game-hud');
        if (menu) menu.classList.add('hidden');
        if (hud) hud.classList.remove('hidden');
    }

    showMainMenu() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        const menu = document.getElementById('main-menu');
        const hud = document.getElementById('game-hud');

        if (menu) menu.classList.remove('hidden');
        if (hud) hud.classList.add('hidden');
    }

    toggleBuyMenu(show) {
        const buyMenu = document.getElementById('buy-menu');
        if (!buyMenu) return;
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
        if (!sb) return;
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
        if (killer === 'YOU') {
            item.style.borderColor = 'var(--accent-cyan)';
            item.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
        }
        item.innerHTML = `
            <span class="killer">${killer}</span>
            <span class="weapon-icon">[${weapon}]${isHeadshot ? ' 🎯' : ''}</span>
            <span class="victim">${victim}</span>
        `;
        feed.appendChild(item);
        setTimeout(() => item.remove(), 4000);
    }

    showKillBanner(data) {
        const { killer = 'YOU', weapon = 'AETHER V', victim = 'BOT', streakCount = 1, isHeadshot = false } = data;
        const bannerContainer = document.getElementById('kill-banner-container');
        const bannerInner = document.getElementById('kill-banner-inner');
        const streakHeader = document.getElementById('kill-streak-header');
        const weaponNameEl = document.getElementById('kill-weapon-name');
        const victimNameEl = document.getElementById('kill-victim-name');
        const headshotBadge = document.getElementById('kill-headshot-badge');
        const skullDots = document.querySelectorAll('.skull-dot');
        const aceOverlay = document.getElementById('ace-overlay');

        if (!bannerContainer || !bannerInner) return;

        if (this.killBannerTimeout) {
            clearTimeout(this.killBannerTimeout);
        }

        const streakTitles = ['KILL', 'DOUBLE KILL', 'TRIPLE KILL', 'QUADRA KILL', 'ACE!'];
        const streakIndex = Math.min(Math.max(streakCount, 1), 5);
        const streakTitle = streakTitles[streakIndex - 1];

        if (streakHeader) streakHeader.innerText = streakTitle;
        if (weaponNameEl) weaponNameEl.innerText = weapon.toUpperCase();
        if (victimNameEl) victimNameEl.innerText = victim.toUpperCase();

        if (headshotBadge) {
            if (isHeadshot) {
                headshotBadge.classList.remove('hidden');
            } else {
                headshotBadge.classList.add('hidden');
            }
        }

        bannerContainer.className = `kill-banner-container kill-tier-${streakIndex}`;

        skullDots.forEach((dot) => {
            const idx = parseInt(dot.getAttribute('data-index'), 10);
            if (idx <= streakIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        bannerContainer.classList.remove('hidden');

        bannerInner.style.animation = 'none';
        bannerInner.offsetHeight; // trigger reflow
        bannerInner.style.animation = 'killBannerPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        if (streakIndex === 5 && aceOverlay) {
            aceOverlay.classList.remove('hidden');
            setTimeout(() => aceOverlay.classList.add('hidden'), 1200);
        }

        this.killBannerTimeout = setTimeout(() => {
            bannerContainer.classList.add('hidden');
        }, 3000);
    }

    resetKillBanner() {
        const bannerContainer = document.getElementById('kill-banner-container');
        if (bannerContainer) bannerContainer.classList.add('hidden');
        const skullDots = document.querySelectorAll('.skull-dot');
        skullDots.forEach(dot => dot.classList.remove('active'));
    }
}

window.UIManager = UIManager;
