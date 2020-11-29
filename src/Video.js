import './Video.css';
import YouTube from "react-youtube";
import {FC} from "react";

type VideoProps = {
    onPlay: Function,
    onPause: Function,
    videoId: string,
}

export const Video: FC<VideoProps> = ({onPlay, onPause, videoId}) => {
    return (
        <YouTube
            className="Video"
            opts={{playerVars: {autoplay: 1}}}
            videoId={videoId}
            onPlay={onPlay}
            onPause={onPause}
        >
        </YouTube>
    );
}
