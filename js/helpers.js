// ---------------------------------------------------------
// ID FACTORY
// ---------------------------------------------------------
let uniqueIdCounter = 1;

function createUniqueId(prefix) {
    const id = `${prefix}-${uniqueIdCounter}`;
    uniqueIdCounter++;
    return id;
}

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
