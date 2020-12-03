import './Video.css';
import YouTube from "react-youtube";
import {FC} from "react";
import {setQueryParam} from "../utils/queryParams";

const youtubeRegex = /.*v=([a-zA-Z0-9_-]{11})&?/

type VideoProps = {
    videoId: string,
    onSelectVideo: Function,
    onPlay: Function,
    onPause: Function,
    onPlaybackRateChange: Function,
}

export const Video: FC<VideoProps> = ({videoId, onSelectVideo, onPlay, onPause, onPlaybackRateChange}) => {
    const setVideoId = (event) => {
        event.preventDefault();
        const entered = event.target.youtubeId.value;
        if (entered && youtubeRegex.test(entered)) {
            const youtubeId = youtubeRegex.exec(entered)[1];
            setQueryParam("youtubeId", youtubeId)
            onSelectVideo(youtubeId)
        }
    }

    const getVideoBody = () => {
        if (videoId) {
            return <YouTube
                containerClassName="video"
                opts={{playerVars: {autoplay: 1}}}
                videoId={videoId}
                onPlay={onPlay}
                onPause={onPause}
                onPlaybackRateChange={onPlaybackRateChange}
            />
        }
        return <form className="url-input-form" onSubmit={setVideoId}>
            <label>
                Youtube URL:
                <input type="text" name="youtubeId"/>
            </label>
            <input type="submit" value="Submit" />
        </form>
    }

    return (
        <>{getVideoBody()}</>
    );
}
