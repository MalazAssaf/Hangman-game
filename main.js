// ===========================
// 1. Game State Variables
// ===========================

let wrongTries = 0;
let rightTries = 0;
let currentWord = [];
let currentLanguage = "en"; // Set English by default
let keys;

// ===========================
// 2. Language & Keyboard Setup
// ===========================

const language = {
    en: {
        exp_sentence: "Guess the word to help the poor man!",
        win: "✨ Congrats! You saved the hangman and cracked the word:",
        lose: "💀 Oh no! The hangman couldn't be saved. The correct word was:",
        retry: "Retry"
    },
    ar: {
        exp_sentence: "خمن الكلمة لإنقاذ الرجل!",
        win: "✨ مبروك! أنقذت الرجل واكتشفت الكلمة:",
        lose: "💀 للأسف! لم يتم إنقاذ الرجل. الكلمة الصحيحة كانت:",
        retry: "أعد المحاولة"
    }
};

const keyboardLayOut = {
    en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    ar: "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ئ".split(" ")
};

// ===========================
// 3. DOM Elements
// ===========================

const hintSentence = document.querySelector(".hint span"); // To put the hint later
const expSentence = document.querySelector(".exp-sentence"); // To put explanation 
const letterContainer = document.querySelector(".letters-container");
const hang = document.querySelector(".hang");
const keyboard = document.getElementById('keyboard');

const enBtn = document.querySelectorAll(".eng");
const araBtn = document.querySelectorAll(".ara");
const retryBtns = document.querySelectorAll(".retry-btn");

// ===========================
// 4. Event Listeners
// ===========================

// Language switch buttons
enBtn.forEach(btn => {
    btn.addEventListener("click", function () {
        switchLang("en");
        document.querySelector(".start-game").style.display = "none";
    });
});

araBtn.forEach(btn => {
    btn.addEventListener("click", function () {
        switchLang("ar");
        document.querySelector(".start-game").style.display = "none";
    });
});

// Keyboard input
keyboard.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('key') && !target.classList.contains('disabled')) {
        const letter = target.textContent.toUpperCase();

        if (currentWord.includes(letter)) {
            playSound(correctSound);
            currentWord.forEach((char, index) => {
                if (letter === char) {
                    letterContainer.children[index].value = letter; // put the later in the input field
                    rightTries++;
                }
            });
            if (rightTries === currentWord.length) { // the user wins
                win(currentWord.join(""));
            }
        }
        else {
            playSound(wrongSound);
            hang.children[wrongTries].style.display = "flex"; // show a part from the hang
            wrongTries++;
            if (wrongTries === hang.children.length) { // The user loses
                lose(currentWord.join(""));
            }
        }
        target.classList.add("disabled"); // disable the clicked key
    }
});

// Retry buttons
retryBtns.forEach(btn => {
    btn.addEventListener("click", resetGame);
});

// ===========================
// 5. Game Initialization
// ===========================

function switchLang(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Set the UI text
    expSentence.innerHTML = language[lang].exp_sentence;
    document.querySelector(".winning-para").innerHTML = language[lang].win + " <span></span>";
    document.querySelector(".losing-para").innerHTML = language[lang].lose + " <span></span>";
    document.querySelectorAll(".retry-btn").forEach(btn => {
        btn.childNodes[0].textContent = language[lang].retry + " ";
    });

    makingKeyboard(lang);
    // start the game
    run(lang);
}

//making the keyboard either Arabic or English
function makingKeyboard(lang) {
    keyboard.innerHTML = "";
    const keysOfBoards = keyboardLayOut[lang];
    const rowLength = lang === "ar" ? 10 : 9;

    for (let i = 0; i < keysOfBoards.length; i += rowLength) {
        const row = document.createElement("div");
        row.className = "row";
        keysOfBoards.slice(i, i + rowLength).forEach(letter => {
            const btn = document.createElement("button");
            btn.className = "key";
            btn.textContent = letter;
            row.appendChild(btn);
        });
        keyboard.appendChild(row);
    }
}

// Running the game
async function run(lang) {
    const file = lang === "ar" ? "./arabicWords.json" : "./words.json";
    const loadedWords = await fetchingWords(file);
    const word = chooseWord(loadedWords);
    setCurrentWord(word);
    makingPlots(word);
}

// ===========================
// 6. Word Management
// ===========================

async function fetchingWords(link) {
    try {
        const response = await fetch(link);
        const words = await response.json();
        return words;
    } catch (e) {
        console.log(`An error occurred: ${e}`);
    }
}

function chooseWord(words) {
    const categories = Object.keys(words); // Get the categories from the object
    const randomCategoryIndex = Math.floor(Math.random() * categories.length); // Get random index
    const randomCategory = categories[randomCategoryIndex]; // Select a category
    const numOfValues = words[randomCategory].length; // Get length of selected category
    const randomValue = Math.floor(Math.random() * numOfValues); // Select random value index
    const selectedWord = words[randomCategory][randomValue]; // Get the word
    hintSentence.textContent = `${randomCategory}`; // Show the hint (category name)
    return selectedWord;
}

// A function to set the current guessed word globally
function setCurrentWord(word) {
    currentWord = word.toUpperCase().split(""); // Convert word to uppercase array
}

// Creating the letter input fields dynamically
function makingPlots(selectedWord) {
    letterContainer.innerHTML = ""; // Clear previous letters
    for (let i = 0; i < selectedWord.length; i++) {
        const input = document.createElement("input");
        input.value = "";
        input.type = "text";
        input.className = "letter";
        input.setAttribute("maxlength", "1"); // Limit input size to 1 character
        input.disabled = true; // Prevent manual typing
        letterContainer.appendChild(input); // Append input field
    }
}

// ===========================
// 7. Game Endings (Win/Lose)
// ===========================

function win(guessedWord) {
    const winBox = document.querySelector(".winning");
    const holder = document.querySelector(".winning .winning-para span");
    disablingKeys();
    setTimeout(() => {
        showingWinAndLose(winBox, holder, guessedWord);
        playSound(winningSound);
    }, 500);
}

function lose(guessedWord) {
    const loseBox = document.querySelector(".losing");
    const holder = document.querySelector(".losing .losing-para span");
    disablingKeys();
    setTimeout(() => {
        showingWinAndLose(loseBox, holder, guessedWord);
        playSound(losingSound);
    }, 500);
}

function showingWinAndLose(box, wordHolder, guessedWord) {
    box.style.display = "flex";
    wordHolder.textContent = guessedWord;
}

// A function to disable all keys after win or lose
function disablingKeys() {
    keys = document.querySelectorAll(".key"); // Used for disabling keys
    keys.forEach(key => key.classList.add("disabled"));
}

// ===========================
// 8. Game Reset
// ===========================

// Reset the game state when retrying
async function resetGame() {
    wrongTries = 0;
    rightTries = 0;
    letterContainer.innerHTML = ""; // Clear old letter inputs
    // Hide all hangman parts
    Array.from(hang.children).forEach(part => part.style.display = "none");
    // Re-enable all keyboard keys
    keys.forEach(key => key.classList.remove("disabled"));
    // Hide win/lose boxes
    document.querySelector(".winning").style.display = "none";
    document.querySelector(".losing").style.display = "none";
    // Choose the file depnding on the selected language before
    resetingLanguage = currentLanguage === "ar" ? "./arabicWords.json" : "./words.json";
    // Load a new word
    const loadedWords = await fetchingWords(resetingLanguage);
    const newWord = chooseWord(loadedWords);
    setCurrentWord(newWord); // Set the new word globally
    makingPlots(newWord); // Create new inputs
}

// ===========================
// 9. Audio Setup
// ===========================

const correctSound = ("./audio/correct-6033.mp3");
const wrongSound = ("./audio/wrong-47985.mp3");
const winningSound = ("./audio/goodresult-82807.mp3");
const losingSound = ("./audio/fail-144746.mp3");

function playSound(src) {
    const sound = new Audio(src); // Make a new object to avoid not running state
    sound.play();
}