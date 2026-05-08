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
