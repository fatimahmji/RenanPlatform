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

document.getElementById('create').addEventListener('click', async function () {
  const textInput = document.getElementById('text-gen-input').value;
  const ttsInput = document.getElementById('tts-input');

  try {
      ttsInput.placeholder = 'أملئ وقتك بالاستغفار...';

      // Fetch request to Flask API
      const response = await fetch('/generate-text', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ input: textInput })
      });

      const data = await response.json();
      const generatedText = data.generated_text;

      ttsInput.value = '';
      let i = 0;
      const speed = 50; // Adjust typing speed
      function typeWriter() {
          if (i < generatedText.length) {
              ttsInput.value += generatedText.charAt(i);
              i++;
              setTimeout(typeWriter, speed);
          }
      }
      typeWriter();

  } catch (error) {
      console.error('Error:', error);
  }
});

document.getElementById('create').addEventListener('click', function() {
  const text = document.getElementById('tts-input').value;
  const speakerId = document.getElementById('speaker-select').value;
  const speed = document.getElementById('speed-select').value;
  const bgMusicFilename = document.getElementById('music-select').value;

  fetch('/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          text: text,
          speaker_id: speakerId,
          speed: speed,
          bg_music_filename: bgMusicFilename
      })
  })
  .then(response => response.blob())
  .then(blob => {
      const audioElement = document.getElementById('audio-result');
      const audioURL = URL.createObjectURL(blob);
      audioElement.src = audioURL;
      audioElement.play();
  })
  .catch(error => console.error('Error:', error));
});
