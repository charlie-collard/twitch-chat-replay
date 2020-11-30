import './Video.css';
import YouTube from "react-youtube";
import {FC} from "react";

type VideoProps = {
    videoId: string,
    onPlay: Function,
    onPause: Function,
    onPlaybackRateChange: Function,
}

export const Video: FC<VideoProps> = ({videoId, onPlay, onPause, onPlaybackRateChange}) => {
    return (
        <YouTube
            className="Video"
            opts={{playerVars: {autoplay: 1}}}
            videoId={videoId}
            onPlay={onPlay}
            onPause={onPause}
            onPlaybackRateChange={onPlaybackRateChange}
        >
        </YouTube>
    );
}
