import './VoiceGuideButton.css';

export default function VoiceGuideButton({ isKwsActive, handleVoiceGuideOpen }: { isKwsActive: boolean, handleVoiceGuideOpen: () => void }) {
  return(
  <div className={`floating-voice-guide-container ${isKwsActive ? 'kws-active' : ''}`}>
    <div className="speech-bubble">
      <div className="speech-bubble-text">"토리야"라고 말해보세요</div>
      <div className="speech-bubble-arrow"></div>
    </div>
    <button
      className="floating-voice-guide-btn"
      onClick={handleVoiceGuideOpen}
      aria-label="음성 명령 가이드"
      type="button"
    >
      <img
        src={isKwsActive ? '/tori-listening.png' : '/tori-idle.png'}
        alt={isKwsActive ? '토리 듣는 중' : '토리 대기 중'}
      />
    </button>
  </div>
  )
};