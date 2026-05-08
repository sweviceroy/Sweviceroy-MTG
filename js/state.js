// =========================================================
// SweViceroy MTG
// Single-file MVP app logic
// Screens + tutorial + betting + loading + main game
// =========================================================

// ---------------------------------------------------------
// APP STATE
// ---------------------------------------------------------
const appState = {
    currentScreen: "welcome"
};

// ---------------------------------------------------------
// TUTORIAL STATE
// ---------------------------------------------------------
const tutorialState = {
    currentIndex: 0,
    images: [
        "img/tutorial-1.png",
        "img/tutorial-2.png",
        "img/tutorial-3.png",
        "img/tutorial-4.png",
        "img/tutorial-5.png",
        "img/tutorial-6.png"
    ]
};

// ---------------------------------------------------------
// BETTING / LOGIN STATE
// ---------------------------------------------------------
const bettingState = {
    player1Balance: 0,
    player2Balance: 0,
    player1Bet: 0,
    player2Bet: 0
};

const playerSetupState = {
    player1Name: "Player 1",
    player2Name: "Player 2"
};

const loadingState = {
    stepIndex: 0,
    steps: [
        "Shuffling decks...",
        "Drawing starting hands...",
        "Preparing battlefield...",
        "Rolling for first turn..."
    ],
    timeoutIds: []
};

const STORAGE_KEYS = {
    player1Balance: "sweviceroy_player1_balance",
    player2Balance: "sweviceroy_player2_balance"
};

// ---------------------------------------------------------
// GAME CONSTANTS
// ---------------------------------------------------------
const PHASES = [
    "draw",
    "untap",
    "main1",
    "combatAttack",
    "combatBlock",
    "combatDamage",
    "main2",
    "end"
];

const CARD_BACK_IMAGE = "img/card-back.png";

const CARD_LIBRARY = {
    forest: {
        key: "forest",
        name: "Forest",
        type: "land",
        image: "img/forest.png"
    },

    creature1: {
        key: "creature1",
        name: "Pepe the Poor",
        type: "creature",
        image: "img/creature-1.png",
        power: 1,
        toughness: 1,
        cost: 1
    },
    creature2: {
        key: "creature2",
        name: "Wojak the Weak",
        type: "creature",
        image: "img/creature-2.png",
        power: 1,
        toughness: 2,
        cost: 1
    },
    creature3: {
        key: "creature3",
        name: "Pepe the Scrappy",
        type: "creature",
        image: "img/creature-3.png",
        power: 2,
        toughness: 2,
        cost: 3
    },
    creature4: {
        key: "creature4",
        name: "Wojak the Worker",
        type: "creature",
        image: "img/creature-4.png",
        power: 3,
        toughness: 2,
        cost: 3
    },
    creature5: {
        key: "creature5",
        name: "Pepe, Forest Knight",
        type: "creature",
        image: "img/creature-5.png",
        power: 3,
        toughness: 4,
        cost: 5
    },
    creature6: {
        key: "creature6",
        name: "Wojakbeast",
        type: "creature",
        image: "img/creature-6.png",
        power: 4,
        toughness: 4,
        cost: 5
    }
};

// ---------------------------------------------------------
// MAIN GAME STATE
// ---------------------------------------------------------
const gameState = {
    started: false,
    turnNumber: 1,
    currentPlayerIndex: 0,
    currentPhase: "draw",
    landPlayedThisTurn: false,
    selectedPreviewCardId: null,
    selectedBlockerId: null,
    pendingDiscard: false,
    combatDamageLocked: false,
    combatDamageTimeoutId: null,
    winnerPlayerId: null,
    loserPlayerId: null,
    endReason: "",
    betResolved: false,
    message: "",

    players: [
        {
            id: 1,
            name: "Player 1",
            life: 10,
            manaPool: 0,
            library: [],
            hand: [],
            battlefieldLands: [],
            battlefieldCreatures: []
        },
        {
            id: 2,
            name: "Player 2",
            life: 10,
            manaPool: 0,
            library: [],
            hand: [],
            battlefieldLands: [],
            battlefieldCreatures: []
        }
    ]
};
