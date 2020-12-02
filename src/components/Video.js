import './Video.css';
import YouTube from "react-youtube";
import {FC} from "react";
import {setQueryParam} from "../utils/queryParams";

const youtubeRegex = /.*v=([a-zA-Z0-9_-]{11})&?/

type VideoProps = {
    videoId: string,
    onPlay: Function,
    onPause: Function,
    onPlaybackRateChange: Function,
}

export const Video: FC<VideoProps> = ({videoId, onPlay, onPause, onPlaybackRateChange}) => {
    const setVideoId = (event) => {
        event.preventDefault();
        const entered = event.target.youtubeId.value;
        if (entered && youtubeRegex.test(entered)) {
            setQueryParam("youtubeId", youtubeRegex.exec(entered)[1])
        }
    }

    const getVideoBody = () => {
        if (videoId) {
            return <YouTube
                className="player"
                opts={{playerVars: {autoplay: 1}}}
                videoId={videoId}
                onPlay={onPlay}
                onPause={onPause}
                onPlaybackRateChange={onPlaybackRateChange}
            >
            </YouTube>
        }
        return <form className="urlInputForm" onSubmit={setVideoId}>
            <label>
                Youtube URL:
                <input type="text" name="youtubeId"/>
            </label>
            <input type="submit" value="Submit"/>
        </form>
    }

    return (
        <div className="player">
            {getVideoBody()}
        </div>
    );
}
