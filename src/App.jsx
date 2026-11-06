import React, { useContext } from 'react'
import "./App.css"
import miraRef from './assets/ai.png'
import { CiMicrophoneOn } from "react-icons/ci";
import { dataContext } from './context/UserContext';
import SpeakImg from './assets/speak.gif';
import RespImg from './assets/aiVoice.gif';

const App = () => {
  let {
    recognition,
    speaking,
    setspeaking,
    recoText,
    setrecoText,
    responseImg,
    setresponseImg
  } = useContext(dataContext);

  return (
    <div className='main'>
      <img src={miraRef} alt="mira-img" id='mira' />

      <span className='heading'>
        I'm Mira, Your Advanced Virtual Assistant
      </span>

      {!speaking ? (
        <button onClick={() => {
          setrecoText("listening...");
          recognition.start();
          setspeaking(true);
          setresponseImg(false);
        }}>
          Click here <CiMicrophoneOn />
        </button>
      ) : (
        <div className='footResponse'>
          {!responseImg ? (
            <img src={SpeakImg} alt="circleSpeakImg" id='circleSpeakImg' />
          ) : (
            <img src={RespImg} alt="aiResponseImg" id='aiResponseImg' />
          )}
          <p id='para'>{recoText}</p>
        </div>
      )}
    </div>
  )
}

export default App
