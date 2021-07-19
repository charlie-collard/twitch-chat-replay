import './App.css'
import {Video} from "./Video"
import Chat from "./Chat"
import {useEffect, useState} from "react"
import ChatSelector from "./ChatSelector"
import {getQueryParam, setQueryParam} from "../utils/queryParams"
import YouTube from "react-youtube"

function useKeyPress(targetKey) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false)
    // If pressed key is our target key then set to true
    const downHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(true)
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false)
        }
    }
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler)
        window.addEventListener("keyup", upHandler)
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler)
            window.removeEventListener("keyup", upHandler)
        }
    }, []) // Empty array ensures that effect is only run on mount and unmount
    return keyPressed
}

function App() {
    const [messages, setMessages] = useState(null)
    const [videoId, setVideoId] = useState(null)
    const [messagesToRender, setMessagesToRender] = useState([])
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    const [mediaStartTime, setMediaStartTime] = useState(new Date())
    const [chatEnabled, setChatEnabled] = useState(false)
    const [dirtyChat, setDirtyChat] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [lastPlayEventTime, setLastPlayEventTime] = useState(new Date())
    const [chatDelay, setChatDelay] = useState(0)
    const [videoPlayer, setVideoPlayer] = useState(null)
    const [funnyMoments, setFunnyMoments] = useState([635, 2615])

    const pPressed = useKeyPress("p")
    const nPressed = useKeyPress("n")

    const findCommentIndexForOffset = (offset) => {
        let left = 0
        let right = messages.length
        let middle = 0
        while (left !== right) {
            middle = left + Math.floor((right - left) / 2)
            const commentTime = messages[middle].content_offset_seconds
            if ((commentTime - offset) > 0) {
                right = middle
            } else if ((commentTime - offset) < 0) {
                left = middle + 1
            } else {
                return middle
            }
        }
        return left
    }

    const updateChatMessages = () => {
        if (!chatEnabled || !messages) {
            return
        }
        const currentTime = new Date()
        currentTime.setSeconds(currentTime.getSeconds() + (currentTime - lastPlayEventTime) * (playbackRate - 1)/1000)
        let messagesToAdd = []
        let i = currentMessageIndex
        while (i < messages.length && Math.ceil((currentTime - mediaStartTime) / 1000) >= (messages[i].content_offset_seconds + chatDelay)) {
            messagesToAdd = messagesToAdd.concat(messages[i])
            i += 1
        }
        setCurrentMessageIndex(i)

        const isDirty = dirtyChat
        const newChatMessages = isDirty ? messagesToAdd : messagesToRender.concat(messagesToAdd)
        const start = Math.max(newChatMessages.length - 100, 0)
        const end = newChatMessages.length
        setMessagesToRender(newChatMessages.slice(start, end))
        if (isDirty) {setDirtyChat(false)}
    }

    const resetChat = (event) => {
        if (!messages) {
            return
        }
        setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(event.target.getMediaReferenceTime() - chatDelay) - 100))
        const startTime = new Date()
        startTime.setSeconds(startTime.getSeconds() - event.target.getMediaReferenceTime())
        setMediaStartTime(startTime)
        setDirtyChat(true)
        setLastPlayEventTime(new Date())
    }

    const onReady = (event) => {
        setVideoPlayer(event.target)
    }

    const onPlay = (event) => {
        setChatEnabled(true)
        resetChat(event)
    }

    const onPause = (event) => {
        setChatEnabled(false)
    }

    const onStateChange = (event) => {
        if (event.data === YouTube.PlayerState.BUFFERING
            || event.data === YouTube.PlayerState.PAUSED
        ) {
            onPause(event)
        }
        if (event.data === YouTube.PlayerState.PLAYING) {
            onPlay(event)
        }
    }

    const onPlaybackRateChange = (event) => {
        setPlaybackRate(event.data)
        resetChat(event)
    }

    const onSelectKnownJson = (summary) => {
        setQueryParam("twitchId", summary.id)
        fetchKnownJson(summary.id)
    }

    const onUploadCustomJson = (json) => {
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sortedMessages)
    }

    const onSelectVideo = (youtubeId) => {
        setVideoId(youtubeId)
    }

    const fetchKnownJson = function (twitchId) {
        fetch("/content/videos/" + twitchId + ".json")
            .then((response) => {
                response.json().then(m => {
                        const sortedMessages = m.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        setMessages(sortedMessages)
                    }
                ).catch(reason => {
                    console.log("Converting comments to json failed: " + reason)
                })
            }).catch(reason => {
                console.log("Fetching comments failed: " + reason)
            }
        )
    }

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500)
            return () => clearTimeout(timer)
        }
    })

    useEffect(() => {
        if (!messages && getQueryParam("twitchId")) {
            fetchKnownJson(getQueryParam("twitchId"))
        }
    }, [messages])

    useEffect(() => {
        if (!videoId && getQueryParam("youtubeId")) {
            setVideoId(getQueryParam("youtubeId"))
        }
    }, [videoId])

    useEffect(() => {
        if (!chatDelay && getQueryParam("delay")) {
            setChatDelay(parseFloat(getQueryParam("delay")))
        }
    }, [chatDelay])

    useEffect(() => {
        const seekToNextFunnyMoment = (direction) => {
            const currentTime = videoPlayer.getCurrentTime()
            const validMoments = funnyMoments.filter((timestamp) =>
                direction === "n" ? timestamp > currentTime : timestamp < currentTime - 5
            )
            if (validMoments.length > 0) {
                videoPlayer.seekTo(validMoments[0], true)
            }
        }

        videoPlayer &&
        (
            (nPressed && seekToNextFunnyMoment("n"))
            || (pPressed && seekToNextFunnyMoment("p"))
        )
    })

    return (
        <div className="App">
            <div className="player-container">
                <Video
                    videoId={videoId}
                    onSelectVideo={onSelectVideo}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onStateChange={onStateChange}
                    onReady={onReady}
                />
            </div>
            <div className="chat-container">
                {messages && <Chat chatMessages={messagesToRender}/>}
                {!messages && <ChatSelector onSelectKnownJson={onSelectKnownJson} onUploadCustomJson={onUploadCustomJson}/>}
            </div>
        </div>
    )
}

export default App
