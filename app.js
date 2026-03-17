// =========================================================
// SweViceroy MTG - App Navigation
// MVP version: basic screen switching + tutorial slideshow
// =========================================================


// ---------------------------------------------------------
// App state
// Håller koll på vilken screen som visas just nu
// ---------------------------------------------------------
const appState = {
    currentScreen: "welcome"
};


// ---------------------------------------------------------
// Tutorial state
// Separat state för tutorial-bilderna
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
// Screen references
// Samlar alla screens på ett ställe
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
// Welcome button references
// ---------------------------------------------------------
const startBtn = document.getElementById("start-btn");


// ---------------------------------------------------------
// Tutorial element references
// ---------------------------------------------------------
const tutorialImage = document.getElementById("tutorial-image");
const tutorialCounter = document.getElementById("tutorial-counter");
const tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
const tutorialNextBtn = document.getElementById("tutorial-next-btn");
const tutorialLoginBtn = document.getElementById("tutorial-login-btn");


// ---------------------------------------------------------
// showScreen
// Byter synlig screen genom att:
// 1. gömma alla
// 2. visa rätt screen
// 3. uppdatera appState
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
// updateTutorialScreen
// Visar rätt tutorialbild + counter
// och disable:ar prev/next vid kanterna
// ---------------------------------------------------------
function updateTutorialScreen() {
    const currentImagePath = tutorialState.images[tutorialState.currentIndex];

    tutorialImage.src = currentImagePath;
    tutorialCounter.textContent = `Step ${tutorialState.currentIndex + 1} / ${tutorialState.images.length}`;

    tutorialPrevBtn.disabled = tutorialState.currentIndex === 0;
    tutorialNextBtn.disabled = tutorialState.currentIndex === tutorialState.images.length - 1;
}


// ---------------------------------------------------------
// goToNextTutorialImage
// Flyttar ett steg fram om möjligt
// ---------------------------------------------------------
function goToNextTutorialImage() {
    if (tutorialState.currentIndex < tutorialState.images.length - 1) {
        tutorialState.currentIndex++;
        updateTutorialScreen();
    }
}


// ---------------------------------------------------------
// goToPreviousTutorialImage
// Flyttar ett steg bak om möjligt
// ---------------------------------------------------------
function goToPreviousTutorialImage() {
    if (tutorialState.currentIndex > 0) {
        tutorialState.currentIndex--;
        updateTutorialScreen();
    }
}


// ---------------------------------------------------------
// openTutorialScreen
// Återställer tutorial till första bilden och visar screen
// ---------------------------------------------------------
function openTutorialScreen() {
    tutorialState.currentIndex = 0;
    updateTutorialScreen();
    showScreen("tutorial");
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
    showScreen("login");
});


// ---------------------------------------------------------
// Init
// Startläge när sidan laddas
// ---------------------------------------------------------
updateTutorialScreen();
showScreen("welcome");