import './App.css';
import {Video} from "./Video";
import Chat from "./Chat";
import {useEffect, useState} from "react";
import ChatSelector from "./ChatSelector";
import {getQueryParam, setQueryParam} from "../utils/queryParams";

function App() {
    const [messages, setMessages] = useState(null);
    const [videoId, setVideoId] = useState(null)
    const [messagesToRender, setMessagesToRender] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [startTime, setStartTime] = useState(new Date());
    const [chatEnabled, setChatEnabled] = useState(false)
    const [dirtyChat, setDirtyChat] = useState(false)

    const findCommentIndexForOffset = (offset) => {
        let left = 0;
        let right = messages.length;
        let middle = 0;
        while (left !== right) {
            middle = left + Math.floor((right - left) / 2)
            const commentCreated = messages[middle].content_offset_seconds
            if ((commentCreated - offset) > 0) {
                right = middle
            } else if ((commentCreated - offset) < 0) {
                left = middle + 1
            } else {
                return middle
            }
        }
        return left
    }

    const updateChatMessages = () => {
        if (!chatEnabled || !messages) {
            return;
        }
        const currentTime = new Date()
        let messagesToAdd = [];
        let i = currentMessageIndex;
        while (i < messages.length && (currentTime - startTime) / 1000 > (messages[i].content_offset_seconds)) {
            messagesToAdd = messagesToAdd.concat(messages[i])
            i += 1
        }
        setCurrentMessageIndex(i)

        const isDirty = dirtyChat
        const newChatMessages = isDirty ? messagesToAdd : messagesToRender.concat(messagesToAdd)
        const start = Math.max(newChatMessages.length - 100, 0)
        const end = newChatMessages.length
        setMessagesToRender(newChatMessages.slice(start, end));
        if (isDirty) {setDirtyChat(false)}
    }

    const onPlay = (event) => {
        setChatEnabled(true)
        if (!messages) {
            return;
        }
        setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(event.target.getMediaReferenceTime()) - 100))
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - event.target.getMediaReferenceTime())
        setStartTime(startTime)
        setDirtyChat(true)
    }

    const onPause = () => {
        setChatEnabled(false)
    }

    const onPlaybackRateChange = (event) => {
    }

    const onSelectKnownJson = (summary) => {
        setQueryParam("twitchId", summary.id)
        fetchKnownJson(summary.id)
    }

    const onUploadCustomJson = (json) => {
        console.log(json)
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sortedMessages)
    }

    const onSelectVideo = (youtubeId) => {
        setVideoId(youtubeId)
    }

    const fetchKnownJson = function (twitchId) {
        fetch("/content/" + twitchId + ".json")
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
        );
    };

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500);
            return () => clearTimeout(timer);
        }
    })

    useEffect(() => {
        if (!messages && getQueryParam("twitchId")) {
            fetchKnownJson(getQueryParam("twitchId"));
        }
    }, [messages])

    useEffect(() => {
        if (!videoId && getQueryParam("youtubeId")) {
            setVideoId(getQueryParam("youtubeId"))
        }
    }, [videoId])

    return (
        <div className="App">
            <div className="player-container">
                <Video
                    videoId={videoId}
                    onSelectVideo={onSelectVideo}
                    onPlay={onPlay}
                    onPause={onPause}
                    onPlaybackRateChange={onPlaybackRateChange}
                />
            </div>
            <div className="chat-container">
                {messages && <Chat chatMessages={messagesToRender}/>}
                {!messages && <ChatSelector onSelectKnownJson={onSelectKnownJson} onUploadCustomJson={onUploadCustomJson}/>}
            </div>
        </div>
    );
}

export default App;
