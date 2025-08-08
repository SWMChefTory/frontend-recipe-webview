import YouTubePlayer from 'features/_common/components/YouTube/YouTubePlayer';

interface Props {
  videoId: string;
  title: string;
}

function Video({ videoId, title }: Props): JSX.Element {
  return (
    <YouTubePlayer
      youtubeEmbedId={videoId}
      startTime={0}
      title={`${title} 동영상`}
      autoplay={false}
    />
  );
}

export default Video;
