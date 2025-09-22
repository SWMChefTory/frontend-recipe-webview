import { useOrientation } from '_common/orientation/useOrientation';
import './VoiceGuideButton.css';

export default function VoiceGuideButton({ isKwsActive, handleVoiceGuideOpen }: { isKwsActive: boolean, handleVoiceGuideOpen: () => void }) {
  const { isPortrait } = useOrientation();
  return(
  <div className={`${isPortrait() ? 'floating-voice-guide-container' : 'floating-voice-guide-container-landscape'} ${isKwsActive ? 'kws-active' : ''}`}>
    {isPortrait()&&<div className="speech-bubble">
      <div className="speech-bubble-text">"토리야"라고 말해보세요</div>
      <div className="speech-bubble-arrow"></div>
    </div>}
    
    <button
      className={isPortrait() ? 'floating-voice-guide-btn' : 'floating-voice-guide-btn-landscape'}
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