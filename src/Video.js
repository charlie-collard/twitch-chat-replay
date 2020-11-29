import './Video.css';
import YouTube from "react-youtube";
import {FC} from "react";

type VideoProps = {
    onPlay: Function,
    onPause: Function,
}

export const Video: FC<VideoProps> = ({onPlay, onPause}) => {
    return (
        <YouTube
            videoId="VJKSLTZP-Ts"
            className="Video"
            opts={{playerVars: {autoplay: 1}}}
            onPlay={onPlay}
            onPause={onPause}
        >
        </YouTube>
    );
}
