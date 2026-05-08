// ---------------------------------------------------------
// DOM REFERENCES - SCREENS
// ---------------------------------------------------------
const screens = {
    welcome: document.getElementById("welcome-screen"),
    tutorial: document.getElementById("tutorial-screen"),
    login: document.getElementById("login-screen"),
    loading: document.getElementById("loading-screen"),
    game: document.getElementById("game-screen"),
    gameOver: document.getElementById("gameover-screen")
};

// ---------------------------------------------------------
// DOM REFERENCES - WELCOME
// ---------------------------------------------------------
const startBtn = document.getElementById("start-btn");

// ---------------------------------------------------------
// DOM REFERENCES - TUTORIAL
// ---------------------------------------------------------
const tutorialImage = document.getElementById("tutorial-image");
const tutorialCounter = document.getElementById("tutorial-counter");
const tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
const tutorialNextBtn = document.getElementById("tutorial-next-btn");
const tutorialLoginBtn = document.getElementById("tutorial-login-btn");

// ---------------------------------------------------------
// DOM REFERENCES - LOGIN / BETTING
// ---------------------------------------------------------
const player1NameInput = document.getElementById("player1-name");
const player2NameInput = document.getElementById("player2-name");

const player1BalanceText = document.getElementById("player1-balance");
const player2BalanceText = document.getElementById("player2-balance");

const player1AddMoneyInput = document.getElementById("player1-add-money");
const player2AddMoneyInput = document.getElementById("player2-add-money");

const player1BetAmountInput = document.getElementById("player1-bet-amount");
const player2BetAmountInput = document.getElementById("player2-bet-amount");

const loginBackBtn = document.getElementById("login-back-btn");
const startMatchBtn = document.getElementById("start-match-btn");

// ---------------------------------------------------------
// DOM REFERENCES - LOADING
// ---------------------------------------------------------
const loadingPlayer1Name = document.getElementById("loading-player1-name");
const loadingPlayer2Name = document.getElementById("loading-player2-name");
const loadingPlayer1Bet = document.getElementById("loading-player1-bet");
const loadingPlayer2Bet = document.getElementById("loading-player2-bet");
const loadingStepText = document.getElementById("loading-step-text");

// ---------------------------------------------------------
// DOM REFERENCES - GAME SCREEN
// ---------------------------------------------------------
const turnNumberDisplay = document.getElementById("turn-number-display");
const currentPlayerDisplay = document.getElementById("current-player-display");
const instructionText = document.getElementById("instruction-text");

const phaseDrawItem = document.getElementById("phase-draw-item");
const phaseUntapItem = document.getElementById("phase-untap-item");
const phaseMain1Item = document.getElementById("phase-main1-item");
const phaseCombatItem = document.getElementById("phase-combat-item");
const phaseMain2Item = document.getElementById("phase-main2-item");
const phaseEndItem = document.getElementById("phase-end-item");

const player1NameDisplay = document.getElementById("player1-name-display");
const player2NameDisplay = document.getElementById("player2-name-display");

const player1DeckCount = document.getElementById("player1-deck-count");
const player2DeckCount = document.getElementById("player2-deck-count");

const player1LifeTotal = document.getElementById("player1-life-total");
const player2LifeTotal = document.getElementById("player2-life-total");

const player1ManaPool = document.getElementById("player1-mana-pool");
const player2ManaPool = document.getElementById("player2-mana-pool");

const player1NextPhaseBtn = document.getElementById("player1-next-phase-btn");
const player2NextPhaseBtn = document.getElementById("player2-next-phase-btn");

const player1HandZone = document.getElementById("player1-hand-zone");
const player2HandZone = document.getElementById("player2-hand-zone");
const player1DiscardSlot = document.getElementById("player1-discard-slot");
const player2DiscardSlot = document.getElementById("player2-discard-slot");

const player1LandsZone = document.getElementById("player1-lands-zone");
const player2LandsZone = document.getElementById("player2-lands-zone");

const player1CreaturesZone = document.getElementById("player1-creatures-zone");
const player2CreaturesZone = document.getElementById("player2-creatures-zone");

const previewCardImage = document.getElementById("preview-card-image");
const previewCardName = document.getElementById("preview-card-name");

const gameOverScreenContent = document.querySelector("#gameover-screen .screen-content");
