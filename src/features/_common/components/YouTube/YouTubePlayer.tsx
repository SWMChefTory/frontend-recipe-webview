import type { YouTubeProps } from 'react-youtube';
import YouTube from 'react-youtube';
import { YouTubePlayerProps } from '../../types';

type YTOpts = NonNullable<YouTubeProps['opts']>;

interface Props extends YouTubePlayerProps {
  /** 부모가 플레이어 인스턴스를 받을 때 호출 */
  onPlayerReady?: (player: YT.Player) => void;
}

const YouTubePlayer = ({
  youtubeEmbedId,
  startTime,
  title,
  autoplay = false,
  youtubeKey,
  onPlayerReady,
}: Props): JSX.Element => {
  /** iFrame API 파라미터 */
  const opts: YTOpts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      start: startTime ?? 0,
    },
  };

  /** 준비 이벤트 */
  const handleReady: NonNullable<YouTubeProps['onReady']> = e => {
    if (startTime) e.target.seekTo(startTime, true);
    onPlayerReady?.(e.target);
  };

  return (
    <section className="youtube-container">
      <YouTube
        key={youtubeKey ? `youtube-${youtubeKey}` : undefined}
        videoId={youtubeEmbedId}
        opts={opts}
        onReady={handleReady}
        title={title}
        iframeClassName="border-none"
      />
    </section>
  );
};

export default YouTubePlayer;
