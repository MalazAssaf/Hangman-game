const hintSentence = document.querySelector(".hint span");
const letterContainer = document.querySelector(".letters-container");
let hang = document.querySelector(".hang");

// Setting the keyboard functionality
const keys = document.querySelectorAll(".key"); 

// Check 
function check(guessedWord){
    guessedWord = guessedWord.toUpperCase().split(""); // converting it to array
    let wrongTries = 0;
    keys.forEach(key => {
        let letter = key.textContent.toUpperCase(); // get the key value and convert to uppercase
        key.addEventListener("click", () => {
            if(guessedWord.includes(letter)){ // if the user selects the right letter
                    guessedWord.map((e, index)=>{
                        if(letter===e){
                            letterContainer.childNodes[index].value = letter; // change every occurrence of key
                            key.classList.add("disabled"); // disable the key
                        }
                    })
            }
            else{
                hang.children[wrongTries].style.display = "flex";
                wrongTries++;
                if(wrongTries===10){
                    gameover(keys);
                }
            }
        });
    });
}

function gameover(keys){
    keys.forEach(key=>{
        key.classList.add("disabled");
    })
}

// Selecting the word randomly 
const chooseWord = function (words){
    let categories = Object.keys(words);
    // Make a random variable to get the index of the catagory
    const randomCategoryIndex = Math.floor(Math.random() * categories.length);
    // Make a random variable depending on the categories number
    const randomCategory = categories[randomCategoryIndex];
    // Get the length of the values of the selected category
    const numOfValues = words[randomCategory].length;
    // Make a constant value that select a random value from the selected category
    const randomValue = Math.floor(Math.random() * numOfValues);
    // Make the selected word
    const selectedWord = words[randomCategory][randomValue];
    console.log(`The selected word is ${selectedWord}`);
    // Setting the key of the value (hint)
    hintSentence.textContent = `${randomCategory}`;
    return selectedWord;
}

// Making inputs feild
function makingPlots(selectedWord){
    let length = selectedWord.length;
    for(let i = 0; i<length; i++){
        const input = document.createElement("input");
        input.type = "text";
        input.className = "letter";
        input.setAttribute("maxlength", "1"); // put the size to 1
        letterContainer.appendChild(input);
    }
}

// A function to take the data from json file
async function fetchingWords(link){
    let response = await fetch(link);
    let words = await response.json();
    return words;
}

// Loading words from json file
async function loadingData() {
    // Calling the function to load the words
    const loadedWords = await fetchingWords("./words.json");
    // Calling it after taking words from promise, otherwise the promise will not finish!
    // So I had to use await to make the chooseWord function wait until the data is loaded successfully!
    const word = chooseWord(loadedWords);
    makingPlots(word);
    check(word);
}

loadingData();
