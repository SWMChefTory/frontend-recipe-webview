import YouTubePlayer from '_common/components/YouTube/YouTubePlayer';

interface Props {
  videoId: string;
  title: string;
}

function Video({ videoId, title }: Props): JSX.Element {
  return <YouTubePlayer youtubeEmbedId={videoId} title={`${title} 동영상`} autoplay={false} />;
}

export default Video;
