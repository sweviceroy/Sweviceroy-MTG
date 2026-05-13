# File Reference

A complete list of every file in the project — what it does, and which other files it depends on.

---

## Root

### `index.html`
**What it does**: The single HTML page that loads all CSS and JavaScript files in dependency order. It contains all the UI markup: welcome screen, tutorial carousel, login/betting panels, loading animation, game board layout (left sidebar, center battlefield, right sidebar), and game over screen.

**Connects to**: All 19 CSS files (`<link>` at lines 8-27), all 6 JS files (`<script>` at lines 424-428).

### `ARCHITECTURE.md`
**What it does**: Documents the entire application architecture: screen flow, game mechanics, state management, rendering pipeline, combat resolution, and the card library. Each function is listed with its file and line number for traceability.

**Connects to**: Every file in `js/` and `css/` (documents their contents).

---

## CSS — `css/base/`

### `reset.css`
**What it does**: Global reset styles — removes margin/padding from all elements, sets `box-sizing: border-box`, and defines the `body` background color (`#45804f`, green battlefield) and base font. Everything inherits from these foundational rules.

**Connects to**: Loaded first, provides base context for all other CSS files.

### `variables.css`
**What it does**: An empty placeholder for future CSS custom properties (design tokens like colors, spacing, font sizes). Currently contains only a header comment.

**Connects to**: Intended to be referenced by all other CSS files once variables are defined.

---

## CSS — `css/layouts/`

### `screen-system.css`
**What it does**: Defines the screen switching system — `.screen` (full-viewport containers), `.active-screen` (visible), `.hidden` (invisible), `.screen-content` (centered container), and generic `h2`/`p` typography. This is the foundation for showing/hiding each game screen.

**Connects to**: `reset.css` (inherits base body font), all screen-specific CSS files (`welcome.css`, `tutorial.css`, etc.) extend these rules.

### `game-layout.css`
**What it does**: Creates the three-column game layout (`#game-screen` and `.game-layout` grid with `100px 1fr 300px` columns) and the sidebar container flexboxes. Defines the overall structure that holds all game UI elements.

**Connects to**: `screen-system.css` (uses `.screen`), `panels.css` and `preview.css` and `phase-tracker.css` (components that live inside the sidebars), `zones.css` and `game-board.css` (components inside the center column).

### `game-board.css`
**What it does**: Defines the center battlefield as a 6-row CSS grid (`auto / auto / 1fr / 1fr / auto / auto`) that stacks player 2's stats, hand, battlefield, then player 1's battlefield, hand, and stats from top to bottom. This is the main play area where cards are rendered.

**Connects to**: `game-layout.css` (lives in the center column), `zones.css` (styles each row's inner items), `cards.css` (styles individual card elements inside zones).

---

## CSS — `css/components/`

### `buttons.css`
**What it does**: Styles all `<button>` elements with green background, hover lift effect, active press, and disabled gray-out. Applied globally to every button in the app — from "Start Game" to "Next Phase".

**Connects to**: Used by all screens (`welcome.css`, `tutorial.css`, `login.css`, etc.) and game UI (`panels.css` via `.next-phase-btn`).

### `panels.css`
**What it does**: Styles the shared sidebar panels (`game-brand-panel`, `turn-info-panel`, `instruction-panel`), their headings, the instruction text area, and the entire player header/stats section (name block, stat boxes, deck/life/mana displays, next-phase button). These panels form the left and right sidebars of the game screen.

**Connects to**: `game-layout.css` (lives inside `.game-sidebar-left` and `.game-sidebar-right`), `buttons.css` (uses button styles), `preview.css` (sibling in right sidebar).

### `phase-tracker.css`
**What it does**: Styles the phase tracker list — a vertical list of 6 phases (Draw, Untap, Main 1, Combat, Main 2, End) with the active phase highlighted in blue via `.active-phase-item`. Helps players see where they are in the turn cycle.

**Connects to**: `panels.css` (lives inside `.phase-tracker-panel`), `game-layout.css` (left sidebar).

### `preview.css`
**What it does**: Styles the card preview panel — a large image display and card name text in the right sidebar. The image uses `aspect-ratio: 5/7` and `object-fit: contain` for proper card proportions.

**Connects to**: `panels.css` (sibling in right sidebar, shares `.preview-panel` class), `game-layout.css` (right sidebar).

### `zones.css`
**What it does**: Styles all battlefield zones — `.hand-section` (player hand areas), `.battlefield-side` (2-column grid with `2fr 1fr` for creatures/lands), `.zone-block` (individual zone containers), `.battlefield-zone` (inner card display areas), and `.hand-zone`/`.discard-slot-zone` (hand card slots with 8th-card overflow slot). Includes the Player 2 ordering fix (`.battlefield-side-top .zone-block:first-child` swaps `order`).

**Connects to**: `game-board.css` (lives inside the board grid), `cards.css` (styles cards placed inside these zones), `game-layout.css` (overall layout).

### `cards.css`
**What it does**: Sizes card elements in each zone — 68px wide in battlefield zones, 74px wide in hand zones, with `aspect-ratio: 5/7` for proper card proportions. All cards share the `.game-card` class with transparent border fallback and rounded corners.

**Connects to**: `zones.css` (cards live inside zones), `visual-states.css` (adds state-based transforms on top of base card styles).

---

## CSS — `css/screens/`

### `welcome.css`
**What it does**: Styles the welcome screen — large green title, subtitle text, and centered "Start Game" button. This is the first thing the player sees.

**Connects to**: `screen-system.css` (uses `.screen-content`), `buttons.css` (uses `<button>` styles).

### `tutorial.css`
**What it does**: Styles the tutorial screen — image wrapper with transparent border, tutorial image with max-height constraint, and navigation button row. Shows a step-by-step image carousel.

**Connects to**: `screen-system.css` (uses `.screen-content`), `buttons.css` (uses `<button>` styles).

### `login.css`
**What it does**: Styles the login and betting screen — two-column panel grid with player name inputs, balance displays, add-cash fields, and bet-amount fields. Includes form layout (`.form-row` grid), input styling, and bottom action buttons.

**Connects to**: `screen-system.css` (uses `.screen-content`), `buttons.css` (uses `<button>` styles).

### `loading.css`
**What it does**: Styles the loading screen — centered card container with two-column player info grid, animated step text area, and a spinning border-based CSS loader (`.loading-spinner` with `@keyframes spin`). Shows during the 2.8-second mock deck-shuffling sequence.

**Connects to**: `screen-system.css` (uses `.screen-content`), `animations.css` (spinner animation), `buttons.css`.

### `gameover.css`
**What it does**: Styles the game over screen — centered content with transparent border, used to display winner/loser announcement and action buttons.

**Connects to**: `screen-system.css` (uses `.screen-content`), `buttons.css`.

---

## CSS — `css/states/`

### `visual-states.css`
**What it does**: Adds visual state classes for cards — `.card-tapped` (rotated 90°), `.card-attacking` (lifted 10px), `.card-selected` (yellow outline), `.card-blocking` (blue outline), `.card-damaged` (red outline). Applied dynamically by the JavaScript render pipeline.

**Connects to**: `cards.css` (applied on top of base card styles), `game.js` (JS applies/removes these classes).

### `animations.css`
**What it does**: Defines the `@keyframes spin` animation used by the loading screen spinner. A full 360-degree rotation loop at 1-second intervals.

**Connects to**: `loading.css` (`.loading-spinner` references `animation: spin 1s linear infinite`).

---

## CSS — Root

### `responsive.css`
**What it does**: Contains all responsive breakpoints — `1400px` (narrower layout columns), `1200px` (single-column mobile layout), `850px` (stacked login panels), `600px` (full-width buttons, stacked stat blocks). Enables the game to work on smaller screens.

**Connects to**: All layout and component CSS files (overrides grid widths, flex directions, padding at each breakpoint).

---

## JavaScript — `js/`

### `state.js`
**What it does**: Defines all global state objects (`appState`, `tutorialState`, `bettingState`, `playerSetupState`, `loadingState`, `gameState`), game constants (`PHASES`, `CARD_BACK_IMAGE`, `CARD_LIBRARY` with 6 creatures and 1 land), and localStorage key constants. This is the single source of truth for the entire application.

**Connects to**: Every other JS file reads from these state objects. `helpers.js:15` reads `screens` from `dom.js`. `screens.js` reads `bettingState`/`tutorialState`. `game.js` reads `gameState`/`CARD_LIBRARY`.

### `dom.js`
**What it does**: Queries and stores all 40+ DOM element references in global constants — screen containers, tutorial elements, login inputs, loading displays, game zone containers, phase tracker items, and stat displays. Runs once at page load so no DOM queries happen during gameplay.

**Connects to**: Loaded after `state.js` (which it doesn't depend on) and before `helpers.js` (which calls `screens[key]`). Used by `screens.js`, `game.js`, and `events.js`.

### `helpers.js`
**What it does**: Contains cross-cutting utility functions — `createUniqueId()` (generates unique card IDs), `showScreen()` (screen visibility manager that iterates the `screens` object), `sanitizeNumberInput()` (strips non-digits from number fields), and `parsePositiveInteger()` (validates positive integer input). These are used by both screen logic and game logic.

**Connects to**: `state.js` (reads `appState`), `dom.js` (reads `screens` object). Called by `screens.js` (parsePositiveInteger, showScreen), `game.js` (createUniqueId), and `events.js` (sanitizeNumberInput).

### `screens.js`
**What it does**: Contains all screen-specific logic — tutorial navigation (`updateTutorialScreen`, `openTutorialScreen`, `goToPrevious/NextTutorialImage`), login/betting (`loadBalancesFromStorage`, `saveBalancesToStorage`, `updateBalanceDisplay`, `addMoneyToPlayer`, `validatePlayerNames`, `validatePlayerBets`), and loading (`clearLoadingTimeouts`, `updateLoadingScreenInfo`, `openLoadingScreen`). Each function orchestrates its screen's behavior.

**Connects to**: `state.js` (reads `bettingState`, `tutorialState`, `loadingState`, `playerSetupState`), `dom.js` (reads all DOM elements), `helpers.js` (calls `showScreen`, `parsePositiveInteger`), `game.js` (calls `initializeGame`, `renderGame` from `openLoadingScreen`).

### `game.js`
**What it does**: The largest file — contains all game logic: card instance creation, deck building/shuffling, draw mechanics, mana tapping/untapping, creature casting, combat resolution (attack declaration, blocker assignment, damage dealing), phase engine (entering phases, advancing turns), rendering (stats, phase tracker, board, cards, preview), click routing, game-over logic with bet resolution. ~500 lines covering every gameplay action.

**Connects to**: `state.js` (reads all game state + `CARD_LIBRARY`), `dom.js` (reads all DOM elements), `helpers.js` (calls `createUniqueId`, `showScreen`), `screens.js` (calls `clearLoadingTimeouts`, `saveBalancesToStorage`, `updateBalanceDisplay`), `events.js` (events trigger functions in this file).

### `events.js`
**What it does**: Wires all event listeners in the application — welcome button, tutorial navigation, login input sanitizing (input/change/Enter), match start validation, next-phase buttons, document-level card click delegation, and the auto-running init sequence (`loadBalancesFromStorage` → `updateBalanceDisplay` → `updateTutorialScreen` → `showScreen("welcome")`). This is the entry point that starts the application.

**Connects to**: `dom.js` (reads all DOM elements for event binding), `helpers.js` (calls `sanitizeNumberInput`), `screens.js` (calls all screen functions), `game.js` (calls `tryAdvancePhase`, `handleGameCardClick`). Must be loaded last because every other file must exist before events reference them.
