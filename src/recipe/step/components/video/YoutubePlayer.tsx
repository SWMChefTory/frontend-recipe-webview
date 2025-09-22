import { YouTubeProps } from 'react-youtube';
import YouTube from 'react-youtube';

type YTOpts = NonNullable<YouTubeProps['opts']>;

interface Props {
  youtubeEmbedId: string;
  title: string;
  autoplay: boolean;
  onPlayerReady: (player: YT.Player) => void;
  onEnd?: () => void;
}

export default function YoutubePlayer({
  youtubeEmbedId,
  title,
  autoplay = false,
  onPlayerReady,
  onEnd=()=>{},
}: Props): JSX.Element {
  // const {isPortrait} = useOrientation();
  /** iFrame API 파라미터 */
  const opts: YTOpts = {
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      fs: 0, // 전체화면 버튼 비활성화
      controls: 1, // 컨트롤 표시하되 전체화면만 비활성화
      modestbranding: 1, // YouTube 로고 최소화
      disablekb: 1, // 키보드 단축키 비활성화
      rel: 0,
    },
    width: "100%",
    height: "100%",
  };

  const handleReady: NonNullable<YouTubeProps['onReady']> = e => {
    onPlayerReady?.(e.target);
  };

  return (
    <YouTube
      key={youtubeEmbedId ? `youtube-${youtubeEmbedId}` : undefined}
      videoId={youtubeEmbedId}
      opts={opts}
      onReady={handleReady}
      title={title}
      iframeClassName="border-none"
      onEnd={onEnd}
    />
  );
}
