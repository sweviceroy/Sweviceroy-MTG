// =========================================================
// SweViceroy MTG - App Navigation
// MVP version: basic screen switching
// =========================================================


// ---------------------------------------------------------
// App state
// Vi håller reda på vilken app-screen som visas just nu
// ---------------------------------------------------------
const appState = {
    currentScreen: "welcome"
};


// ---------------------------------------------------------
// Screen references
// Samlar alla screens på ett ställe så det blir lättare sen
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
// Button references
// Just nu har vi bara welcome-knapparna kopplade
// ---------------------------------------------------------
const startBtn = document.getElementById("start-btn");

// ---------------------------------------------------------
// showScreen
// Byter synlig screen genom att:
// 1. gömma alla
// 2. visa rätt screen
// 3. uppdatera appState
// ---------------------------------------------------------
function showScreen(screenName) {
    // Safety check så vi inte försöker visa nåt som inte finns
    if (!screens[screenName]) {
        console.warn(`Screen "${screenName}" does not exist.`);
        return;
    }

    // Göm alla screens
    for (const key in screens) {
        screens[key].classList.remove("active-screen");
        screens[key].classList.add("hidden");
    }

    // Visa vald screen
    screens[screenName].classList.remove("hidden");
    screens[screenName].classList.add("active-screen");

    // Spara current app screen
    appState.currentScreen = screenName;

    console.log(`Current screen: ${appState.currentScreen}`);
}


// ---------------------------------------------------------
// Event listeners
// Just nu skickar båda knapparna vidare till tutorial-screen
// enligt din plan / flowchart
// ---------------------------------------------------------
startBtn.addEventListener("click", function () {
    showScreen("tutorial");
});



// ---------------------------------------------------------
// Init
// Säkerställer att rätt första screen visas vid sidladdning
// ---------------------------------------------------------
showScreen("welcome");