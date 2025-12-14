import React, { useState } from 'react';
import PronunciationTest from './components/PronunciationTest';

import PitchTest2 from './components/PitchTest2';
import './index.css';

function App() {
  const [mode, setMode] = useState('welcome'); // 'welcome', 'pronunciation', 'pitch'

  const renderContent = () => {
    switch (mode) {
      case 'pronunciation':
        return <PronunciationTest />;
      case 'pitch':
        return <PitchTest2 />;
      default:
        return (
          <div className="text-center">
            <h2 className="mb-4">어떤 연습을 하시겠어요?</h2>
            <div className="d-grid gap-3 col-6 mx-auto">
              <button className="btn btn-primary btn-lg" onClick={() => setMode('pronunciation')}>
                발음 연습
              </button>
              <button className="btn btn-success btn-lg" onClick={() => setMode('pitch')}>
                음정 연습
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mt-5">
      <header className="text-center mb-5">
        <h1>음성 분석 프로젝트</h1>
        {mode !== 'welcome' && (
          <button className="btn btn-secondary mt-3" onClick={() => setMode('welcome')}>
            뒤로가기
          </button>
        )}
      </header>
      <main>
        {renderContent()}
      </main>
      <div>
        <div className="container text-center mt-5">
        </div>
      </div>
    </div>
  );
}

export default App;
