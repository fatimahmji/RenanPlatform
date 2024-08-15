document.addEventListener("DOMContentLoaded", function () {
  // Get references to the elements
  const createVoiceOverButton = document.getElementById("create-voice-over");
  const createBoadcastButton = document.getElementById("create-boadcast");
  const audioElement = document.getElementById("audio-result");
  const ttsInputTextArea = document.getElementById("tts-input");

  // Define the paths and text you want to use
  const audioPath = "../static/audio/music/music1.wav"; // Change this to the actual path of your audio file
  const textToSet = "مرحبًا بكم في منصتنا، منصة الإبداع والتميز."; // Change this to the text you want to set

  const audioPath2 = "../static/audio/music/music2.wav"; // Change this to the actual path of your audio file
  const textToSet2 = "مرحبًا بكl."; // Change this to the text you want to set

 // Common function to handle the logic based on the button clicked
 function handleButtonClick(buttonType) {
  if (buttonType === "create-voice-over") {
    // Set the audio element's source and make it visible
    audioElement.src = audioPath;
    audioElement.hidden = false;

    // Set the text area with the desired text
    ttsInputTextArea.value = textToSet;
    
  } else if (buttonType === "create-boadcast") {
    // Set the audio element's source and make it visible
    audioElement.src = audioPath2;
    audioElement.hidden = false;

    // Set the text area with the desired text
    ttsInputTextArea.value = textToSet2;
  }
}

// Event listener for the "create-voice-over" button
createVoiceOverButton.addEventListener("click", function () {
  handleButtonClick("create-voice-over");
});

// Event listener for the "create-broadcast" button
createBoadcastButton.addEventListener("click", function () {
  handleButtonClick("create-boadcast");
});
});