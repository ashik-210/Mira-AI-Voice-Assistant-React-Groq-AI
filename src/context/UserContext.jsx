import React, {
  createContext,
  useState,
  useEffect,
  useRef
} from 'react';

import { getWeather } from '../weather';

import { run } from '../grok';
import websites from '../website';

export const dataContext = createContext();

const UserContext = ({ children }) => {
  const [speaking, setspeaking] = useState(false);
  const [recoText, setrecoText] = useState("Listening...");
  const [responseImg, setresponseImg] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Tracks whether the user actually said something
  const hasSpeech = useRef(false);

  // Speech synthesis
  function speak(text) {
    window.speechSynthesis.cancel();

    let text_speak = new SpeechSynthesisUtterance(text);

    text_speak.volume = 1;
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.lang = "hi-GB";

    text_speak.onend = () => {
      setspeaking(false);
    };

    text_speak.onerror = () => {
      setspeaking(false);
    };

    window.speechSynthesis.speak(text_speak);
  }

  // AI response
  async function aiResponse(prompt) {
    try {
      setspeaking(true);

      const response = await run(prompt);

      setrecoText(response);
      setresponseImg(true);

      speak(response);

    } catch (error) {
      console.error("Failed to get Mira's response:", error);

      setrecoText("Something went wrong. Please try again.");
      setspeaking(false);
    }
  }

  // Website and other voice commands
  async function takeCommand(command) {
    let lowerCommand = command.toLowerCase();

    let website = Object.keys(websites)
      .sort((a, b) => b.length - a.length)
      .find(site => lowerCommand.includes("open " + site));

    if (website) {
      let message = `Opening ${website}`;

      setrecoText(message);
      setresponseImg(true);
      setspeaking(true);

      speak(message);

      window.open(websites[website], "_blank");
    }

    else if (lowerCommand.includes("date")) {
      let date = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      let message = `Today's date is ${date}`;

      setrecoText(message);
      setresponseImg(true);
      setspeaking(true);

      speak(message);
    }

    else if (lowerCommand.includes("time")) {
      let time = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      let message = `The current time is ${time}`;

      setrecoText(message);
      setresponseImg(true);
      setspeaking(true);

      speak(message);
    }

    else if (
      lowerCommand.includes("weather") ||
      lowerCommand.includes("temperature")
    ) {
      const match = lowerCommand.match(
        /(?:weather|temperature)(?:\s+(?:in|of|at))\s+(.+?)(?:\?|$)/
      );

      if (!match) {
        const message = "Which city or country would you like the weather for?";

        setrecoText(message);
        setresponseImg(true);
        setspeaking(true);
        speak(message);
        return;
      }

      const place = match[1].trim();

      setrecoText(`Checking weather in ${place}...`);
      setresponseImg(true);
      setspeaking(true);

      const weather = await getWeather(place);

      setrecoText(weather);
      speak(weather);
    }

    else {
      aiResponse(command);
    }
  }

  // Initialize speech recognition only once
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.lang = "en-IN";
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    // When microphone starts
    recognitionInstance.onstart = () => {
      hasSpeech.current = false;
    };

    // When user speaks
    recognitionInstance.onresult = (e) => {
      const transcript = e.results[e.resultIndex][0].transcript.trim();

      if (transcript) {
        hasSpeech.current = true;
        setrecoText(transcript);
        takeCommand(transcript);
      }
    };

    // When microphone closes
    recognitionInstance.onend = () => {
      if (!hasSpeech.current) {
        setspeaking(false);
        setrecoText("No speech detected. Click to try again.");
      }
    };

    // Handle microphone errors
    recognitionInstance.onerror = (e) => {
      console.log("Speech recognition error:", e.error);

      setspeaking(false);
      setrecoText("Microphone stopped. Click to try again.");
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.abort();
      window.speechSynthesis.cancel();
    };

  }, []);

  const value = {
    recognition,
    speak,
    speaking,
    setspeaking,
    recoText,
    setrecoText,
    responseImg,
    setresponseImg
  };

  return (
    <dataContext.Provider value={value}>
      {children}
    </dataContext.Provider>
  );
};

export default UserContext;
