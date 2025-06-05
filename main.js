// Selecting elements from the DOM
const hintSentence = document.querySelector(".hint span");
const letterContainer = document.querySelector(".letters-container");
const hang = document.querySelector(".hang"); // The hang parts
const keys = document.querySelectorAll(".key"); // Used for disabling keys
const keyboard = document.getElementById('keyboard');

// Sounds
const correctSound = ("./audio/correct-6033.mp3");
const wrongSound = ("./audio/wrong-47985.mp3");
const winningSound = ("./audio/goodresult-82807.mp3");
const losingSound = ("./audio/fail-144746.mp3");

let wrongTries = 0; // Counter to track wrong guesses (used for losing)
let rightTries = 0; // Counter to track correct guesses (used for winning)
let currentWord = []; // Holds the current guessed word as an array

// Setting the keyboard functionality (Event Listener added once only)
keyboard.addEventListener('click', (event) => {
    const target = event.target; // Hold the clicked key
    if (target.classList.contains('key') && !target.classList.contains('disabled')) {
        const letter = target.textContent.toUpperCase(); // Get the letter and make it uppercase
        if (currentWord.includes(letter)) {
            playSound(correctSound);
            // Reveal all occurrences of the letter
            currentWord.forEach((char, index) => {
                if (letter === char) {
                    letterContainer.children[index].value = letter; // Show correct letter
                    rightTries++;
                }
            });
            // Check win condition
            if (rightTries === currentWord.length) {
                win(currentWord.join("")); // Take the guessed word from currentWord
            }
        }
        else {
            // Wrong guess - show a part of the hangman
            playSound(wrongSound);
            hang.children[wrongTries].style.display = "flex";
            wrongTries++;
            // Check losing condition
            if (wrongTries === hang.children.length) {
                lose(currentWord.join(""));
            }
        }
        target.classList.add("disabled"); // Disable the clicked key
    }
});

// A function to set the current guessed word globally
function setCurrentWord(word) {
    currentWord = word.toUpperCase().split(""); // Convert word to uppercase array
}

// A function to disable all keys after win or lose
function disablingKeys() {
    keys.forEach(key => key.classList.add("disabled"));
}

// A function to display the losing screen
function lose(guessedWord) {
    const loseBox = document.querySelector(".losing");
    const holder = document.querySelector(".losing .losing-para span");
    disablingKeys(); // Disable keys
    setTimeout(() => {
        showingWinAndLose(loseBox, holder, guessedWord); // Show losing box and word
        playSound(losingSound);
    }, 500);
}

// A function to display the winning screen
function win(guessedWord) {
    const winBox = document.querySelector(".winning");
    const holder = document.querySelector(".winning .winning-para span");
    disablingKeys(); // Disable keys
    setTimeout(() => {
        showingWinAndLose(winBox, holder, guessedWord); // Show winning box and word
        playSound(winningSound);    
    }, 500);
}

// Making Sounds
function playSound(src) {
    const sound = new Audio(src); // Make a new object to avoid not running state
    sound.play();
}

// A reusable function to show win or lose box
function showingWinAndLose(box, wordHolder, guessedWord) {
    box.style.display = "flex"; // Show the box
    wordHolder.textContent = guessedWord; // Put the correct word inside the box
}

// Selecting a random word from the JSON file
function chooseWord(words) {
    const categories = Object.keys(words); // Get the categories from the object
    const randomCategoryIndex = Math.floor(Math.random() * categories.length); // Get random index
    const randomCategory = categories[randomCategoryIndex]; // Select a category
    const numOfValues = words[randomCategory].length; // Get length of selected category
    const randomValue = Math.floor(Math.random() * numOfValues); // Select random value index
    const selectedWord = words[randomCategory][randomValue]; // Get the word
    hintSentence.textContent = `${randomCategory}`; // Show the hint (category name)
    console.log(selectedWord)
    return selectedWord;
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

// Fetching the words from the JSON file
async function fetchingWords(link) {
    try{
        const response = await fetch(link);
        const words = await response.json();
        return words;
    }
    catch(e){
        console.log(`An error occurred: ${e}`)
    }
}

// Main function to start the game
async function run() {
    const loadedWords = await fetchingWords("./words.json"); // Load words from file
    const word = chooseWord(loadedWords); // Select random word
    setCurrentWord(word); // Set the current word
    makingPlots(word); // Create letter inputs based on word length
}

run(); // Call the main function to start the game

// Retry button handling (reset the game)
const retryBtns = document.querySelectorAll(".retry-btn");
retryBtns.forEach(btn => {
    btn.addEventListener("click", resetGame); // Add event listener to all retry buttons
});

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
    // Load a new word
    const loadedWords = await fetchingWords("./words.json");
    const newWord = chooseWord(loadedWords);
    setCurrentWord(newWord); // Set the new word globally
    makingPlots(newWord); // Create new inputs
}