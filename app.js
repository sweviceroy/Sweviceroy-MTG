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
        name: "Wolf Cub",
        type: "creature",
        image: "img/creature-1.png",
        power: 1,
        toughness: 1,
        cost: 1
    },
    creature2: {
        key: "creature2",
        name: "Wild Boar",
        type: "creature",
        image: "img/creature-2.png",
        power: 2,
        toughness: 2,
        cost: 2
    },
    creature3: {
        key: "creature3",
        name: "Oak Guard",
        type: "creature",
        image: "img/creature-3.png",
        power: 2,
        toughness: 3,
        cost: 3
    },
    creature4: {
        key: "creature4",
        name: "Forest Stalker",
        type: "creature",
        image: "img/creature-4.png",
        power: 3,
        toughness: 2,
        cost: 3
    },
    creature5: {
        key: "creature5",
        name: "Moss Giant",
        type: "creature",
        image: "img/creature-5.png",
        power: 4,
        toughness: 4,
        cost: 4
    },
    creature6: {
        key: "creature6",
        name: "Ancient Treant",
        type: "creature",
        image: "img/creature-6.png",
        power: 5,
        toughness: 5,
        cost: 5
    }
};


// ---------------------------------------------------------
// MAIN GAME STATE
// ---------------------------------------------------------
const gameState = {
    started: false,
    turnNumber: 1,
    currentPlayerIndex: 0, // 0 = player1, 1 = player2
    currentPhase: "draw",
    landPlayedThisTurn: false,
    selectedPreviewCardId: null,
    selectedBlockerId: null,
    pendingDiscard: false,
    combatDamageLocked: false,
    combatDamageTimeoutId: null,
    winnerPlayerId: null,
    loserPlayerId: null,
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


// ---------------------------------------------------------
// ID FACTORY
// ---------------------------------------------------------
let uniqueIdCounter = 1;

function createUniqueId(prefix) {
    const id = `${prefix}-${uniqueIdCounter}`;
    uniqueIdCounter++;
    return id;
}


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


// =========================================================
// GENERIC APP HELPERS
// =========================================================
function showScreen(screenName) {
    if (!screens[screenName]) {
        console.warn(`Screen "${screenName}" does not exist.`);
        return;
    }

    for (const key in screens) {
        screens[key].classList.remove("active-screen");
        screens[key].classList.add("hidden");
    }

    screens[screenName].classList.remove("hidden");
    screens[screenName].classList.add("active-screen");

    appState.currentScreen = screenName;
}

function sanitizeNumberInput(inputElement) {
    inputElement.value = inputElement.value.replace(/\D/g, "");
}

function parsePositiveInteger(value) {
    if (value.trim() === "") {
        return null;
    }

    if (!/^\d+$/.test(value.trim())) {
        return null;
    }

    const parsedValue = parseInt(value, 10);

    if (parsedValue <= 0) {
        return null;
    }

    return parsedValue;
}


// =========================================================
// TUTORIAL
// =========================================================
function updateTutorialScreen() {
    tutorialImage.src = tutorialState.images[tutorialState.currentIndex];
    tutorialCounter.textContent = `Step ${tutorialState.currentIndex + 1} / ${tutorialState.images.length}`;

    tutorialPrevBtn.disabled = tutorialState.currentIndex === 0;
    tutorialNextBtn.disabled = tutorialState.currentIndex === tutorialState.images.length - 1;
}

function openTutorialScreen() {
    tutorialState.currentIndex = 0;
    updateTutorialScreen();
    showScreen("tutorial");
}

function goToPreviousTutorialImage() {
    if (tutorialState.currentIndex > 0) {
        tutorialState.currentIndex--;
        updateTutorialScreen();
    }
}

function goToNextTutorialImage() {
    if (tutorialState.currentIndex < tutorialState.images.length - 1) {
        tutorialState.currentIndex++;
        updateTutorialScreen();
    }
}


// =========================================================
// LOGIN / BETTING
// =========================================================
function loadBalancesFromStorage() {
    const savedPlayer1Balance = localStorage.getItem(STORAGE_KEYS.player1Balance);
    const savedPlayer2Balance = localStorage.getItem(STORAGE_KEYS.player2Balance);

    bettingState.player1Balance = savedPlayer1Balance ? parseInt(savedPlayer1Balance, 10) : 0;
    bettingState.player2Balance = savedPlayer2Balance ? parseInt(savedPlayer2Balance, 10) : 0;
}

function saveBalancesToStorage() {
    localStorage.setItem(STORAGE_KEYS.player1Balance, bettingState.player1Balance.toString());
    localStorage.setItem(STORAGE_KEYS.player2Balance, bettingState.player2Balance.toString());
}

function updateBalanceDisplay() {
    player1BalanceText.textContent = bettingState.player1Balance;
    player2BalanceText.textContent = bettingState.player2Balance;
}

function addMoneyToPlayer(playerNumber) {
    if (playerNumber === 1) {
        const amountToAdd = parsePositiveInteger(player1AddMoneyInput.value);

        if (amountToAdd === null) {
            alert("Player 1 add cash must be a positive whole number.");
            return false;
        }

        bettingState.player1Balance += amountToAdd;
        player1AddMoneyInput.value = "";
    } else {
        const amountToAdd = parsePositiveInteger(player2AddMoneyInput.value);

        if (amountToAdd === null) {
            alert("Player 2 add cash must be a positive whole number.");
            return false;
        }

        bettingState.player2Balance += amountToAdd;
        player2AddMoneyInput.value = "";
    }

    saveBalancesToStorage();
    updateBalanceDisplay();
    return true;
}

function openLoginScreen() {
    loadBalancesFromStorage();
    updateBalanceDisplay();
    showScreen("login");
}

function validatePlayerNames() {
    const player1Name = player1NameInput.value.trim();
    const player2Name = player2NameInput.value.trim();

    if (player1Name === "" || player2Name === "") {
        alert("Both players must enter a name.");
        return false;
    }

    playerSetupState.player1Name = player1Name;
    playerSetupState.player2Name = player2Name;
    return true;
}

function validatePlayerBets() {
    const parsedPlayer1Bet = parsePositiveInteger(player1BetAmountInput.value);
    const parsedPlayer2Bet = parsePositiveInteger(player2BetAmountInput.value);

    if (parsedPlayer1Bet === null) {
        alert("Player 1 bet must be a positive whole number.");
        return false;
    }

    if (parsedPlayer2Bet === null) {
        alert("Player 2 bet must be a positive whole number.");
        return false;
    }

    if (parsedPlayer1Bet > bettingState.player1Balance) {
        alert("Player 1 bet cannot be higher than Player 1 balance.");
        return false;
    }

    if (parsedPlayer2Bet > bettingState.player2Balance) {
        alert("Player 2 bet cannot be higher than Player 2 balance.");
        return false;
    }

    bettingState.player1Bet = parsedPlayer1Bet;
    bettingState.player2Bet = parsedPlayer2Bet;

    return true;
}


// =========================================================
// LOADING
// =========================================================
function clearLoadingTimeouts() {
    for (let i = 0; i < loadingState.timeoutIds.length; i++) {
        clearTimeout(loadingState.timeoutIds[i]);
    }

    loadingState.timeoutIds = [];
}

function updateLoadingScreenInfo() {
    loadingPlayer1Name.textContent = playerSetupState.player1Name;
    loadingPlayer2Name.textContent = playerSetupState.player2Name;
    loadingPlayer1Bet.textContent = bettingState.player1Bet;
    loadingPlayer2Bet.textContent = bettingState.player2Bet;
    loadingStepText.textContent = loadingState.steps[loadingState.stepIndex];
}

function openLoadingScreen() {
    clearLoadingTimeouts();

    loadingState.stepIndex = 0;
    updateLoadingScreenInfo();
    showScreen("loading");

    for (let i = 1; i < loadingState.steps.length; i++) {
        const timeoutId = setTimeout(function () {
            loadingState.stepIndex = i;
            loadingStepText.textContent = loadingState.steps[i];
        }, i * 700);

        loadingState.timeoutIds.push(timeoutId);
    }

    const finalTimeoutId = setTimeout(function () {
        initializeGame();
        showScreen("game");
        renderGame();
    }, loadingState.steps.length * 700);

    loadingState.timeoutIds.push(finalTimeoutId);
}


// =========================================================
// GAME HELPERS
// =========================================================
function getPlayerById(playerId) {
    return gameState.players.find(player => player.id === playerId);
}

function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

function getOpponentPlayer() {
    return gameState.players[gameState.currentPlayerIndex === 0 ? 1 : 0];
}

function getDefendingPlayer() {
    return getOpponentPlayer();
}

function createCardInstance(cardDef) {
    return {
        id: createUniqueId(cardDef.type),
        key: cardDef.key,
        name: cardDef.name,
        type: cardDef.type,
        image: cardDef.image,

        cost: cardDef.cost || 0,
        power: cardDef.power || 0,
        toughness: cardDef.toughness || 0,

        tapped: false,
        summoningSick: false,
        attacking: false,
        blockingTargetId: null,
        blockedById: null,
        damageMarked: 0,
        justEnteredCombat: false
    };
}

function buildDeck() {
    const deck = [];

    // 16 Forest
    for (let i = 0; i < 16; i++) {
        deck.push(createCardInstance(CARD_LIBRARY.forest));
    }

    // 24 creatures (4 copies of each)
    const creatureKeys = [
        "creature1",
        "creature2",
        "creature3",
        "creature4",
        "creature5",
        "creature6"
    ];

    for (let i = 0; i < creatureKeys.length; i++) {
        for (let j = 0; j < 4; j++) {
            deck.push(createCardInstance(CARD_LIBRARY[creatureKeys[i]]));
        }
    }

    return shuffleArray(deck);
}

function shuffleArray(array) {
    const copied = [...array];

    for (let i = copied.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
    }

    return copied;
}

function drawCard(player) {
    if (player.library.length === 0) {
        gameOver(player.id, `tried to draw from an empty library`);
        return null;
    }

    const drawnCard = player.library.shift();
    player.hand.push(drawnCard);
    return drawnCard;
}

function drawOpeningHands() {
    for (let drawNumber = 0; drawNumber < 7; drawNumber++) {
        drawCard(gameState.players[0]);
        drawCard(gameState.players[1]);
    }
}

function clearCombatSelections() {
    for (const player of gameState.players) {
        for (const creature of player.battlefieldCreatures) {
            creature.attacking = false;
            creature.blockingTargetId = null;
            creature.blockedById = null;
            creature.damageMarked = 0;
            creature.justEnteredCombat = false;
        }
    }

    gameState.selectedBlockerId = null;
}

function clearManaPools() {
    gameState.players[0].manaPool = 0;
    gameState.players[1].manaPool = 0;
}

function untapAllForPlayer(player) {
    for (const land of player.battlefieldLands) {
        land.tapped = false;
    }

    for (const creature of player.battlefieldCreatures) {
        creature.tapped = false;
    }
}

function removeDeadCreatures(player) {
    player.battlefieldCreatures = player.battlefieldCreatures.filter(creature => {
        const survives = creature.toughness - creature.damageMarked > 0;
        return survives;
    });
}

function resetDamageMarks() {
    for (const player of gameState.players) {
        for (const creature of player.battlefieldCreatures) {
            creature.damageMarked = 0;
        }
    }
}

function gameOver(loserPlayerId, reason) {
    const loser = getPlayerById(loserPlayerId);
    const winner = gameState.players.find(player => player.id !== loserPlayerId);

    gameState.winnerPlayerId = winner.id;
    gameState.loserPlayerId = loser.id;
    gameState.message = `${loser.name} lost because ${reason}. ${winner.name} wins!`;

    instructionText.textContent = gameState.message;
    alert(gameState.message);
}

function getPhaseLabelForTracker(phase) {
    if (phase === "combatAttack" || phase === "combatBlock" || phase === "combatDamage") {
        return "combat";
    }

    return phase;
}

function getNextPhase(currentPhase) {
    const currentIndex = PHASES.indexOf(currentPhase);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= PHASES.length) {
        return null;
    }

    return PHASES[nextIndex];
}

function advanceToNextTurn() {
    clearManaPools();
    clearCombatSelections();

    const oldCurrentPlayer = getCurrentPlayer();
    for (const creature of oldCurrentPlayer.battlefieldCreatures) {
        creature.summoningSick = false;
    }

    gameState.currentPlayerIndex = gameState.currentPlayerIndex === 0 ? 1 : 0;
    gameState.turnNumber++;
    gameState.landPlayedThisTurn = false;
    gameState.pendingDiscard = false;

    enterPhase("draw");
}

function findCardAnywhereById(cardId) {
    for (const player of gameState.players) {
        const allCards = [
            ...player.hand,
            ...player.battlefieldLands,
            ...player.battlefieldCreatures
        ];

        const found = allCards.find(card => card.id === cardId);
        if (found) {
            return found;
        }
    }

    return null;
}

function getCardDescription(card) {
    if (!card) {
        return "No card selected";
    }

    if (card.type === "land") {
        return `${card.name} (Land)`;
    }

    return `${card.name} (${card.cost}) ${card.power}/${card.toughness}`;
}

function setPreviewCard(card) {
    if (!card) {
        previewCardImage.src = CARD_BACK_IMAGE;
        previewCardName.textContent = "No card selected";
        gameState.selectedPreviewCardId = null;
        return;
    }

    previewCardImage.src = card.image;
    previewCardName.textContent = getCardDescription(card);
    gameState.selectedPreviewCardId = card.id;
}


// =========================================================
// PHASE / TURN ENGINE
// =========================================================
function enterPhase(phaseName) {
    if (gameState.winnerPlayerId !== null) {
        return;
    }

    gameState.currentPhase = phaseName;
    gameState.selectedBlockerId = null;

    if (phaseName === "draw") {
        const currentPlayer = getCurrentPlayer();
        gameState.message = `${currentPlayer.name} draws a card.`;
        drawCard(currentPlayer);
        if (gameState.winnerPlayerId !== null) {
            return;
        }
    }

    if (phaseName === "untap") {
        const currentPlayer = getCurrentPlayer();
        untapAllForPlayer(currentPlayer);
        gameState.message = `${currentPlayer.name} untaps all permanents.`;
    }

    if (phaseName === "main1") {
        clearManaPools();
        gameState.message = `Main 1: play one land, tap lands for mana, or cast a creature.`;
    }

    if (phaseName === "combatAttack") {
        clearManaPools();
        clearCombatSelections();
        gameState.message = `Combat: attacker selects attacking creatures.`;
    }

    if (phaseName === "combatBlock") {
        gameState.message = `Combat: defender selects blockers. Both hands are hidden.`;
    }

    if (phaseName === "combatDamage") {
        resolveCombatDamage();
    }

    if (phaseName === "main2") {
        gameState.message = `Main 2: play spells with remaining options. Mana pool has been reset.`;
    }

    if (phaseName === "end") {
        clearManaPools();
        gameState.message = `End phase: if hand size is above 7, discard down to 7 before turn passes.`;
    }

    renderGame();
}

function tryAdvancePhase() {
    if (!gameState.started || gameState.winnerPlayerId !== null) {
        return;
    }

    if (gameState.pendingDiscard) {
        gameState.message = `You must discard down to 7 cards before ending your turn.`;
        renderGame();
        return;
    }

    if (gameState.combatDamageLocked) {
        gameState.message = `Combat damage is resolving. Please wait.`;
        renderGame();
        return;
    }

    if (gameState.currentPhase === "end") {
        const currentPlayer = getCurrentPlayer();

        if (currentPlayer.hand.length > 7) {
            gameState.pendingDiscard = true;
            gameState.message = `Discard a card from your hand. You have ${currentPlayer.hand.length} cards.`;
            renderGame();
            return;
        }

        advanceToNextTurn();
        return;
    }

    const nextPhase = getNextPhase(gameState.currentPhase);
    if (nextPhase) {
        enterPhase(nextPhase);
    }
}

function resolveCombatDamage() {
    const attacker = getCurrentPlayer();
    const defender = getDefendingPlayer();

    let summaryLines = [];

    // Blocked and unblocked attackers
    for (const attackingCreature of attacker.battlefieldCreatures.filter(creature => creature.attacking)) {
        if (attackingCreature.blockedById) {
            const blocker = defender.battlefieldCreatures.find(creature => creature.id === attackingCreature.blockedById);

            if (blocker) {
                attackingCreature.damageMarked += blocker.power;
                blocker.damageMarked += attackingCreature.power;

                summaryLines.push(
                    `${attackingCreature.name} (${attackingCreature.power}/${attackingCreature.toughness}) and ${blocker.name} (${blocker.power}/${blocker.toughness}) deal damage to each other.`
                );
            }
        } else {
            defender.life -= attackingCreature.power;
            summaryLines.push(`${attackingCreature.name} hits ${defender.name} for ${attackingCreature.power} damage.`);
        }
    }

    removeDeadCreatures(attacker);
    removeDeadCreatures(defender);

    if (defender.life <= 0) {
        gameOver(defender.id, `their life total reached 0`);
        return;
    }

    gameState.combatDamageLocked = true;
    gameState.message = summaryLines.length > 0
        ? summaryLines.join(" ")
        : `No combat damage was dealt.`;

    renderGame();

    if (gameState.combatDamageTimeoutId) {
        clearTimeout(gameState.combatDamageTimeoutId);
    }

    gameState.combatDamageTimeoutId = setTimeout(function () {
        gameState.combatDamageLocked = false;
        resetDamageMarks();
        gameState.message += " Combat damage finished. Attacker may proceed to Main 2.";
        renderGame();
    }, 5000);
}


// =========================================================
// GAME INITIALIZATION
// =========================================================
function initializeGame() {
    if (gameState.combatDamageTimeoutId) {
        clearTimeout(gameState.combatDamageTimeoutId);
    }

    uniqueIdCounter = 1;

    gameState.started = true;
    gameState.turnNumber = 1;
    gameState.currentPlayerIndex = 0;
    gameState.currentPhase = "draw";
    gameState.landPlayedThisTurn = false;
    gameState.selectedPreviewCardId = null;
    gameState.selectedBlockerId = null;
    gameState.pendingDiscard = false;
    gameState.combatDamageLocked = false;
    gameState.combatDamageTimeoutId = null;
    gameState.winnerPlayerId = null;
    gameState.loserPlayerId = null;
    gameState.message = "Welcome to battle.";

    gameState.players[0] = {
        id: 1,
        name: playerSetupState.player1Name,
        life: 10,
        manaPool: 0,
        library: buildDeck(),
        hand: [],
        battlefieldLands: [],
        battlefieldCreatures: []
    };

    gameState.players[1] = {
        id: 2,
        name: playerSetupState.player2Name,
        life: 10,
        manaPool: 0,
        library: buildDeck(),
        hand: [],
        battlefieldLands: [],
        battlefieldCreatures: []
    };

    drawOpeningHands();
    setPreviewCard(null);

    // Direkt in i draw-phase enligt reglerna
    enterPhase("draw");
}


// =========================================================
// RENDER HELPERS
// =========================================================
function isPlayerActive(playerId) {
    return getCurrentPlayer().id === playerId;
}

function areBothHandsHidden() {
    return gameState.currentPhase === "combatBlock" || gameState.currentPhase === "combatDamage";
}

function shouldShowHandFaceUp(playerId) {
    if (!gameState.started) {
        return false;
    }

    if (areBothHandsHidden()) {
        return false;
    }

    return isPlayerActive(playerId);
}

function getControllingPlayerIdForNextButton() {
    if (gameState.currentPhase === "combatBlock") {
        return getDefendingPlayer().id;
    }

    return getCurrentPlayer().id;
}

function updateNextPhaseButtons() {
    const controllingPlayerId = getControllingPlayerIdForNextButton();
    const disabledByLock = gameState.combatDamageLocked || gameState.winnerPlayerId !== null;

    player1NextPhaseBtn.disabled = disabledByLock || controllingPlayerId !== 1;
    player2NextPhaseBtn.disabled = disabledByLock || controllingPlayerId !== 2;
}

function updatePhaseTracker() {
    const allPhaseItems = [
        phaseDrawItem,
        phaseUntapItem,
        phaseMain1Item,
        phaseCombatItem,
        phaseMain2Item,
        phaseEndItem
    ];

    for (const item of allPhaseItems) {
        item.classList.remove("active-phase-item");
    }

    const trackerKey = getPhaseLabelForTracker(gameState.currentPhase);

    if (trackerKey === "draw") phaseDrawItem.classList.add("active-phase-item");
    if (trackerKey === "untap") phaseUntapItem.classList.add("active-phase-item");
    if (trackerKey === "main1") phaseMain1Item.classList.add("active-phase-item");
    if (trackerKey === "combat") phaseCombatItem.classList.add("active-phase-item");
    if (trackerKey === "main2") phaseMain2Item.classList.add("active-phase-item");
    if (trackerKey === "end") phaseEndItem.classList.add("active-phase-item");
}

function createCardElement(card, ownerId, zoneName, faceUp = true) {
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = "game-card";
    cardButton.dataset.cardId = card.id;
    cardButton.dataset.ownerId = ownerId;
    cardButton.dataset.zoneName = zoneName;

    if (card.tapped) {
        cardButton.classList.add("card-tapped");
    }

    if (card.attacking) {
        cardButton.classList.add("card-attacking");
    }

    if (card.blockingTargetId) {
        cardButton.classList.add("card-blocking");
    }

    if (card.damageMarked > 0) {
        cardButton.classList.add("card-damaged");
    }

    if (gameState.selectedPreviewCardId === card.id) {
        cardButton.classList.add("card-selected");
    }

    const image = document.createElement("img");
    image.src = faceUp ? card.image : CARD_BACK_IMAGE;
    image.alt = faceUp ? card.name : "Hidden card";

    cardButton.appendChild(image);
    return cardButton;
}

function createEmptySlotElement(text) {
    const emptySlot = document.createElement("div");
    emptySlot.className = "card-slot-placeholder";
    emptySlot.textContent = text;
    return emptySlot;
}

function renderHand(player, handZoneElement, discardZoneElement) {
    handZoneElement.innerHTML = "";
    discardZoneElement.innerHTML = "";

    const faceUp = shouldShowHandFaceUp(player.id);
    const visibleHandCards = player.hand.slice(0, 7);
    const overflowCard = player.hand[7] || null;

    if (visibleHandCards.length === 0) {
        handZoneElement.appendChild(createEmptySlotElement("Empty Hand"));
    } else {
        for (const card of visibleHandCards) {
            handZoneElement.appendChild(
                createCardElement(card, player.id, "hand", faceUp)
            );
        }
    }

    if (overflowCard) {
        discardZoneElement.appendChild(
            createCardElement(overflowCard, player.id, "discard", faceUp)
        );
    } else {
        discardZoneElement.appendChild(createEmptySlotElement("Slot 8"));
    }
}

function renderBattlefieldZone(cards, ownerId, zoneName, zoneElement, emptyText) {
    zoneElement.innerHTML = "";

    if (cards.length === 0) {
        zoneElement.appendChild(createEmptySlotElement(emptyText));
        return;
    }

    for (const card of cards) {
        zoneElement.appendChild(
            createCardElement(card, ownerId, zoneName, true)
        );
    }
}

function renderStats() {
    const player1 = getPlayerById(1);
    const player2 = getPlayerById(2);

    player1NameDisplay.textContent = player1.name;
    player2NameDisplay.textContent = player2.name;

    turnNumberDisplay.textContent = gameState.turnNumber;
    currentPlayerDisplay.textContent = getCurrentPlayer().name;

    player1DeckCount.textContent = player1.library.length;
    player2DeckCount.textContent = player2.library.length;

    player1LifeTotal.textContent = player1.life;
    player2LifeTotal.textContent = player2.life;

    player1ManaPool.textContent = player1.manaPool;
    player2ManaPool.textContent = player2.manaPool;
}

function renderInstructions() {
    instructionText.textContent = gameState.message;
}

function renderBoard() {
    const player1 = getPlayerById(1);
    const player2 = getPlayerById(2);

    renderHand(player2, player2HandZone, player2DiscardSlot);
    renderBattlefieldZone(player2.battlefieldLands, 2, "lands", player2LandsZone, "No Lands");
    renderBattlefieldZone(player2.battlefieldCreatures, 2, "creatures", player2CreaturesZone, "No Creatures");

    renderBattlefieldZone(player1.battlefieldCreatures, 1, "creatures", player1CreaturesZone, "No Creatures");
    renderBattlefieldZone(player1.battlefieldLands, 1, "lands", player1LandsZone, "No Lands");
    renderHand(player1, player1HandZone, player1DiscardSlot);
}

function renderGame() {
    if (!gameState.started) {
        return;
    }

    renderStats();
    updatePhaseTracker();
    updateNextPhaseButtons();
    renderInstructions();
    renderBoard();
}


// =========================================================
// GAME ACTIONS
// =========================================================
function playLandFromHand(player, cardId) {
    if (gameState.pendingDiscard) {
        return;
    }

    if (!isPlayerActive(player.id)) {
        return;
    }

    if (gameState.currentPhase !== "main1" && gameState.currentPhase !== "main2") {
        gameState.message = "You can only play lands during Main 1 or Main 2.";
        renderGame();
        return;
    }

    if (gameState.landPlayedThisTurn) {
        gameState.message = "You already played a land this turn.";
        renderGame();
        return;
    }

    const handIndex = player.hand.findIndex(card => card.id === cardId);
    if (handIndex === -1) {
        return;
    }

    const card = player.hand[handIndex];
    if (card.type !== "land") {
        return;
    }

    player.hand.splice(handIndex, 1);
    player.battlefieldLands.push(card);
    gameState.landPlayedThisTurn = true;
    gameState.message = `${player.name} played ${card.name}.`;
    setPreviewCard(card);
    renderGame();
}

function tapOrUntapLand(player, cardId) {
    if (gameState.pendingDiscard) {
        return;
    }

    if (!isPlayerActive(player.id)) {
        return;
    }

    if (gameState.currentPhase !== "main1" && gameState.currentPhase !== "main2") {
        gameState.message = "Lands can only be tapped during Main 1 or Main 2.";
        renderGame();
        return;
    }

    const land = player.battlefieldLands.find(card => card.id === cardId);
    if (!land) {
        return;
    }

    if (land.tapped) {
        land.tapped = false;
        player.manaPool = Math.max(0, player.manaPool - 1);
        gameState.message = `${player.name} untapped ${land.name}. Mana pool: ${player.manaPool}`;
    } else {
        land.tapped = true;
        player.manaPool += 1;
        gameState.message = `${player.name} tapped ${land.name} for 1 mana. Mana pool: ${player.manaPool}`;
    }

    setPreviewCard(land);
    renderGame();
}

function castCreatureFromHand(player, cardId) {
    if (gameState.pendingDiscard) {
        return;
    }

    if (!isPlayerActive(player.id)) {
        return;
    }

    if (gameState.currentPhase !== "main1" && gameState.currentPhase !== "main2") {
        gameState.message = "Creatures can only be cast during Main 1 or Main 2.";
        renderGame();
        return;
    }

    const handIndex = player.hand.findIndex(card => card.id === cardId);
    if (handIndex === -1) {
        return;
    }

    const card = player.hand[handIndex];
    if (card.type !== "creature") {
        return;
    }

    if (player.manaPool < card.cost) {
        gameState.message = `Not enough mana to cast ${card.name}. Cost: ${card.cost}`;
        renderGame();
        return;
    }

    player.manaPool -= card.cost;
    player.hand.splice(handIndex, 1);

    card.summoningSick = true;
    card.tapped = false;
    player.battlefieldCreatures.push(card);

    gameState.message = `${player.name} cast ${card.name}.`;
    setPreviewCard(card);
    renderGame();
}

function discardCardFromHand(player, cardId) {
    if (!gameState.pendingDiscard) {
        return;
    }

    if (!isPlayerActive(player.id)) {
        return;
    }

    const handIndex = player.hand.findIndex(card => card.id === cardId);
    if (handIndex === -1) {
        return;
    }

    const discardedCard = player.hand[handIndex];
    player.hand.splice(handIndex, 1);

    gameState.pendingDiscard = false;
    gameState.message = `${player.name} discarded a card and is now at ${player.hand.length} cards.`;

    if (player.hand.length > 7) {
        gameState.pendingDiscard = true;
        gameState.message = `${player.name} must discard again until hand size is 7.`;
    }

    if (gameState.selectedPreviewCardId === discardedCard.id) {
        setPreviewCard(null);
    }

    renderGame();
}

function toggleAttacker(player, cardId) {
    if (!isPlayerActive(player.id)) {
        return;
    }

    if (gameState.currentPhase !== "combatAttack") {
        gameState.message = "You can only choose attackers during Combat.";
        renderGame();
        return;
    }

    const creature = player.battlefieldCreatures.find(card => card.id === cardId);
    if (!creature) {
        return;
    }

    if (creature.tapped && !creature.attacking) {
        gameState.message = `${creature.name} is tapped and cannot attack.`;
        renderGame();
        return;
    }

    if (creature.summoningSick && !creature.attacking) {
        gameState.message = `${creature.name} has summoning sickness and cannot attack.`;
        renderGame();
        return;
    }

    if (creature.attacking) {
        creature.attacking = false;
        creature.tapped = false;
        creature.blockedById = null;
        gameState.message = `${creature.name} is no longer attacking.`;
    } else {
        creature.attacking = true;
        creature.tapped = true;
        gameState.message = `${creature.name} is attacking.`;
    }

    setPreviewCard(creature);
    renderGame();
}

function toggleSelectedBlocker(player, cardId) {
    if (gameState.currentPhase !== "combatBlock") {
        return;
    }

    const creature = player.battlefieldCreatures.find(card => card.id === cardId);
    if (!creature) {
        return;
    }

    if (creature.blockingTargetId) {
        const attacker = getCurrentPlayer().battlefieldCreatures.find(card => card.id === creature.blockingTargetId);
        if (attacker) {
            attacker.blockedById = null;
        }

        creature.blockingTargetId = null;
        gameState.selectedBlockerId = null;
        gameState.message = `${creature.name} is no longer blocking.`;
        setPreviewCard(creature);
        renderGame();
        return;
    }

    if (creature.tapped) {
        gameState.message = `${creature.name} is tapped and cannot block.`;
        renderGame();
        return;
    }

    gameState.selectedBlockerId = creature.id;
    gameState.message = `${creature.name} selected as blocker. Now click an attacking creature to block.`;
    setPreviewCard(creature);
    renderGame();
}

function assignBlock(defender, attackerCardId) {
    if (gameState.currentPhase !== "combatBlock") {
        return;
    }

    if (!gameState.selectedBlockerId) {
        return;
    }

    const attacker = getCurrentPlayer().battlefieldCreatures.find(card => card.id === attackerCardId);
    const blocker = defender.battlefieldCreatures.find(card => card.id === gameState.selectedBlockerId);

    if (!attacker || !blocker) {
        return;
    }

    if (!attacker.attacking) {
        gameState.message = "That creature is not attacking.";
        renderGame();
        return;
    }

    if (attacker.blockedById) {
        gameState.message = "That attacker already has a blocker.";
        renderGame();
        return;
    }

    blocker.blockingTargetId = attacker.id;
    attacker.blockedById = blocker.id;
    gameState.selectedBlockerId = null;

    gameState.message = `${blocker.name} is now blocking ${attacker.name}.`;
    setPreviewCard(blocker);
    renderGame();
}


// =========================================================
// GAME CLICK ROUTER
// =========================================================
function handleGameCardClick(cardId, ownerId, zoneName) {
    if (!gameState.started || gameState.winnerPlayerId !== null) {
        return;
    }

    const owner = getPlayerById(Number(ownerId));
    const card = findCardAnywhereById(cardId);

    if (!owner || !card) {
        return;
    }

    // Preview first
    if (zoneName !== "discard" || shouldShowHandFaceUp(owner.id)) {
        if (card.type === "land" || card.type === "creature") {
            setPreviewCard(card);
        }
    }

    // Discard has priority
    if (gameState.pendingDiscard && zoneName === "hand" && isPlayerActive(owner.id)) {
        discardCardFromHand(owner, cardId);
        return;
    }

    if (gameState.pendingDiscard && zoneName === "discard" && isPlayerActive(owner.id)) {
        discardCardFromHand(owner, cardId);
        return;
    }

    // Hand actions
    if (zoneName === "hand" || zoneName === "discard") {
        if (card.type === "land") {
            playLandFromHand(owner, cardId);
            return;
        }

        if (card.type === "creature") {
            castCreatureFromHand(owner, cardId);
            return;
        }
    }

    // Lands on battlefield
    if (zoneName === "lands") {
        tapOrUntapLand(owner, cardId);
        return;
    }

    // Creatures on battlefield
    if (zoneName === "creatures") {
        if (gameState.currentPhase === "combatAttack") {
            toggleAttacker(owner, cardId);
            return;
        }

        if (gameState.currentPhase === "combatBlock") {
            // Defender clicking own creature to select/cancel blocker
            if (owner.id === getDefendingPlayer().id) {
                toggleSelectedBlocker(owner, cardId);
                return;
            }

            // Defender selected blocker, then clicks attacker target
            if (owner.id === getCurrentPlayer().id) {
                assignBlock(getDefendingPlayer(), cardId);
                return;
            }
        }
    }

    renderGame();
}


// =========================================================
// EVENT LISTENERS - WELCOME / TUTORIAL
// =========================================================
startBtn.addEventListener("click", function () {
    openTutorialScreen();
});

tutorialPrevBtn.addEventListener("click", function () {
    goToPreviousTutorialImage();
});

tutorialNextBtn.addEventListener("click", function () {
    goToNextTutorialImage();
});

tutorialLoginBtn.addEventListener("click", function () {
    openLoginScreen();
});


// =========================================================
// EVENT LISTENERS - LOGIN INPUT SANITIZING
// =========================================================
player1AddMoneyInput.addEventListener("input", function () {
    sanitizeNumberInput(player1AddMoneyInput);
});

player2AddMoneyInput.addEventListener("input", function () {
    sanitizeNumberInput(player2AddMoneyInput);
});

player1BetAmountInput.addEventListener("input", function () {
    sanitizeNumberInput(player1BetAmountInput);
});

player2BetAmountInput.addEventListener("input", function () {
    sanitizeNumberInput(player2BetAmountInput);
});

player1AddMoneyInput.addEventListener("change", function () {
    if (player1AddMoneyInput.value.trim() !== "") {
        addMoneyToPlayer(1);
    }
});

player2AddMoneyInput.addEventListener("change", function () {
    if (player2AddMoneyInput.value.trim() !== "") {
        addMoneyToPlayer(2);
    }
});

player1AddMoneyInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addMoneyToPlayer(1);
    }
});

player2AddMoneyInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addMoneyToPlayer(2);
    }
});

loginBackBtn.addEventListener("click", function () {
    openTutorialScreen();
});

startMatchBtn.addEventListener("click", function () {
    const namesAreValid = validatePlayerNames();
    const betsAreValid = validatePlayerBets();

    if (!namesAreValid || !betsAreValid) {
        return;
    }

    openLoadingScreen();
});


// =========================================================
// EVENT LISTENERS - GAME BUTTONS
// =========================================================
player1NextPhaseBtn.addEventListener("click", function () {
    if (!player1NextPhaseBtn.disabled) {
        tryAdvancePhase();
    }
});

player2NextPhaseBtn.addEventListener("click", function () {
    if (!player2NextPhaseBtn.disabled) {
        tryAdvancePhase();
    }
});


// ---------------------------------------------------------
// EVENT DELEGATION - GAME ZONES
// ---------------------------------------------------------
document.addEventListener("click", function (event) {
    const clickedCard = event.target.closest(".game-card");

    if (!clickedCard) {
        return;
    }

    handleGameCardClick(
        clickedCard.dataset.cardId,
        clickedCard.dataset.ownerId,
        clickedCard.dataset.zoneName
    );
});


// =========================================================
// INIT
// =========================================================
loadBalancesFromStorage();
updateBalanceDisplay();
updateTutorialScreen();
showScreen("welcome");