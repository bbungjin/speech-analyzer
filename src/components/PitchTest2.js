import React, { useState, useEffect, useRef } from 'react';
import { Piano, MidiNumbers } from 'react-piano';
import teoria from 'teoria';
import { PitchDetector } from 'pitchy';
import '../index.css';

function PitchTest2() {
  const noteFrequencyMap = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  };
  const notes = Object.keys(noteFrequencyMap);
  const noteFrequencies = notes.map(note => ({ name: note, frequency: noteFrequencyMap[note] }));

  const [currentNote, setCurrentNote] = useState(null);
  const [userPitch, setUserPitch] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [correctTimeStart, setCorrectTimeStart] = useState(null);
  const [audioError, setAudioError] = useState(false);
  const audioContextRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const detectorRef = useRef(null);
  const inputDataRef = useRef(null);

  const firstNote = MidiNumbers.fromNote('c3');
  const lastNote = MidiNumbers.fromNote('b4');

  const playNote = (noteName) => {
    try {
      const audioSrc = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/${noteName}.mp3`;
      const audio = new Audio(audioSrc);
      console.log(`Attempting to play: ${audioSrc}`);
      audio.play().then(() => {
        console.log(`Playback successful for ${noteName}`);
        if (audioError) setAudioError(false);
      }).catch(e => {
        console.error(`Audio play failed for ${noteName}:`, e);
        setFeedback('오디오 재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
        setAudioError(true);
      });
    } catch (error) {
      console.error("Error setting up audio for note:", error);
      setAudioError(true);
    }
  };

  const selectRandomNote = () => {
    const randomIndex = Math.floor(Math.random() * noteFrequencies.length);
    const randomNote = noteFrequencies[randomIndex];
    setCurrentNote(randomNote);
    playNote(randomNote.name);
    return randomNote;
  };

  const handleRandomNote = () => {
    setUserPitch(null);
    setCorrectTimeStart(null);
    const note = selectRandomNote();
    setFeedback(`${note.name} 음을 내보세요`);
  };

  const handlePianoKeyPress = (midiNumber) => {
    const noteName = teoria.note.fromKey(midiNumber).scientific();
    const targetNote = noteFrequencies.find(n => n.name === noteName);
    if (targetNote) {
      setCurrentNote(targetNote);
      playNote(targetNote.name);
      setUserPitch(null);
      setCorrectTimeStart(null);
      setFeedback(`${targetNote.name} 음을 내보세요`);
    }
  };

  const startTest = async () => {
    if (!isListening) {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        await context.resume();
        audioContextRef.current = context;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserNodeRef.current = analyser;

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceNodeRef.current = source;

        detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
        inputDataRef.current = new Float32Array(detectorRef.current.inputLength);

        setIsListening(true);
        setFeedback('음을 들어보세요...');
        
        const note = selectRandomNote();
        setFeedback(`${note.name} 음을 내보세요`);

      } catch (error) {
        console.error("Error starting test:", error);
        setFeedback('마이크에 접근하거나 테스트를 시작할 수 없습니다.');
      }
    }
  };

  useEffect(() => {
    let animationFrameId;

    const updatePitch = () => {
      if (analyserNodeRef.current && detectorRef.current && audioContextRef.current) {
        analyserNodeRef.current.getFloatTimeDomainData(inputDataRef.current);
        const [pitch, clarity] = detectorRef.current.findPitch(inputDataRef.current, audioContextRef.current.sampleRate);
        
        if (clarity > 0.9) {
          setUserPitch(pitch);
        }
      }
      animationFrameId = requestAnimationFrame(updatePitch);
    };

    if (isListening) {
      updatePitch();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening]);

  useEffect(() => {
    if (userPitch && currentNote && !audioError) {
      const targetFrequency = currentNote.frequency;
      const difference = userPitch - targetFrequency;
      const tolerance = 20; // Hz

      if (Math.abs(difference) <= tolerance) {
        if (correctTimeStart === null) {
          setCorrectTimeStart(Date.now());
          setFeedback('정답입니다!');
        } else {
          const holdDuration = Date.now() - correctTimeStart;
          if (holdDuration >= 1000) {
            setFeedback('정답입니다!');
            setCorrectTimeStart(null);
            setUserPitch(null);
          }
        }
      } else {
        setCorrectTimeStart(null);
        if (difference > tolerance) {
          setFeedback('너무 높아요');
        } else {
          setFeedback('너무 낮아요');
        }
      }
    }
  }, [userPitch, currentNote, correctTimeStart, audioError]);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // No longer start automatically
  }, []);

  if (audioError) {
    return (
      <div className="pitch-test-container">
        <h2>음정 연습</h2>
        <p style={{color: 'red'}}>오디오 재생에 실패했습니다. 브라우저 설정을 확인하고 다시 시도해주세요.</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="pitch-test-container">
      <h2>음정 연습</h2>
      <div className="note-display">
        {notes.map(note => (
          <div key={note} className="note">
            {note.slice(0, -1)}
          </div>
        ))}
      </div>
      {!isListening ? (
        <button onClick={startTest}>테스트 시작</button>
      ) : (
        <div className="feedback-container">
          <p>목표 음: {currentNote ? currentNote.name : 'N/A'}</p>
          <p>나의 음정: {userPitch ? `${userPitch.toFixed(2)} Hz` : '노래하세요...'}</p>
          <p className="feedback">{feedback}</p>
          <button onClick={handleRandomNote} style={{marginTop: '10px'}}>랜덤</button>
        </div>
      )}
       <div style={{marginTop: '20px'}}>
         <Piano
            noteRange={{ first: firstNote, last: lastNote }}
            playNote={handlePianoKeyPress}
            stopNote={() => {}}
            width={1000}
            activeNotes={currentNote ? [MidiNumbers.fromNote(currentNote.name)] : []}
        />
       </div>
    </div>
  );
}

export default PitchTest2;