document.addEventListener("DOMContentLoaded", function () {
  // Get references to the elements
  const createVoiceOverButton = document.getElementById("create-voice-over");
  const createBroadcastButton = document.getElementById("create-boadcast");
  const audioElement = document.getElementById("audio-result");
  const ttsInputTextArea = document.getElementById("tts-input");
  const textGenInput = document.getElementById("text-gen-input");
  const createButton = document.getElementById("create");
  const playButton = document.getElementById("playButton");
  const playIcon = playButton.querySelector(".play-icon");

  function resetCreateButton() {
    createButton.innerHTML = `
      <img src="../static/images/icons/create.png" alt="انشاء" class="btn-icon">
      انـشــاء
    `;
    createButton.disabled = false;
  }

  function resetTextGen() {
    textGenInput.innerHTML = `<textarea id="text-gen-input" class="input-textarea no-scroll" style="height: 80px;"
              placeholder="اكتب فكرتك هنا ليتم انشاء نص إبداعي لها.."></textarea> <br>`;
  }

  // Function to handle the pre-defined button logic
  function handlePredefinedText(buttonType) {
    const predefinedData = {
      "create-voice-over": {
        audioPath: "../audio/samples/RenanSample.wav",
        text: "مرحبًا بكم في منصتنا، منصة الإبداع والتميز.",
      },
      "create-boadcast": {
        audioPath: "../audio/samples/bodcastSample.wav",
        text: "كِلنا عِنْدِنا صُندوقْ أفْكار، فِكرة جَتْنَا فِي، السيارة اوالطَيَّارة، و المَدرسة اوالعَمَل، لَمَّا ضَحَك لِنا الحَظ، أو خَاننا التَّعْبِير. اليوم بِنِتحَدث عَن كيف مُمكِن نعبِّر عَن أفكارنا، ونَسْتَعرِض مَعكُم أشهر الشركات في هذا المجال!",
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
      alert("الرجاء أملئ فقط واحدة من الخانات فقط");
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
      createButton.innerText = "يتم تحويل النص إلى صوت...";
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

  // Toggle play and pause functionality for the playButton
  playButton.addEventListener("click", function () {
    if (audioElement.paused) {
      audioElement.play();
      playIcon.classList.remove("play-icon");
      playIcon.classList.add("pause-icon");
    } else {
      audioElement.pause();
      playIcon.classList.remove("pause-icon");
      playIcon.classList.add("play-icon");
    }
  });

  // Automatically reset to the play icon when the audio ends
  audioElement.addEventListener("ended", function () {
    playIcon.classList.remove("pause-icon");
    playIcon.classList.add("play-icon");
  });
});
