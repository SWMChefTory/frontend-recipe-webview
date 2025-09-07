import React from 'react';
import './VoiceGuide.css';

interface VoiceGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

const VoiceGuide: React.FC<VoiceGuideProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const voiceCommands = [
    {
      command: '"다음 단계"',
      description: '다음 요리 단계로 이동합니다',
      icon: '➡️',
    },
    {
      command: '"이전 단계"',
      description: '이전 요리 단계로 돌아갑니다',
      icon: '⬅️',
    },
    {
      command: '"세 번째 단계로 가줘"',
      description: '특정 단계로 바로 이동합니다',
      icon: '🔢',
    },
    {
      command: '"양파 써는 장면으로 가줘"',
      description: '원하는 장면으로 바로 이동합니다',
      icon: '🎯',
    },
    {
      command: '"타이머 3분 시작"',
      description: '요리 타이머를 시작합니다',
      icon: '⏰',
    },
    {
      command: '"타이머 정지"',
      description: '요리 타이머를 정지합니다',
      icon: '⏹️',
    },
  ];

  return (
    <div className="voice-guide-overlay">
      <div className="voice-guide-modal">
        <div className="voice-guide-header">
          <h2>음성 명령 가이드</h2>
          <button className="voice-guide-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="voice-guide-content">
          <div className="voice-guide-step-section">
            <div className="voice-guide-step-number">1</div>
            <div className="step-content">
              <div className="step-command">"토리야"라고 말하세요</div>
              <div className="step-description">음성 인식 활성화를 시도합니다</div>
            </div>
          </div>

          <div className="voice-guide-step-section">
            <div className="voice-guide-step-number">2</div>
            <div className="step-content">
              <div className="step-command">우측 하단의 버튼이 중앙으로 이동해요</div>
              <div className="step-description">토리가 듣고 있다는 신호입니다</div>
            </div>
          </div>

          <div className="voice-guide-step-section">
            <div className="voice-guide-step-number">3</div>
            <div className="step-content">
              <div className="step-command">음성으로 명령해보세요</div>
              <div className="step-description">아래와 같은 명령이 가능합니다</div>
            </div>
          </div>

          <div className="voice-commands-list">
            {voiceCommands.map((command, index) => (
              <div key={index} className="voice-command-item">
                <div className="command-icon">{command.icon}</div>
                <div className="command-content">
                  <div className="command-text">{command.command}</div>
                  <div className="command-description">{command.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="voice-guide-tips">
            <h3>TIP</h3>
            <ul>
              <li>크게 말하면, 정확도가 높아져요</li>
              <li>토리가 중앙으로 이동하면 명령을 말해주세요</li>
            </ul>
          </div>
        </div>

        <div className="voice-guide-footer">
          <button className="voice-guide-got-it" onClick={onClose} type="button">
            알겠어요!
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceGuide;
