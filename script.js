// Get references to the button and message elements
const changeTextButton = document.getElementById("changeTextBtn");
const messageParagraph = document.getElementById("message");
const pageTitle = document.getElementById("pageTitle");
const titleInput = document.getElementById("titleInput");
const confirmTitleButton = document.getElementById("confirmTitleBtn");

// Add a click event to the button
changeTextButton.addEventListener("click", function () {
  // Change the text shown on the page when clicked
  messageParagraph.textContent = "Great job! You clicked the button.";
});

// Add a click event to confirm title changes
confirmTitleButton.addEventListener("click", function () {
  // Get the text from the input and remove extra spaces
  const newTitle = titleInput.value.trim();

  // Only change the title when user typed something
  if (newTitle) {
    pageTitle.textContent = newTitle;
    titleInput.value = "";
  }
});
