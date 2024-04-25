import "./Video.css"
import YouTube, {YouTubeEvent} from "react-youtube"
import {FC} from "react"
import {setQueryParam} from "../utils/queryParams"

const youtubeRegex = /.*((v=)|(youtu.be\/))([a-zA-Z0-9_-]{11})&?/

type VideoProps = {
    videoId: string,
    onSelectVideo: Function,
    onReady: (event: YouTubeEvent) => void,
    onPlaybackRateChange: (event: YouTubeEvent) => void,
    onStateChange: (event: YouTubeEvent) => void,
}

export const Video: FC<VideoProps> = ({videoId, onSelectVideo, onReady, onPlaybackRateChange, onStateChange}) => {
    const setVideoId = (event: any) => {
        event.preventDefault()
        const entered = event.target.youtubeId.value
        const [, , , , youtubeId] = youtubeRegex.exec(entered || "") || []
        if (youtubeId) {
            setQueryParam("youtubeId", youtubeId)
            onSelectVideo(youtubeId)
        }
    }

    const getVideoBody = () => {
        if (videoId) {
            return <YouTube
                className="video"
                opts={{playerVars: {autoplay: 1}}}
                videoId={videoId}
                onReady={onReady}
                onPlaybackRateChange={onPlaybackRateChange}
                onStateChange={onStateChange}
            />
        }
        return <>
            <a className="source-code-link" href="https://github.com/charlie-collard/twitch-chat-replay" target="_blank" rel="noreferrer">View source on GitHub</a>
            <form className="url-input-form" onSubmit={setVideoId}>
                <label>
                    Youtube URL:
                    <input type="text" name="youtubeId"/>
                </label>
                <input className="submit-button" type="submit" value="Submit" />
            </form>
        </>
    }

    return (
        <>{getVideoBody()}</>
    )
}
