import YouTubePlayer from '_common/components/YouTube/YouTubePlayer';
import React from 'react';
import 'recipe/detail/components/Video.css';

interface Props {
  videoId: string;
  title: string;
  youtubeRef: React.MutableRefObject<YT.Player | null>;
}

function Video({ videoId, title, youtubeRef }: Props): JSX.Element {
  return (
    <div className="video-sticky-wrapper">
      <div className="video-aspect">
        <YouTubePlayer
          youtubeEmbedId={videoId}
          title={`${title} 동영상`}
          autoplay={false}
          onPlayerReady={player => {
            youtubeRef.current = player;
          }}
        />
      </div>
    </div>
  );
}

export default Video;
