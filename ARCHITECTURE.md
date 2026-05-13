# SweViceroy MTG — Architecture & Flow

## Overview

A simplified hotseat Magic: The Gathering web game. Two players share one screen, taking turns playing lands, casting creatures, attacking, and blocking. Built as a single-page application with vanilla JavaScript (no frameworks, no bundlers).

---

## File Structure

```
.
├── index.html              Entry point — loads all CSS and JS
├── ARCHITECTURE.md         This document
│
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
│   ├── state.js           App/tutorial/betting/game state + card library + constants
│   ├── dom.js             40+ DOM element references (document.getElementById)
│   ├── helpers.js         ID factory, showScreen, sanitizeNumberInput, parsePositiveInteger
│   ├── screens.js         Tutorial, Login/Betting, Loading screen functions
│   ├── game.js            Game logic: helpers, phase engine, init, render, actions, click router
│   └── events.js          All event listeners + init (loads balances, shows welcome)
```

### Script load order

Load order is strict — each file depends on the previous one:

```
state.js → dom.js → helpers.js → screens.js → game.js → events.js
```

(index.html lines 429-434)

---

## Screen Flow

```
Welcome ──→ Tutorial ──→ Login/Betting ──→ Loading ──→ Game ──→ Game Over
   ↑                                                        │
   └──────────────────── Back to Welcome ────────────────────┘
```

### 1. Welcome Screen (css/screens/welcome.css)

- **What the user sees**: Title "SweViceroy MTG", subtitle, and a "Start Game" button.
- **State used**: `appState.currentScreen` automatically set to `"welcome"` by `showScreen()`.
- **JS init**: `events.js:113` — `showScreen("welcome")` runs on page load, reveals this screen.

### 2. Tutorial Screen (css/screens/tutorial.css)

- **What the user sees**: Image carousel with Previous/Next navigation, "Step X / 6" counter, and a "Go To Login" button.
- **State**: `tutorialState` (defined in `state.js:17`) tracks `currentIndex` (starts at 0) and `images[]` (6 image paths).
- **Functions used** (all in `screens.js`):
  - `updateTutorialScreen()` at `screens.js:4` — updates image source, counter text, button disabled states.
  - `openTutorialScreen()` at `screens.js:12` — resets index to 0, calls `updateTutorialScreen()`, calls `showScreen("tutorial")`.
  - `goToPreviousTutorialImage()` at `screens.js:18` — decrements index (if > 0), updates.
  - `goToNextTutorialImage()` at `screens.js:25` — increments index (if < max), updates.
- **Edge cases**:
  - First step: Previous button is `disabled`.
  - Last step: Next button is `disabled`.
- **Exit**: "Go To Login" button → `openLoginScreen()` at `screens.js:81`.

### 3. Login / Betting Screen (css/screens/login.css)

- **What the user sees**: Two-column panel layout — Player 1 (left) and Player 2 (right). Each side has:
  - Name text input
  - Current balance display
  - "Add cash" number input (applies on Enter or blur)
  - "Bet to win" number input
- **State** (all in `state.js`):
  - `bettingState` at `state.js:32` — `player1Balance`, `player2Balance`, `player1Bet`, `player2Bet`.
  - `playerSetupState` at `state.js:39` — `player1Name`, `player2Name`.
- **Persistence**: Balances are saved to `localStorage` via `STORAGE_KEYS` (`state.js:55`).
- **Functions used** (all in `screens.js`):
  - `loadBalancesFromStorage()` at `screens.js:35` — reads saved balances from localStorage.
  - `saveBalancesToStorage()` at `screens.js:43` — writes balances to localStorage.
  - `updateBalanceDisplay()` at `screens.js:48` — updates the balance text in the DOM.
  - `addMoneyToPlayer(p)` at `screens.js:53` — adds cash from input, saves, updates display.
  - `openLoginScreen()` at `screens.js:81` — loads balances, displays them, shows screen.
  - `validatePlayerNames()` at `screens.js:87` — both names must be non-empty.
  - `validatePlayerBets()` at `screens.js:101` — bets must be positive integers ≤ balance.
- **Validation helpers** (from `helpers.js`):
  - `parsePositiveInteger(value)` at `helpers.js:36` — rejects empty, non-numeric, zero, and negative values.
- **Back**: "Back To Tutorial" → `openTutorialScreen()`.
- **Confirm**: "Let's Start The Game" → validates → `openLoadingScreen()` at `screens.js:150`.

### 4. Loading Screen (css/screens/loading.css)

- **What the user sees**: Displays player names and bets, stepping through 4 load messages at 700ms intervals:
  1. "Shuffling decks..."
  2. "Drawing starting hands..."
  3. "Preparing battlefield..."
  4. "Rolling for first turn..."
- **State**: `loadingState` at `state.js:44` — `stepIndex`, `steps[]`, `timeoutIds[]`.
- **Functions used** (all in `screens.js`):
  - `clearLoadingTimeouts()` at `screens.js:134` — cancels any pending loading step timeouts.
  - `updateLoadingScreenInfo()` at `screens.js:142` — fills in player names, bets, current step text.
  - `openLoadingScreen()` at `screens.js:150` — resets step index, updates info, shows screen, starts step timers.
- **After final step** (2800ms): Calls `initializeGame()` at `game.js:480`, `showScreen("game")`, `renderGame()` at `game.js:715`.

### 5. Game Screen (css/layouts/game-layout.css, game-board.css + components)

- **What the user sees**: Three-column layout.

```
┌─────────────────┬──────────────────────┬──────────────────┐
│  LEFT SIDEBAR    │    CENTER BOARD       │  RIGHT SIDEBAR   │
│                  │                       │                  │
│  SweViceroy      │  Player 2 Stats       │  Instructions    │
│  branding        │  Player 2 Hand        │  (message text)  │
│  (panels.css)    │  Player 2 Battlefield │                  │
│                  │   [Creatures][Lands]  │  Card Preview    │
│  Turn info       │   (2/3 width) (1/3)   │  (image + name)  │
│  (turn, player)  │  Player 1 Battlefield │                  │
│                  │   [Creatures][Lands]  │                  │
│  Phase Tracker   │  Player 1 Hand        │                  │
│  (6 items)       │  Player 1 Stats       │                  │
└─────────────────┴──────────────────────┴──────────────────┘
```

- **Game layout grid** (`css/layouts/game-layout.css`): 3 columns — `100px 1fr 300px`.
- **Game board grid** (`css/layouts/game-board.css`): 6 rows — `auto / auto / 1fr / 1fr / auto / auto`.
- **Battlefield grid** (`css/components/zones.css`): 2 columns — `2fr 1fr` (creatures 2/3, lands 1/3).
- **Phase tracker** (`css/components/phase-tracker.css`): 6 list items, current phase highlighted blue.
- **Card sizes** (`css/components/cards.css`): 68x95px in battlefield, 74x103px in hand.
- **Card states** (`css/states/visual-states.css`): tapped (rotated 90°), attacking (lifted 10px), selected/blocking/damaged (colored outlines).

**Rendering pipeline** (all in `game.js`):

| Step | Function | Line |
|---|---|---|
| 1 | `renderStats()` | `game.js:678` — updates names, turn, life, mana, deck count |
| 2 | `updatePhaseTracker()` | `game.js:569` — highlights current phase |
| 3 | `updateNextPhaseButtons()` | `game.js:561` — enables/disables Next Phase for correct player |
| 4 | `renderInstructions()` | `game.js:698` — displays game message |
| 5 | `renderBoard()` | `game.js:702` — renders both players' hands and battlefields |

### 6. Game Over Screen (css/screens/gameover.css)

- **What the user sees**: Winner/loser announcement, updated balances, "Play Again" button, "Back To Welcome" button.
- **Triggered by**: `gameOver(loserPlayerId, reason)` at `game.js:218` — when life reaches 0 or deck is empty.
- **Bet resolution**: `applyBetResults()` at `game.js:192` — loser's bet is transferred to winner's balance.
- **Play Again**: `initializeGame()` + `renderGame()`.
- **Back To Welcome**: `showScreen("welcome")`.

---

## Game Mechanics

### Phases (cycle)

```
Draw → Untap → Main 1 → Combat (Attack → Block → Damage) → Main 2 → End → (next turn)
```

| Phase | What happens | Trigger function | Line |
|---|---|---|---|
| Draw | Active player draws 1 card. If library empty, game over. | `enterPhase("draw")` | `game.js:325` |
| Untap | Active player untaps all permanents. | `enterPhase("untap")` | `game.js:325` |
| Main 1 | Play 1 land, tap lands for mana, cast creatures. | `enterPhase("main1")` | `game.js:325` |
| Combat Attack | Declare attackers (tap creatures, mark as attacking). | `enterPhase("combatAttack")` | `game.js:325` |
| Combat Block | Defender assigns blockers to attacking creatures. | `enterPhase("combatBlock")` | `game.js:325` |
| Combat Damage | Damage resolves via `resolveCombatDamage()`. | `enterPhase("combatDamage")` | `game.js:421` |
| Main 2 | Same as Main 1. | `enterPhase("main2")` | `game.js:325` |
| End | If hand > 7 cards, must discard to 7 before turn passes. | `enterPhase("end")` | `game.js:325` |

**Advancing phases**: `tryAdvancePhase()` at `game.js:384` — checks hand size, combat lock, pending discard, then moves to next phase or next turn via `advanceToNextTurn()` at `game.js:266`.

### Mana System

- Each land can be tapped for 1 mana (toggle on/off via `tapOrUntapLand()` at `game.js:769`).
- Mana pool resets each Main phase.
- Mana can be returned by untapping a tapped land (if pool > 0).
- Spending mana lowers the pool (`castCreatureFromHand()` at `game.js:810`).
- Once pool hits 0, no more tapped lands can be manually untapped.

### Combat Resolution (`resolveCombatDamage()` at `game.js:421`)

1. Attacker taps creatures and marks them as attacking (`toggleAttacker()` at `game.js:885`).
2. Defender selects blockers via `toggleSelectedBlocker()` at `game.js:928` then `assignBlock()` at `game.js:964`.
3. `resolveCombatDamage()` iterates attacking creatures:
   - Blocked creatures trade damage with their blocker.
   - Unblocked creatures deal damage to the defending player's life total.
4. `removeDeadCreatures()` at `game.js:129` removes creatures where toughness ≤ damage marked.
5. If defending player's life ≤ 0 → `gameOver()`.
6. Damage marks cleared after 100ms timeout.

### Card System

- **6 Creature types** (4 copies each in deck = 24 creatures):

| Name | Power | Toughness | Cost | Key |
|---|---|---|---|---|
| Pepe the Poor | 1 | 1 | 1 | `creature1` |
| Wojak the Weak | 1 | 2 | 1 | `creature2` |
| Pepe the Scrappy | 2 | 2 | 3 | `creature3` |
| Wojak the Worker | 3 | 2 | 3 | `creature4` |
| Pepe, Forest Knight | 3 | 4 | 5 | `creature5` |
| Wojakbeast | 4 | 4 | 5 | `creature6` |

- **16 Forests** (land cards) per deck.
- **Total**: 40 cards per deck (`buildDeck()` at `game.js:42`).
- **Library definitions** in `state.js:76` (`CARD_LIBRARY`).
- **Summoning sickness**: Creatures can't attack on the turn they're played (`summoningSick` flag in `createCardInstance()` at `game.js:20`).

### Turn Flow (`advanceToNextTurn()` at `game.js:266`)

1. Game starts with Player 1's Draw phase (`initializeGame()` at `game.js:480`).
2. "Next Phase" button advances to the next phase (controlled by active player).
3. During Combat Block, the defending player controls the button.
4. At End phase, if hand > 7, cards must be discarded one by one via `discardCardFromHand()` at `game.js:853`.
5. Turn passes to the other player.

---

## State Objects (all in `js/state.js`)

| Object | Line | Purpose |
|---|---|---|
| `appState` | `state.js:10` | Tracks `currentScreen` (which screen is shown) |
| `tutorialState` | `state.js:17` | `currentIndex`, `images[]` (6 tutorial images) |
| `bettingState` | `state.js:32` | `player1Balance`, `player2Balance`, bets for both |
| `playerSetupState` | `state.js:39` | Player names |
| `loadingState` | `state.js:44` | `stepIndex`, `steps[]`, `timeoutIds[]` |
| `STORAGE_KEYS` | `state.js:55` | localStorage keys for balance persistence |
| `PHASES` | `state.js:63` | Array of 8 phase names in order |
| `CARD_BACK_IMAGE` | `state.js:74` | Path to card back image |
| `CARD_LIBRARY` | `state.js:76` | All card definitions (1 land + 6 creatures) |
| `gameState` | `state.js:143` | Turn number, current player/phase, players[], combat flags, winner/loser |

---

## Helper Functions (located in `js/helpers.js`)

| Function | Line | What it does |
|---|---|---|
| `createUniqueId(prefix)` | `helpers.js:6` | Generates unique card IDs |
| `showScreen(name)` | `helpers.js:15` | Hides all screens, shows the named one |
| `sanitizeNumberInput(el)` | `helpers.js:32` | Strips non-digit characters from an input |
| `parsePositiveInteger(str)` | `helpers.js:36` | Returns `null` for invalid input, number otherwise |

---

## Game-Logic Functions (all in `js/game.js`)

| Function | Line | What it does |
|---|---|---|
| `getPlayerById(id)` | `game.js:4` | Finds a player object by ID |
| `getCurrentPlayer()` | `game.js:8` | Returns the active player |
| `createCardInstance(def)` | `game.js:20` | Creates a playable card from a library definition |
| `buildDeck()` | `game.js:42` | Generates 40-card shuffled deck (16 lands + 24 creatures) |
| `shuffleArray(arr)` | `game.js:67` | Fisher-Yates shuffle |
| `drawCard(player)` | `game.js:78` | Draws top card from library to hand |
| `drawOpeningHands()` | `game.js:89` | Draws 7 cards for both players |
| `clearCombatSelections()` | `game.js:100` | Resets all combat flags |
| `clearManaPools()` | `game.js:114` | Resets both players' mana pools |
| `untapAllForPlayer(p)` | `game.js:119` | Untaps all lands and creatures |
| `removeDeadCreatures(p)` | `game.js:129` | Removes creatures with toughness ≤ damage |
| `resetDamageMarks()` | `game.js:135` | Clears all damage marks |
| `stopGameTimers()` | `game.js:143` | Clears loading and combat timeouts |
| `renderGameOverScreen()` | `game.js:154` | Builds and shows the game over screen |
| `applyBetResults(w, l)` | `game.js:192` | Transfers loser's bet to winner |
| `gameOver(loserId, reason)` | `game.js:218` | Ends the game, triggers bet resolution and game-over screen |
| `getPhaseLabelForTracker(p)` | `game.js:247` | Maps phase names to display labels |
| `getNextPhase(current)` | `game.js:255` | Returns next phase in the PHASES array |
| `advanceToNextTurn()` | `game.js:266` | Clears state, switches active player, enters Draw phase |
| `findCardAnywhereById(id)` | `game.js:283` | Searches all zones for a card by ID |
| `getCardDescription(card)` | `game.js:300` | Returns display text for a card |
| `setPreviewCard(card)` | `game.js:312` | Updates the preview panel |
| `enterPhase(phaseName)` | `game.js:325` | Handles phase entry logic (draw, untap, etc.) |
| `tryAdvancePhase()` | `game.js:384` | Checks conditions and advances phase or turn |
| `resolveCombatDamage()` | `game.js:421` | Resolves all combat damage |
| `initializeGame()` | `game.js:480` | Full game reset, deck building, opening hands |
| `isPlayerActive(id)` | `game.js:533` | Checks if given player is the current turn player |
| `areBothHandsHidden()` | `game.js:537` | Checks if phase is combatBlock or combatDamage |
| `shouldShowHandFaceUp(id)` | `game.js:541` | Determines if a player's hand should be visible |
| `getControllingPlayerIdForNextButton()` | `game.js:553` | Who controls the Next Phase button |
| `updateNextPhaseButtons()` | `game.js:561` | Enables/disables phase buttons |
| `updatePhaseTracker()` | `game.js:569` | Highlights the current phase in the tracker |
| `createCardElement(card, ...)` | `game.js:593` | Creates a DOM button element for a card |
| `createEmptySlotElement(text)` | `game.js:629` | Creates a placeholder for empty zones |
| `renderHand(player, ...)` | `game.js:636` | Renders a player's hand and discard slot |
| `renderBattlefieldZone(...)` | `game.js:663` | Renders a single battlefield zone |
| `renderStats()` | `game.js:678` | Updates all stat displays |
| `renderInstructions()` | `game.js:698` | Updates the instruction text |
| `renderBoard()` | `game.js:702` | Renders both players' entire board |
| `renderGame()` | `game.js:715` | Full render: stats + phases + buttons + instructions + board |
| `playLandFromHand(p, id)` | `game.js:730` | Plays a land card from hand |
| `tapOrUntapLand(p, id)` | `game.js:769` | Toggles a land's tapped state |
| `castCreatureFromHand(p, id)` | `game.js:810` | Casts a creature from hand |
| `discardCardFromHand(p, id)` | `game.js:853` | Discards a card during end-phase cleanup |
| `toggleAttacker(p, id)` | `game.js:885` | Toggles a creature's attacking state |
| `toggleSelectedBlocker(p, id)` | `game.js:928` | Selects/deselects a blocker |
| `assignBlock(defender, id)` | `game.js:964` | Assigns a blocker to an attacker |
| `handleGameCardClick(id, owner, zone)` | `game.js:1004` | Main click router — dispatches to the correct action |

---

## DOM References (all in `js/dom.js`)

DOM elements are queried once at load time and stored in global constants (`js/dom.js:4-97`). Key groups:

| Group | Lines | Variables |
|---|---|---|
| Screens | `dom.js:4-14` | `screens.welcome`, `.tutorial`, `.login`, `.loading`, `.game`, `.gameOver` |
| Welcome | `dom.js:16-17` | `startBtn` |
| Tutorial | `dom.js:21-25` | `tutorialImage`, `tutorialCounter`, navigation buttons |
| Login/Betting | `dom.js:30-43` | Name inputs, balance displays, money/bet inputs, action buttons |
| Loading | `dom.js:48-52` | Player name/bet displays, step text |
| Game screen | `dom.js:57-97` | Turn display, phase items, stat displays, next-phase buttons, zone containers, preview elements |

---

## Event Handlers (all in `js/events.js`)

| Trigger | Line | What it calls |
|---|---|---|
| Welcome "Start Game" click | `events.js:4` | `openTutorialScreen()` |
| Tutorial "Previous" click | `events.js:8` | `goToPreviousTutorialImage()` |
| Tutorial "Next" click | `events.js:12` | `goToNextTutorialImage()` |
| Tutorial "Go To Login" click | `events.js:16` | `openLoginScreen()` |
| Player "Add cash" / "Bet" input | `events.js:23-35` | `sanitizeNumberInput()` |
| Player 1 "Add cash" change | `events.js:39` | `addMoneyToPlayer(1)` |
| Player 2 "Add cash" change | `events.js:45` | `addMoneyToPlayer(2)` |
| Player 1 "Add cash" Enter | `events.js:51` | `addMoneyToPlayer(1)` |
| Player 2 "Add cash" Enter | `events.js:57` | `addMoneyToPlayer(2)` |
| "Back To Tutorial" click | `events.js:63` | `openTutorialScreen()` |
| "Let's Start" click | `events.js:67` | `validatePlayerNames()` + `validatePlayerBets()` → `openLoadingScreen()` |
| Player 1 "Next Phase" click | `events.js:81` | `tryAdvancePhase()` |
| Player 2 "Next Phase" click | `events.js:87` | `tryAdvancePhase()` |
| Any `.game-card` document click | `events.js:93` | `handleGameCardClick()` |

### Init (auto-runs on page load — `events.js:108-113`)

```
108: // INIT
109: // =========================================================
110: loadBalancesFromStorage();
111: updateBalanceDisplay();
112: updateTutorialScreen();
113: showScreen("welcome");
```
