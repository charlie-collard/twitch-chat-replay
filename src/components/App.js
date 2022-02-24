import './App.css'
import {Video} from "./Video"
import Chat from "./Chat"
import {useCallback, useEffect, useState} from "react"
import ChatSelector from "./ChatSelector"
import {getQueryParam, setQueryParam} from "../utils/queryParams"
import YouTube from "react-youtube"
import allBttvEmotes from "../data/bttv/emotes.json"

function App() {
    const [messages, setMessages] = useState(null)
    const [videoId, setVideoId] = useState(null)
    const [messagesToRender, setMessagesToRender] = useState([])
    const [currentVodBttvEmotes, setCurrentVodBttvEmotes] = useState(null)
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    const [mediaStartTime, setMediaStartTime] = useState(new Date())
    const [chatEnabled, setChatEnabled] = useState(false)
    const [dirtyChat, setDirtyChat] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [lastPlayEventTime, setLastPlayEventTime] = useState(new Date())
    const [chatDelay, setChatDelay] = useState(0)
    const [videoPlayer, setVideoPlayer] = useState(null)
    const [funnyMoments, setFunnyMoments] = useState([])

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
        currentTime.setSeconds(currentTime.getSeconds() + (currentTime - lastPlayEventTime) * (playbackRate - 1) / 1000)
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
        if (isDirty) {
            setDirtyChat(false)
        }
    }

    const resetChat = () => {
        if (!messages || !videoPlayer) {
            return
        }
        const currentTime = videoPlayer.getCurrentTime();
        setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(currentTime - chatDelay) - 100))
        const startTime = new Date()
        startTime.setSeconds(startTime.getSeconds() - currentTime)
        setMediaStartTime(startTime)
        setDirtyChat(true)
        setLastPlayEventTime(new Date())
    }

    const resetAll = () => {
        setVideoId(null);
        setMessages(null);
        setMessagesToRender([]);
        setCurrentVodBttvEmotes(null)
        setCurrentMessageIndex(0);
        setPlaybackRate(1);
        setChatDelay(0);
        setChatEnabled(false);
        setFunnyMoments([]);
        window.history.pushState("home", "Twitch Chat Replay", "/")
    }

    const onReady = (event) => {
        setVideoPlayer(event.target)
    }

    const onPlay = (event) => {
        setChatEnabled(true)
        resetChat()
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
        resetChat()
    }

    const findCorrectBttvEmotesForVod = (created_at) => {
        const {global, northernlion: {sharedEmotes}} = allBttvEmotes[(Object.keys(allBttvEmotes).sort().filter((bttvDate) => created_at >= bttvDate))[0]]

        const allEmotes = global.concat(sharedEmotes)
        const resultMap = {}
        allEmotes.forEach((emote) => {
            resultMap[emote.code] = emote.id
        })
        // For old vods, where LUL was a BTTV emote.
        resultMap["LUL"] = resultMap["LuL"]
        return resultMap
    }

    const onSelectKnownVod = (summary) => {
        setQueryParam("twitchId", summary.id)
        fetchDataForVideo(summary.id)
    }

    const onUploadCustomVod = (json) => {
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sortedMessages)
        setCurrentVodBttvEmotes(sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : [])
    }

    const onSelectVideo = (youtubeId) => {
        setVideoId(youtubeId)
    }

    const fetchDataForVideo = useCallback((twitchId) => {
        const fetchVideoJson = (twitchId) => {
            fetch("/content/videos/" + twitchId + ".json")
                .then(response => {
                    response.json().then(m => {
                            const sortedMessages = m.comments.sort((a, b) => new Date(a.content_offset_seconds) - new Date(b.content_offset_seconds))
                            setMessages(sortedMessages)
                            setCurrentVodBttvEmotes(sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : [])
                        }
                    ).catch(reason => {
                        console.log("Converting comments to json failed: " + reason)
                    })
                }).catch(reason => {
                console.log("Fetching comments failed: " + reason)
                }
            )
        }

        const fetchFunnyMomentJson = function (twitchId) {
            fetch("/content/funny-moments/" + twitchId + ".json")
                .then(response => {
                    response.json().then(funnyMoments => {
                        setFunnyMoments(funnyMoments.sort((a, b) => a-b))
                    }).catch(reason => {
                        console.log("Converting funny moments to json failed: " + reason)
                    })
                }).catch(reason => {
                console.log("Fetching funny moments failed: " + reason)
            })
        }

        fetchVideoJson(twitchId)
        fetchFunnyMomentJson(twitchId)
    }, [])

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500)
            return () => clearTimeout(timer)
        }
    })

    useEffect(() => {
        if (!messages && getQueryParam("twitchId")) {
            fetchDataForVideo(getQueryParam("twitchId"))
        }
    }, [fetchDataForVideo, messages])

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
        const seekToFunnyMoment = (direction) => {
            if (!videoPlayer || !funnyMoments) {
                return
            }
            const currentTime = videoPlayer.getCurrentTime()
            const validMoments = funnyMoments.filter((timestamp) =>
                direction === "n" ? timestamp > currentTime : timestamp < currentTime - 5
            )
            if (validMoments.length > 0) {
                const index = direction === "n" ? 0 : validMoments.length - 1
                videoPlayer.seekTo(validMoments[index], true)
            }
        }

        const listenerFunction = ({key, repeat}) => {
            if (!repeat && (key === "n" || key === "p")) {
                seekToFunnyMoment(key)
            }
        }
        window.addEventListener("keydown", listenerFunction)
        return () => window.removeEventListener("keydown", listenerFunction)
    }, [videoPlayer, funnyMoments])

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
                {messages && <Chat resetFunction={resetAll} chatMessages={messagesToRender} bttvEmotes={currentVodBttvEmotes}/>}
                {!messages && <ChatSelector onSelectKnownJson={onSelectKnownVod} onUploadCustomJson={onUploadCustomVod}/>}
            </div>
        </div>
    )
}

export default App
