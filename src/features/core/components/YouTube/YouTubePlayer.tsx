import { YouTubePlayerProps } from '../../types';
import { getYouTubeUrl } from '../../utils/youtube';

/**
 * 재사용 가능한 YouTube 플레이어 컴포넌트
 */
const YouTubePlayer = ({ 
  youtubeEmbedId, 
  startTime, 
  title,
  autoplay = false,
  youtubeKey 
}: YouTubePlayerProps): JSX.Element => {
  return (
    <section className="youtube-container">
      <iframe
        key={youtubeKey ? `youtube-${youtubeKey}` : undefined}
        width="100%"
        height="220"
        src={getYouTubeUrl(youtubeEmbedId, startTime, autoplay)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; microphone"
        allowFullScreen
        loading="eager"
        style={{ border: 'none' }}
      />
    </section>
  );
};

export default YouTubePlayer; 