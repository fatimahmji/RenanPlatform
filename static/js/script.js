document.addEventListener("DOMContentLoaded", function () {
  // Get references to the elements
  const createVoiceOverButton = document.getElementById("create-voice-over");
  const audioElement = document.getElementById("audio-result");
  const ttsInputTextArea = document.getElementById("tts-input");
  const textGenInputTextArea = document.getElementById("text-gen-input");

  // Define the paths and text you want to use
  const audioPath = "../music/test-2024-08-14_17-51-38-xtts.wav"; // Change this to the actual path of your audio file
  const textToSet = "مرحبًا بكم في منصتنا، منصة الإبداع والتميز."; // Change this to the text you want to set

  // Event listener for the "create-voice-over" button
  createVoiceOverButton.addEventListener("click", function () {
    // Set the audio element's source and make it visible
    audioElement.src = audioPath;
    audioElement.hidden = false;

    // Set the text area with the desired text
    ttsInputTextArea.value = textToSet;
  });
});
