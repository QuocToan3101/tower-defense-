# 🏰 Tower Defense - Realm's Last Stand

A standalone offline tower defense game built with **Electron** and **vanilla JavaScript**. No server required—install and play!

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-blueviolet)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [How to Play](#-how-to-play)
- [Game Mechanics](#-game-mechanics)
- [Save & Load](#-save--load)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

✅ **Completely Offline** - No internet connection required  
✅ **Auto Wave Progression** - Waves continue automatically after a short pause  
✅ **New Player Friendly** - Early waves are softened for learning  
✅ **4 Unique Campaign Maps** - Escalating difficulty  
✅ **5 Tower Types** - Different strategies for each  
✅ **Enemy Variety** - 4 enemy types with scaling difficulty  
✅ **Save/Load System** - Multiple save slots using localStorage  
✅ **Level Progression** - Unlock levels as you win  
✅ **Beautiful UI** - Medieval-themed aesthetic with smooth animations  
✅ **Portable** - Single .exe installer, no dependencies

---

## 💻 System Requirements

- **OS:** Windows 7 or later (32-bit or 64-bit)
- **RAM:** 256 MB minimum (512 MB recommended)
- **Disk Space:** ~100 MB for installation
- **Display:** 1280x800 or higher resolution

---

## 📦 Installation

### Option 1: Installer (Recommended)

1. **Download** `Tower Defense-0.1.0-x64.exe` from the build output folder
2. **Double-click** the installer
3. **Follow the installation wizard**
4. **Launch** the game from your Start Menu or Desktop shortcut
5. **Enjoy!** 🎮

If you are working from this repository, the latest installer is generated at `dist/Tower Defense-0.1.0-x64.exe`.

### Option 2: Portable Version

1. **Extract** the `win-unpacked` folder from `dist/win-unpacked` to any location
2. **Navigate** to the extracted folder
3. **Double-click** `Tower Defense.exe`
4. **Game starts immediately** (no installation needed)

### Option 3: Developer Build

```bash
# Clone repository
git clone <repo-url>
cd towerdefense

# Navigate to electron directory
cd electron

# Install dependencies
npm install

# Start development mode
npm start

# Or build installer
npm run dist:win

# Or build portable version
npm run dist:portable
```

---

## 🎮 How to Play

### 🎯 Main Menu
- Click **"Start Game"** to begin
- Tutorial displays on your first run

### 🗺️ Level Select
- Choose from **4 maps** (Level 1 unlocked by default)
- Win a level to unlock the next one
- Each level has increasing difficulty

### ⚔️ Gameplay

#### Placing Towers
1. **Click a tower** in the left panel (Tower Shop)
2. **Click an empty cell** on the map to place it
3. **Gold is deducted** from your balance
4. Tower starts shooting **enemies automatically**

#### Tower Types

| Tower | Cost | Damage | Range | Fire Rate | Best For |
|-------|------|--------|-------|-----------|----------|
| 🏹 Archer | 100g | 15 | 120px | Fast | Early defense |
| 🧙 Mage | 150g | 25 | 100px | Medium | Mixed threats |
| 🔫 Cannon | 200g | 40 | 150px | Slow | Bosses |
| ⚡ Tesla | 250g | 20 | 100px | Very Fast | Swarms |

#### Enemy Types

| Enemy | HP | Speed | Gold | Threat | Notes |
|-------|-----|-------|------|--------|-------|
| 👹 Goblin | 20 | Fast | 10g | Low | Weak but numerous |
| 🗡️ Orc | 50 | Medium | 25g | Medium | Balanced |
| 🐉 Dragon | 150 | Slow | 100g | High | Tank, heavy armor |
| 💀 Skeleton | 30 | Medium | 15g | Low | Undead minion |

#### Managing Towers
1. **Click a placed tower** to select it
2. **Tower info** appears in the right panel
3. **Upgrade:** Pay gold to increase stats (damage, range, fire rate)
4. **Sell:** Recover 75% of tower investment
5. **Level cap:** Max 5 levels per tower

#### Wave System
- **Press "Start Game"** to begin wave 1
- Waves advance **automatically** after each clear
- **"Next Wave"** button is a manual fallback / skip option
- **Victory:** Survive all 10 waves
- **Defeat:** HP reaches 0

#### HUD Information
- **❤️ HP:** Player health (0 = game over)
- **🪙 Gold:** Currency for tower purchases/upgrades
- **🌊 Wave:** Current wave number
- **⭐ Score:** Points earned from kills

#### Controls
- **Left Mouse Click:** Place towers, select towers, click buttons
- **Right Mouse Click:** Deselect tower
- **Buttons:** Start, Pause, Resume, Restart

---

## 🔧 Game Mechanics

### Tower Mechanics
- **Targeting:** Towers prioritize enemies furthest along the path
- **Damage Types:** Normal, Magic, Fire (each with unique effects)
- **Upgrades:** Each level scales stats by 1.25x
- **Range Ring:** Shows attack radius when selected

### Enemy Mechanics
- **Health Scaling:** Enemy HP increases by wave (1.08x multiplier per wave)
- **Armor:** Reduces damage (0.0–0.4 reduction factor)
- **Pathfinding:** Enemies follow the golden path
- **Exit Damage:** Reaching the end deals damage to you

### Economy
- **Starting Gold:** 400g
- **Starting HP:** 35
- **Tower Sell Ratio:** 75% refund of total investment
- **Kill Rewards:** Varies by enemy type

### Difficulty Scaling
- Wave 1–3: Easy (learning phase)
- Wave 4–7: Medium (mixed types, larger waves)
- Wave 8–10: Hard (heavy armor, boss waves)

---

## 💾 Save & Load

### Saving a Game
1. During gameplay, click **"💾 Save"** button in HUD
2. Enter a save name (max 50 characters)
3. Click **"Save"**
4. Game auto-saves to browser storage

### Loading a Game
1. Click **"📂 Load"** button in HUD
2. Select a previous save slot
3. Game restores to exact state

### Save Data
- **Stored in:** Browser localStorage (offline)
- **Persists:** Until you clear browser data
- **Multiple Slots:** Save as many runs as you want
- **Auto-Backup:** Latest session always recoverable

### Clearing Saves
- **Browser:** Settings → Clear browsing data → Cookies & site data
- **Portable App:** Delete stored app data in AppData folder

---

## 📁 Project Structure

```
towerdefense/
├── frontend/                          # Game client
│   ├── index.html                     # HTML entry point
│   ├── css/
│   │   └── style.css                  # Game styling (Medieval theme)
│   └── js/
│       ├── main.js                    # App initialization
│       ├── Constants.js               # Game constants
│       ├── api/
│       │   └── ApiClient.js           # Offline API layer
│       ├── data/
│       │   ├── maps.js                # 4 level definitions
│       │   └── MockCatalog.js         # Tower & Enemy data
│       ├── engine/
│       │   ├── GameManager.js         # Main game loop
│       │   ├── LevelManager.js        # Grid & tower placement
│       │   ├── WaveManager.js         # Enemy spawning
│       │   ├── EventBus.js            # Event system
│       │   └── LevelData.js           # Level utilities
│       ├── entities/
│       │   ├── Tower.js               # Tower class
│       │   ├── Enemy.js               # Enemy class
│       │   └── Projectile.js          # Bullet class
│       ├── components/
│       │   └── ScreenManager.js       # Screen manager
│       ├── screens/
│       │   ├── StartScreen.js         # Main menu
│       │   ├── LevelSelectScreen.js   # Level select
│       │   └── GameScreen.js          # Game HUD
│       └── ui/
│           └── UIManager.js           # HUD updates
└── electron/                          # Desktop wrapper
    ├── main.js                        # Electron entry
    ├── preload.js                     # Security bridge
    └── package.json                   # Dependencies
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop** | Electron 26 | Cross-platform app wrapper |
| **Frontend** | HTML5 + Canvas API | Game rendering |
| **Game Logic** | Vanilla JavaScript | No framework overhead |
| **Data** | localStorage API | Offline saves |
| **Styling** | CSS3 + Google Fonts | UI/UX |
| **Build** | electron-builder | Packaging |

### Why This Stack?
- ✅ **Zero dependencies** - Runs on any Windows machine
- ✅ **Fast load** - No server connection delays
- ✅ **Small footprint** - ~70 MB installer
- ✅ **Full offline** - 100% playable without internet

---

## ⚙️ Advanced Settings

### Developer Console
- Press **F12** to open Chrome DevTools
- View logs: Console tab
- Debug towers: `window.gameManager.selectedTower`
- Inspect saves: `JSON.parse(localStorage.getItem('td_saves'))`

### Keyboard Shortcuts
- **F12:** Open DevTools
- **F5:** Hard refresh (reload game)
- **Ctrl+Shift+Delete:** Clear all local data

---

## 🆘 Troubleshooting

### Game Won't Start

**Problem:** Black screen, blank window, or stuck on loading

**Quick Solutions (try in order):**

1. **Wait a bit longer**
   - Sometimes the game takes 2-3 seconds to load
   - Electron apps are slower than web apps on first launch

2. **Check the console for errors (F12)**
   - Press **F12** to open DevTools
   - Click **Console** tab
   - Look for red error messages (🔥 prefix)
   - Screenshot the error and note the exact message

3. **Restart the game**
   - Close the app completely (Alt+F4)
   - Wait 3 seconds
   - Reopen the game

4. **Clear all data and reinstall**
   - Uninstall via Control Panel → Programs & Features
   - Delete `%APPDATA%\Local\Programs\Tower Defense` folder
   - Delete `%APPDATA%\Local\Tower Defense` folder (if exists)
   - Reinstall from scratch

5. **Check installation was complete**
   - Game should install to `C:\Program Files\Tower Defense\` or similar
   - Verify `Tower Defense.exe` exists in the installation folder
   - Try running directly from the .exe (not a shortcut)

**If still blank after these steps:**

The issue is likely one of:
- **Corrupt installation** → Full reinstall needed
- **Missing graphics drivers** → Update GPU drivers
- **Missing Visual C++ runtime** → Install [Visual C++ Redistributable](https://support.microsoft.com/en-us/help/2977003)
- **Filesystem corruption** → Run `sfc /scannow` in Command Prompt (Admin)

**For Developers (Development Mode):**

1. **Check Electron console logs**:
   ```bash
   cd electron
   npm start
   ```
   Look for logs with emoji prefixes:
   - `📦 Creating window...`
   - `📄 Page loaded successfully`
   - `📄 DOM loaded, initializing game...`
   - `✅ All required classes loaded`
   - `✨ Game bootstrap complete, showing start screen`

   If any are missing, that's where it fails.

2. **Check browser console** (F12):
   - Look for any `🔥 Uncaught JavaScript error` messages
   - Check if all manager objects exist:
     ```javascript
     window.gameManager        // Should exist
     window.screenManager      // Should exist
     window.apiClient          // Should exist
     window.uiManager          // Should exist
     ```

3. **Common JS errors & fixes**:
   - **"ApiClient is not defined"** → `js/api/ApiClient.js` not loading
   - **"Cannot read property 'show' of undefined"** → ScreenManager failed to initialize
   - **"Missing required classes: ..."** → One of the game components didn't load
   - **Check file paths** → Verify all `<script>` tags in `index.html` point to correct files

### Save Data Lost
**Problem:** Previous saves disappeared

**Solution:**
1. Check if you cleared browser data recently
2. Saves are stored in browser localStorage
3. Reinstall game (saves may be recoverable in Windows recovery)
4. Start new campaign (saves are permanent otherwise)

### Game Runs Slowly
**Problem:** Low FPS or stuttering

**Solution:**
1. Close other applications (Chrome, Discord, etc.)
2. Reduce screen resolution temporarily
3. Update Windows and graphics drivers
4. Check disk space (need ~500 MB free)

### Can't Upgrade Tower
**Problem:** Upgrade button disabled

**Solution:**
- Tower is at max level (Level 5)
- Not enough gold (check HUD balance)
- Tower must be selected (click it on map)

### Waves Not Starting
**Problem:** Click "Start Game" but nothing happens

**Solution:**
1. Ensure game has loaded (wait 2-3 seconds)
2. Select a level first (not just the start screen)
3. Close and reopen game
4. Check console (F12) for errors

---

## 📊 Tips & Tricks

### Early Game (Waves 1-3)
- Build **Archer towers** (cheap, effective)
- Focus on **map coverage** over upgrades
- Save gold for mid-game towers

### Mid Game (Waves 4-7)
- **Mix tower types** (Archer + Mage combo)
- **Upgrade key towers** (don't spread upgrades)
- **Build ahead** of enemy paths

### Late Game (Waves 8-10)
- **Sell weak towers** and rebuild stronger ones
- **Focus on Cannon & Tesla** towers
- **Maximize upgrades** on 5-6 key towers

### Gold Management
- Upgrade > Buy new towers (usually)
- Sell towers for quick cash injection
- Don't overspend early

### Map Strategy
Each map has different path layouts:
- **Map 1:** Long straight path (good for ranged towers)
- **Map 2:** Multiple branches (need coverage)
- **Map 3:** Spiral path (choke points useful)
- **Map 4:** Complex maze (tower placement critical)

---

## 🐛 Report Issues

If you find a bug:

1. **Note the issue:** What happened? When?
2. **Reproduce:** Can you make it happen again?
3. **Check console:** F12 → Console tab for errors
4. **Report:** Include steps to reproduce + error logs

---

## 📜 License

This game is provided as-is for personal use. Enjoy! 🎮

---

## 🙏 Credits

**Created with:**
- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- Electron for desktop packaging
- CSS3 animations & styling

**Inspired by:** Classic tower defense games

---

## 🚀 Future Updates

Potential features for future versions:
- [ ] Sound effects & background music
- [ ] More tower types & special abilities
- [ ] Procedural level generation
- [ ] Leaderboard system
- [ ] Multiple difficulty settings
- [ ] Hotkeys customization
- [ ] Dark mode toggle

---

## ❓ FAQ

**Q: Is this game free?**  
A: Yes! Download and play for free.

**Q: Do I need internet?**  
A: No, game runs 100% offline.

**Q: Can I modify the game?**  
A: Source code is included—feel free to experiment!

**Q: How do I uninstall?**  
A: Use Windows Control Panel → Programs & Features, or delete the portable folder.

**Q: Where are my saves stored?**  
A: Browser localStorage (survives reinstalls if data isn't cleared).

**Q: Can I play on Mac/Linux?**  
A: Currently Windows only. Mac/Linux versions possible with code changes.

---

## 📞 Support

For help:
1. Check this README
2. Review Troubleshooting section
3. Check browser console (F12) for errors
4. Reinstall game as last resort

---

**Happy defending, Commander! 🛡️⚔️**

*Last Updated: May 8, 2026*
