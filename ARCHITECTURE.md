# SweViceroy MTG — Architecture & Flow

## Overview

A simplified hotseat Magic: The Gathering web game. Two players share one screen, taking turns playing lands, casting creatures, attacking, and blocking. Built as a single-page application with vanilla JavaScript (no frameworks, no bundlers).

---

## File Structure

```
.
├── index.html              Entry point — loads all CSS and JS
├── css/
│   ├── base/
│   │   ├── reset.css       * { margin: 0; box-sizing: border-box; }, body
│   │   └── variables.css   (future CSS custom properties)
│   ├── layouts/
│   │   ├── screen-system.css  .screen, .active-screen, .hidden, .screen-content
│   │   ├── game-layout.css    #game-screen grid, .game-sidebar containers
│   │   └── game-board.css     .game-board grid (6 rows)
│   ├── components/
│   │   ├── buttons.css        button, :hover, :active, :disabled
│   │   ├── panels.css         Shared panel styles, .player-header, .player-stat-box
│   │   ├── phase-tracker.css  .phase-tracker-list, .active-phase-item
│   │   ├── preview.css        .preview-panel, .preview-card-image
│   │   ├── zones.css          .hand-section, .battlefield-side (2fr/1fr), .zone-block
│   │   └── cards.css          .game-card sizing per zone
│   ├── screens/
│   │   ├── welcome.css     .game-title, .welcome-buttons
│   │   ├── tutorial.css    .tutorial-image-wrapper, .tutorial-buttons
│   │   ├── login.css       .login-panels, .form-row, .text-input, .login-bottom-actions
│   │   ├── loading.css     .loading-card, .loading-spinner
│   │   └── gameover.css    #gameover-screen .screen-content
│   ├── states/
│   │   ├── visual-states.css  .card-tapped, .card-attacking, .card-selected, etc.
│   │   └── animations.css     @keyframes spin
│   └── responsive.css         @media breakpoints (1400px, 1200px, 850px, 600px)
│
├── js/
│   ├── state.js       App/tutorial/betting/game state objects + card library
│   ├── dom.js         40+ DOM element references (document.getElementById)
│   ├── helpers.js     ID factory, showScreen, sanitizeNumberInput, parsePositiveInteger
│   ├── screens.js     Tutorial, Login/Betting, Loading screen functions
│   ├── game.js        Game logic: helpers, phase engine, init, render, actions, click router
│   └── events.js      All event listeners + init (loads balances, shows welcome)
```

**Load order** (strict, each depends on the previous):

```
State → DOM → Helpers → Screens → Game → Events
```

---

## Screen Flow

```
Welcome ──→ Tutorial ──→ Login/Betting ──→ Loading ──→ Game ──→ Game Over
   ↑                                                        │
   └──────────────────── Back to Welcome ────────────────────┘
```

### 1. Welcome Screen (`screens/welcome.css`)

- **What the user sees**: Title "SweViceroy MTG", subtitle, and a "Start Game" button.
- **JS init**: `events.js:168` — `showScreen("welcome")` runs on page load, reveals this screen.
- **Click handler**: `startBtn` → `openTutorialScreen()`.

### 2. Tutorial Screen (`screens/tutorial.css`)

- **What the user sees**: Image carousel with Previous/Next navigation, "Step X / 6" counter, and a "Go To Login" button.
- **State**: `tutorialState` tracks `currentIndex` and image paths.
- **Image array**: 6 tutorial images (`img/tutorial-1.png` through `6.png`).
- **Edge cases**:
  - First step: Previous button is `disabled`.
  - Last step: Next button is `disabled`.
- **Exit**: "Go To Login" → `openLoginScreen()`.

### 3. Login / Betting Screen (`screens/login.css`)

- **What the user sees**: Two-column layout — Player 1 (left) and Player 2 (right). Each side has:
  - Name input
  - Display of current balance
  - "Add cash" input (press Enter or blur to apply)
  - "Bet to win" input
- **State**: `bettingState` stores balances and bets; `playerSetupState` stores names.
- **Persistence**: Balances are saved to `localStorage` via `STORAGE_KEYS`.
- **Validations**:
  - `validatePlayerNames()` — both names must be non-empty.
  - `validatePlayerBets()` — must be positive integers, cannot exceed balance.
  - `parsePositiveInteger()` rejects empty, non-numeric, zero, and negative values.
- **Back**: "Back To Tutorial" → `openTutorialScreen()`.
- **Confirm**: "Let's Start The Game" → validates → `openLoadingScreen()`.

### 4. Loading Screen (`screens/loading.css`)

- **What the user sees**: Displays player names and bets, stepping through 4 load messages at 700ms intervals:
  1. "Shuffling decks..."
  2. "Drawing starting hands..."
  3. "Preparing battlefield..."
  4. "Rolling for first turn..."
- **After final step** (2800ms): Calls `initializeGame()`, `showScreen("game")`, `renderGame()`.
- **Safety**: `clearLoadingTimeouts()` runs on game init to cancel pending timeouts.

### 5. Game Screen (`screens/game-layout.css`, `game-board.css`)

- **What the user sees**: Three-column layout.

```
┌────────────────┬──────────────────────┬──────────────────┐
│  LEFT SIDEBAR   │    CENTER BOARD       │  RIGHT SIDEBAR   │
│                 │                       │                  │
│  SweViceroy     │  Player 2 Stats       │  Instructions    │
│  branding       │  Player 2 Hand        │  (message text)  │
│                 │  Player 2 Battlefield │                  │
│  Turn info      │   [Creatures][Lands]  │  Card Preview    │
│  (turn, player) │   (2/3 width) (1/3)   │  (image + name)  │
│                 │  Player 1 Battlefield │                  │
│  Phase Tracker  │   [Creatures][Lands]  │                  │
│  (6 phases)     │  Player 1 Hand        │                  │
│                 │  Player 1 Stats       │                  │
└────────────────┴──────────────────────┴──────────────────┘
```

- **Phase display**: List of 6 items (Draw, Untap, Main 1, Combat, Main 2, End). The current phase is highlighted blue.
- **Stats per player**: Deck count, Life total, Mana pool.
- **Card preview** (right sidebar): Shows the last clicked card's image and name/stats.

### 6. Game Over Screen (`screens/gameover.css`)

- **What the user sees**: Winner/loser announcement, updated balances, "Play Again" button (disabled initially) and "Back To Welcome" button.
- **Triggered by**: `gameOver(loserId, reason)` — when life reaches 0 or deck is empty.
- **Bet resolution**: `applyBetResults()` transfers the loser's bet to the winner's balance.
- **Play Again**: `initializeGame()` + `renderGame()`.
- **Back To Welcome**: Returns to the welcome screen.

---

## Game Mechanics

### Phases (cycle)

```
Draw → Untap → Main 1 → Combat (Attack → Block → Damage) → Main 2 → End → (next turn)
```

Each phase:
| Phase | What happens |
|---|---|
| Draw | Active player draws 1 card. If library is empty, game over. |
| Untap | Active player untaps all permanents. |
| Main 1 | Play 1 land, tap lands for mana, cast creatures. |
| Combat Attack | Declare attackers (tap creatures, mark as attacking). |
| Combat Block | Defender assigns blockers to attacking creatures. |
| Combat Damage | Damage resolves simultaneously. 100ms display window. |
| Main 2 | Same as Main 1. |
| End | If hand > 7 cards, must discard to 7 before turn passes. |

### Mana System

- Each land can be tapped for 1 mana (toggle on/off).
- Mana pool resets each Main phase.
- Mana can be returned by untapping a tapped land (if pool > 0).
- Spending mana reduces the pool. Once pool hits 0, no more lands can be manually untapped.

### Combat Resolution

1. Attacker taps creatures and marks them as attacking.
2. Defender selects blockers (click blocker, then click attacker).
3. Damage resolves:
   - Blocked creatures trade damage with their blocker.
   - Unblocked creatures deal damage to the defending player's life total.
4. Dead creatures (toughness ≤ damage marked) are removed.
5. If defending player's life ≤ 0, game over.
6. Damage marks are cleared after a 100ms timeout.

### Card System

- **6 Creature types** (4 copies each in deck, 24 total):
  - Pepe the Poor (1/1, cost 1)
  - Wojak the Weak (1/2, cost 1)
  - Pepe the Scrappy (2/2, cost 3)
  - Wojak the Worker (3/2, cost 3)
  - Pepe, Forest Knight (3/4, cost 5)
  - Wojakbeast (4/4, cost 5)
- **16 Forests** per deck (land cards).
- **Total**: 40 cards per deck.
- **Summoning sickness**: Creatures can't attack on the turn they're played.

### Turn Flow

1. Game starts with Player 1's Draw phase.
2. "Next Phase" button advances to the next phase (controlled by the active player).
3. During Combat Block, the defending player controls the button.
4. At End phase, if hand > 7, cards must be discarded one by one.
5. Turn passes to the other player.

---

## State Management

All state is in global variables (no framework):

| Object | Purpose |
|---|---|
| `appState` | Tracks `currentScreen` |
| `tutorialState` | `currentIndex`, `images[]` |
| `bettingState` | `player1Balance`, `player2Balance`, bets |
| `playerSetupState` | Player names |
| `loadingState` | Loading step index, timeout IDs |
| `gameState` | Turn number, current player/phase, players[], combat flags, winner/loser |

---

## Key Helper Functions

| Function | What it does |
|---|---|
| `showScreen(name)` | Hides all screens, shows the named one |
| `parsePositiveInteger(str)` | Returns `null` for invalid input, number otherwise |
| `createCardInstance(def)` | Creates a playable card from a library definition |
| `buildDeck()` | Generates 40-card shuffled deck |
| `initializeGame()` | Resets game state, builds decks, draws opening hands |
| `renderGame()` | Full UI refresh (stats, phases, board, instructions) |
| `handleGameCardClick()` | Routes clicks to the correct action based on phase/zone |

---

## Event Handlers

All wired in `events.js`:

- **Welcome**: `startBtn.click → openTutorialScreen()`
- **Tutorial**: prev/next navigation, `tutorialLoginBtn.click → openLoginScreen()`
- **Login**: input sanitizing on `input`, `Enter` to add cash, `startMatchBtn.click` to validate and load
- **Game**: `nextPhaseBtn.click → tryAdvancePhase()`, document click on `.game-card → handleGameCardClick()`
- **Init** (auto-runs): `loadBalancesFromStorage()`, `updateBalanceDisplay()`, `updateTutorialScreen()`, `showScreen("welcome")`
