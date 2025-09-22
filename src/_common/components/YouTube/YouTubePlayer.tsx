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
  title,
  autoplay = false,
  youtubeKey,
  onPlayerReady,
}: Props): JSX.Element => {

  // const {isPortrait} = useOrientation();
  /** iFrame API 파라미터 */
  const opts: YTOpts = {
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      fs: 0,             // 전체화면 버튼 비활성화
      controls: 1,       // 컨트롤 표시하되 전체화면만 비활성화
      modestbranding: 1, // YouTube 로고 최소화
      disablekb: 1,      // 키보드 단축키 비활성화
      rel: 0,            
    },
  };

  /** 준비 이벤트 */
  const handleReady: NonNullable<YouTubeProps['onReady']> = e => {
    onPlayerReady?.(e.target);
  };

  return (
    <YouTube
          key={youtubeKey ? `youtube-${youtubeKey}` : undefined}
          videoId={youtubeEmbedId}
          opts={opts}
          onReady={handleReady}
          title={title}
          iframeClassName="border-none"
        />
    );
};

export default YouTubePlayer;
