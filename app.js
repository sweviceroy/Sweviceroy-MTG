// =========================================================
// SweViceroy MTG - App Navigation
// MVP version: screen switching + tutorial + login/betting
// =========================================================


// ---------------------------------------------------------
// App state
// ---------------------------------------------------------
const appState = {
    currentScreen: "welcome"
};


// ---------------------------------------------------------
// Tutorial state
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
// Betting / player setup state
// Nu har båda spelarna egen bet
// ---------------------------------------------------------
const bettingState = {
    player1Balance: 0,
    player2Balance: 0,
    player1Bet: 0,
    player2Bet: 0
};


// ---------------------------------------------------------
// Player setup state
// Sparar namn så loading-screen kan visa dem
// ---------------------------------------------------------
const playerSetupState = {
    player1Name: "Player 1",
    player2Name: "Player 2"
};


// ---------------------------------------------------------
// Loading state
// Enkel fake-loading för MVP
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// LocalStorage keys
// ---------------------------------------------------------
const STORAGE_KEYS = {
    player1Balance: "sweviceroy_player1_balance",
    player2Balance: "sweviceroy_player2_balance"
};


// ---------------------------------------------------------
// Screen references
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
// Welcome references
// ---------------------------------------------------------
const startBtn = document.getElementById("start-btn");


// ---------------------------------------------------------
// Tutorial references
// ---------------------------------------------------------
const tutorialImage = document.getElementById("tutorial-image");
const tutorialCounter = document.getElementById("tutorial-counter");
const tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
const tutorialNextBtn = document.getElementById("tutorial-next-btn");
const tutorialLoginBtn = document.getElementById("tutorial-login-btn");


// ---------------------------------------------------------
// Login / betting references
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
// Loading screen references
// ---------------------------------------------------------
const loadingPlayer1Name = document.getElementById("loading-player1-name");
const loadingPlayer2Name = document.getElementById("loading-player2-name");
const loadingPlayer1Bet = document.getElementById("loading-player1-bet");
const loadingPlayer2Bet = document.getElementById("loading-player2-bet");
const loadingStepText = document.getElementById("loading-step-text");


// ---------------------------------------------------------
// Helper: showScreen
// ---------------------------------------------------------
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

    console.log(`Current screen: ${appState.currentScreen}`);
}


// ---------------------------------------------------------
// Helper: sanitizeNumberInput
// Tar bort allt som inte är siffror
// ---------------------------------------------------------
function sanitizeNumberInput(inputElement) {
    inputElement.value = inputElement.value.replace(/\D/g, "");
}


// ---------------------------------------------------------
// Helper: parsePositiveInteger
// Returnerar heltal eller null om ogiltigt
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// Tutorial functions
// ---------------------------------------------------------
function updateTutorialScreen() {
    const currentImagePath = tutorialState.images[tutorialState.currentIndex];

    tutorialImage.src = currentImagePath;
    tutorialCounter.textContent = `Step ${tutorialState.currentIndex + 1} / ${tutorialState.images.length}`;

    tutorialPrevBtn.disabled = tutorialState.currentIndex === 0;
    tutorialNextBtn.disabled = tutorialState.currentIndex === tutorialState.images.length - 1;
}

function goToNextTutorialImage() {
    if (tutorialState.currentIndex < tutorialState.images.length - 1) {
        tutorialState.currentIndex++;
        updateTutorialScreen();
    }
}

function goToPreviousTutorialImage() {
    if (tutorialState.currentIndex > 0) {
        tutorialState.currentIndex--;
        updateTutorialScreen();
    }
}

function openTutorialScreen() {
    tutorialState.currentIndex = 0;
    updateTutorialScreen();
    showScreen("tutorial");
}


// ---------------------------------------------------------
// LocalStorage / balance functions
// ---------------------------------------------------------
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
    }
    else if (playerNumber === 2) {
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


// ---------------------------------------------------------
// Login / betting functions
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// Loading functions
// ---------------------------------------------------------
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
        showScreen("game");
    }, loadingState.steps.length * 700);

    loadingState.timeoutIds.push(finalTimeoutId);
}

function startMatchSetup() {
    const namesAreValid = validatePlayerNames();
    const betsAreValid = validatePlayerBets();

    if (!namesAreValid || !betsAreValid) {
        return;
    }

    openLoadingScreen();
}


// ---------------------------------------------------------
// Event listeners - Welcome
// ---------------------------------------------------------
startBtn.addEventListener("click", function () {
    openTutorialScreen();
});


// ---------------------------------------------------------
// Event listeners - Tutorial
// ---------------------------------------------------------
tutorialPrevBtn.addEventListener("click", function () {
    goToPreviousTutorialImage();
});

tutorialNextBtn.addEventListener("click", function () {
    goToNextTutorialImage();
});

tutorialLoginBtn.addEventListener("click", function () {
    openLoginScreen();
});


// ---------------------------------------------------------
// Event listeners - Input sanitizing
// Vi rensar direkt så bara siffror kan skrivas in
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// Event listeners - Add cash
// Här kör vi add cash när man lämnar textboxen
// eftersom du inte längre har separata add-knappar
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// Event listeners - Login / betting
// ---------------------------------------------------------
loginBackBtn.addEventListener("click", function () {
    openTutorialScreen();
});

startMatchBtn.addEventListener("click", function () {
    startMatchSetup();
});


// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
loadBalancesFromStorage();
updateBalanceDisplay();
updateTutorialScreen();
showScreen("welcome");