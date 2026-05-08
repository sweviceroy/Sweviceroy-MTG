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

    for (let i = 0; i < 16; i++) {
        deck.push(createCardInstance(CARD_LIBRARY.forest));
    }

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
        gameOver(player.id, "tried to draw from an empty library");
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

        if (gameState.winnerPlayerId !== null) {
            return;
        }
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
        return creature.toughness - creature.damageMarked > 0;
    });
}

function resetDamageMarks() {
    for (const player of gameState.players) {
        for (const creature of player.battlefieldCreatures) {
            creature.damageMarked = 0;
        }
    }
}

function stopGameTimers() {
    clearLoadingTimeouts();

    if (gameState.combatDamageTimeoutId) {
        clearTimeout(gameState.combatDamageTimeoutId);
        gameState.combatDamageTimeoutId = null;
    }

    gameState.combatDamageLocked = false;
}

function renderGameOverScreen() {
    const winner = getPlayerById(gameState.winnerPlayerId);
    const loser = getPlayerById(gameState.loserPlayerId);

    if (!gameOverScreenContent || !winner || !loser) {
        return;
    }

    gameOverScreenContent.innerHTML = `
        <h2>Game Over</h2>
        <p><strong>${winner.name}</strong> wins!</p>
        <p>${loser.name} lost because ${gameState.endReason}.</p>
        <p style="margin-top: 1rem;">
            ${winner.name} new balance: <strong>${winner.id === 1 ? bettingState.player1Balance : bettingState.player2Balance}</strong>
        </p>
        <p>
            ${loser.name} new balance: <strong>${loser.id === 1 ? bettingState.player1Balance : bettingState.player2Balance}</strong>
        </p>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="play-again-btn" type="button" disabled>Play Again</button>
            <button id="back-to-welcome-btn" type="button">Back To Welcome</button>
        </div>
    `;

    const playAgainBtn = document.getElementById("play-again-btn");
    const backToWelcomeBtn = document.getElementById("back-to-welcome-btn");

    playAgainBtn.addEventListener("click", function () {
        initializeGame();
        showScreen("game");
        renderGame();
    });

    backToWelcomeBtn.addEventListener("click", function () {
        showScreen("welcome");
    });
}

function applyBetResults(winnerPlayerId, loserPlayerId) {
    if (gameState.betResolved) {
        return;
    }

    const loserBetAmount = loserPlayerId === 1
        ? bettingState.player1Bet
        : bettingState.player2Bet;

    if (winnerPlayerId === 1) {
        bettingState.player1Balance += loserBetAmount;
        bettingState.player2Balance -= loserBetAmount;
    } else {
        bettingState.player2Balance += loserBetAmount;
        bettingState.player1Balance -= loserBetAmount;
    }

    bettingState.player1Balance = Math.max(0, bettingState.player1Balance);
    bettingState.player2Balance = Math.max(0, bettingState.player2Balance);

    saveBalancesToStorage();
    updateBalanceDisplay();

    gameState.betResolved = true;
}

function gameOver(loserPlayerId, reason) {
    if (gameState.winnerPlayerId !== null) {
        return;
    }

    const loser = getPlayerById(loserPlayerId);
    const winner = gameState.players.find(player => player.id !== loserPlayerId);

    if (!loser || !winner) {
        return;
    }

    stopGameTimers();

    gameState.winnerPlayerId = winner.id;
    gameState.loserPlayerId = loser.id;
    gameState.endReason = reason;

    applyBetResults(winner.id, loser.id);

    gameState.message = `${loser.name} lost because ${reason}. ${winner.name} wins!`;

    renderGameOverScreen();
    showScreen("gameOver");
}

// =========================================================
// PHASE / TURN ENGINE
// =========================================================
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
        gameState.message = "Main 1: play one land, tap lands for mana, or cast a creature.";
    }

    if (phaseName === "combatAttack") {
        clearManaPools();
        clearCombatSelections();
        gameState.message = "Combat: attacker selects attacking creatures.";
    }

    if (phaseName === "combatBlock") {
        gameState.message = "Combat: defender selects blockers. Both hands are hidden.";
    }

    if (phaseName === "combatDamage") {
        resolveCombatDamage();

        if (gameState.winnerPlayerId !== null) {
            return;
        }
    }

    if (phaseName === "main2") {
        gameState.message = "Main 2: play spells with remaining options. Mana pool has been reset.";
    }

    if (phaseName === "end") {
        clearManaPools();
        gameState.message = "End phase: if hand size is above 7, discard down to 7 before turn passes.";
    }

    renderGame();
}

function tryAdvancePhase() {
    if (!gameState.started || gameState.winnerPlayerId !== null) {
        return;
    }

    if (gameState.pendingDiscard) {
        gameState.message = "You must discard down to 7 cards before ending your turn.";
        renderGame();
        return;
    }

    if (gameState.combatDamageLocked) {
        gameState.message = "Combat damage is resolving. Please wait.";
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

    const summaryLines = [];

    for (const attackingCreature of attacker.battlefieldCreatures.filter(creature => creature.attacking)) {
        if (attackingCreature.blockedById) {
            const blocker = defender.battlefieldCreatures.find(creature => creature.id === attackingCreature.blockedById);

            if (blocker) {
                attackingCreature.damageMarked += blocker.power;
                blocker.damageMarked += attackingCreature.power;

                summaryLines.push(
                    `${attackingCreature.name} and ${blocker.name} deal damage to each other.`
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
        gameOver(defender.id, "their life total reached 0");
        return;
    }

    gameState.combatDamageLocked = true;
    gameState.message = summaryLines.length > 0
        ? summaryLines.join(" ")
        : "No combat damage was dealt.";

    renderGame();

    if (gameState.combatDamageTimeoutId) {
        clearTimeout(gameState.combatDamageTimeoutId);
    }

    gameState.combatDamageTimeoutId = setTimeout(function () {
        if (gameState.winnerPlayerId !== null) {
            return;
        }

        gameState.combatDamageLocked = false;
        gameState.combatDamageTimeoutId = null;
        resetDamageMarks();
        gameState.message += " Combat damage finished. Attacker may proceed to Main 2.";
        renderGame();
    }, 100);
}

// =========================================================
// GAME INITIALIZATION
// =========================================================
function initializeGame() {
    stopGameTimers();

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
    gameState.winnerPlayerId = null;
    gameState.loserPlayerId = null;
    gameState.endReason = "";
    gameState.betResolved = false;
    gameState.message = "Welcome to the game! Let the battle begin!";

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

    if (gameState.winnerPlayerId === null) {
        enterPhase("draw");
    }
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
    if (!gameState.started || gameState.winnerPlayerId !== null) {
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
        if (player.manaPool <= 0) {
            gameState.message = `${land.name} cannot be untapped. Its mana has already been spent this turn.`;
            setPreviewCard(land);
            renderGame();
            return;
        }

        land.tapped = false;
        player.manaPool -= 1;
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

    gameState.message = `${player.name} cast ${card.name}. Mana pool: ${player.manaPool}`;
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

    if (zoneName !== "discard" || shouldShowHandFaceUp(owner.id)) {
        if (card.type === "land" || card.type === "creature") {
            setPreviewCard(card);
        }
    }

    if (gameState.pendingDiscard && zoneName === "hand" && isPlayerActive(owner.id)) {
        discardCardFromHand(owner, cardId);
        return;
    }

    if (gameState.pendingDiscard && zoneName === "discard" && isPlayerActive(owner.id)) {
        discardCardFromHand(owner, cardId);
        return;
    }

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

    if (zoneName === "lands") {
        tapOrUntapLand(owner, cardId);
        return;
    }

    if (zoneName === "creatures") {
        if (gameState.currentPhase === "combatAttack") {
            toggleAttacker(owner, cardId);
            return;
        }

        if (gameState.currentPhase === "combatBlock") {
            if (owner.id === getDefendingPlayer().id) {
                toggleSelectedBlocker(owner, cardId);
                return;
            }

            if (owner.id === getCurrentPlayer().id) {
                assignBlock(getDefendingPlayer(), cardId);
                return;
            }
        }
    }

    renderGame();
}
