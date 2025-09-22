import VoiceGuideModal from 'recipe/step/components/voice-guide/modal/VoiceGuideModal';
import VoiceGuideButton from 'recipe/step/components/voice-guide/buttons/VoiceGuideButton';
import { useState } from 'react';

import { useOrientation } from '_common/orientation/useOrientation';
export default function VoiceGuide({ isKwsActive }: { isKwsActive: boolean }) {
  const { isPortrait } = useOrientation();
  const [isVisible, setIsVisible] = useState(false);
  const handleVoiceGuideOpen = () => {
    setIsVisible(true);
  };
  const onClose = () => {
    setIsVisible(false);
  };
  return (
    <>
      {isPortrait() && <VoiceGuideModal isVisible={isVisible} onClose={onClose} />}
      <VoiceGuideButton isKwsActive={isKwsActive} handleVoiceGuideOpen={handleVoiceGuideOpen} />
    </>
  );
};
