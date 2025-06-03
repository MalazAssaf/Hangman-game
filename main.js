// Setting the keyboard functionality
const output = document.getElementById("output"); // Setting the pressed keys in the output feild
const keys = document.querySelectorAll(".key"); 
keys.forEach(key => {
    key.addEventListener("click", () => {
        output.value += key.textContent;
    });
});

