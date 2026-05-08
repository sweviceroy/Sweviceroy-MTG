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
