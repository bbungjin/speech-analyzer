import React, { useState, useEffect, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const sentences = [
  "간장 공장 공장장은 강 공장장이고 된장 공장 공장장은 공 공장장이다",
  "경찰청 철창살은 외철창살이냐 쌍철창살이냐",
  "내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 잘 못 그린 기린 그림이다",
  "저기 있는 저 분은 박 법학박사이고 여기 있는 이 분은 백 법학박사이다",
  "중앙청 창살은 쌍창살이고 시청의 창살은 외창살이다",
  "한양 양장점 옆 한영 양장점 한영 양장점 옆 한양 양장점",
  "고려고 교복은 고급 교복이고 고려고 교복은 고급 원단을 사용했다"
];

const getRandomSentence = () => sentences[Math.floor(Math.random() * sentences.length)];

const PronunciationTest = () => {
  const [targetSentence, setTargetSentence] = useState(getRandomSentence());
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');

  const compare = useCallback((speech) => {
    // Stricter comparison by just trimming whitespace
    if (targetSentence.trim() === speech.trim()) {
      setResult("정확합니다! 💯");
    } else {
      setResult("조금 아쉬워요. 다시 시도해보세요. 🤔");
    }
  }, [targetSentence]);

  useEffect(() => {
    if (!recognition) {
      setResult("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      compare(speechToText);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      setResult(`Error occurred in recognition: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  }, [compare]);

  const handleRecord = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setTranscript('');
      setResult('');
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  const handleNewSentence = () => {
    setTargetSentence(getRandomSentence());
    setTranscript('');
    setResult('');
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title text-center mb-4">발음 연습</h3>
        <div className="mb-3">
          <p className="fw-bold">따라 읽을 문장:</p>
          <p className="fs-4 p-3 bg-light rounded">{targetSentence}</p>
        </div>
        <div className="text-center mb-3">
          <button
            className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'} btn-lg me-2`}
            onClick={handleRecord}
            disabled={!recognition}
          >
            {isRecording ? '녹음 중지' : '녹음 시작'}
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={handleNewSentence}
            disabled={isRecording}
          >
            다른 문장
          </button>
        </div>
        {transcript && (
          <div className="mt-4">
            <p className="fw-bold">인식된 문장:</p>
            <p className="fs-5 p-3 bg-white border rounded">{transcript}</p>
          </div>
        )}
        {result && (
          <div className="mt-4 text-center">
            <p className="fw-bold">결과:</p>
            <p className="fs-4">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationTest;
