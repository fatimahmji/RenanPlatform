document.addEventListener("DOMContentLoaded", function () {
  // Get references to the elements
  const createVoiceOverButton = document.getElementById("create-voice-over");
  const createBroadcastButton = document.getElementById("create-boadcast");
  const audioElement = document.getElementById("audio-result");
  const ttsInputTextArea = document.getElementById("tts-input");
  const textGenInput = document.getElementById("text-gen-input");
  const createButton = document.getElementById("create");

  function resetCreateButton() {
    createButton.innerHTML = `
      <img src="../static/images/icons/create.png" alt="انشاء" class="btn-icon">
      انـشــاء
    `;
    createButton.disabled = false;
  }

  function resetTextGen(){
    textGenInput.innerHTML = `<textarea id="text-gen-input" class="input-textarea no-scroll" style="height: 80px;"
              placeholder="اكتب فكرتك هنا ليتم انشاء نص إبداعي لها.."></textarea> <br>`;
  }

  // Function to handle the pre-defined button logic
  function handlePredefinedText(buttonType) {
    const predefinedData = {
      "create-voice-over": {
        audioPath:
          "D:/AI_Bayan_Project/Renan-Platform-1/RenanPlatform/speaker1.wav",
        text: "مرحبًا بكم في منصتنا، منصة الإبداع والتميز.",
      },
      "create-boadcast": {
        audioPath: "../static/audio/music/music2.wav",
        text: "مرحبًا بك.",
      },
    };

    const selectedData = predefinedData[buttonType];
    if (selectedData) {
      audioElement.src = selectedData.audioPath;
      audioElement.hidden = false;
      ttsInputTextArea.value = selectedData.text;
    }
  }

  // Event listeners for pre-defined buttons
  createVoiceOverButton.addEventListener("click", function () {
    handlePredefinedText("create-voice-over");
  });

  createBroadcastButton.addEventListener("click", function () {
    handlePredefinedText("create-boadcast");
  });

  // Event listener for the "Create" button to generate audio
  createButton.addEventListener("click", async function () {
    const textInput = textGenInput.value;
    const ttsInput = ttsInputTextArea.value;

    // Ensure only one text area is filled
    if (textInput && ttsInput) {
      alert("الرجاء أملئ فقط واحده من الخانات فقط");
      return;
    }

    // If the user is generating new text
    if (textInput) {
      try {
        createButton.innerHTML = "يتم إنتاج النص...";
        createButton.disabled = true;
        const response = await fetch("/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: textInput }),
        });

        const data = await response.json();
        const generatedText = data.generated_text;

        ttsInputTextArea.value = "";
        let i = 0;
        const speed = 10; // Typing speed
        function typeWriter() {
          if (i < generatedText.length) {
            ttsInputTextArea.value += generatedText.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
          }
        }
        typeWriter();
        resetCreateButton();
        resetTextGen();
      } catch (error) {
        console.error("Error:", error);
        resetCreateButton();
      }
    }
    // If the user is converting text to speech
    else if (ttsInput) {
      createButton.innerText = "يتم تحويل النص إل صوت...";
      createButton.disabled = true;
      const text = ttsInput;
      const speakerId =
        document.getElementById("speaker-select").value || "speaker1"; // Default speaker
      const speed = document.getElementById("speed-select").value || "1.00"; // Default speed
      const bgMusicFilename =
        document.getElementById("music-select").value || "no-music"; // Default to no music

      try {
        const response = await fetch("/generate-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            speaker_id: speakerId,
            speed: speed,
            bg_music_filename: bgMusicFilename,
          }),
        });

        const blob = await response.blob();
        const audioURL = URL.createObjectURL(blob);
        audioElement.src = audioURL;
        audioElement.play();

        resetCreateButton();
      } catch (error) {
        console.error("Error:", error);
        resetCreateButton();
      }
    }
  });
});
