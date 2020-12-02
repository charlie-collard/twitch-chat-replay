import './App.css';
import {Video} from "./Video";
import Chat from "./Chat";
import {useEffect, useState} from "react";
import ChatSelector from "./ChatSelector";
import {getQueryParam, setQueryParam} from "../utils/queryParams";

function App() {
    const [messages, setMessages] = useState(null);
    const [firstMessageTime, setFirstMessageTime] = useState(null);
    const [messagesToRender, setMessagesToRender] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [startTime, setStartTime] = useState(new Date());
    const [chatEnabled, setChatEnabled] = useState(false)

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

        const newChatMessages = messagesToRender.concat(messagesToAdd)
        const start = Math.max(newChatMessages.length - 100, 0)
        const end = newChatMessages.length
        setMessagesToRender(newChatMessages.slice(start, end));
    }

    const onPlay = (event) => {
        setChatEnabled(true)
        if (!messages) {
            return;
        }
        const offsetTime = new Date(firstMessageTime)
        offsetTime.setSeconds(offsetTime.getSeconds() + event.target.getMediaReferenceTime())
        setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(event.target.getMediaReferenceTime()) - 35))
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - event.target.getMediaReferenceTime())
        setStartTime(startTime)
        setMessagesToRender([])
    }

    const onPause = () => {
        setChatEnabled(false)
    }

    const onPlaybackRateChange = (event) => {
    }

    const onSelect = (summary) => {
        setQueryParam("twitchId", summary.id)
    }

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500);
            return () => clearTimeout(timer);
        }
    })

    useEffect(() => {
        if (!messages && getQueryParam("twitchId")) {
            fetch("/content/" + getQueryParam("twitchId") + ".json")
                .then((response) => {
                    response.json().then(m => {
                            const sortedMessages = m.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                            setMessages(sortedMessages)
                            setFirstMessageTime(new Date(sortedMessages[0].created_at))
                        }
                    ).catch(reason => {
                        console.log("Converting comments to json failed: " + reason)
                    })
                }).catch(reason => {
                    console.log("Fetching comments failed: " + reason)
                }
            );
        }
    })

    return (
        <div className="App">
            <Video
                videoId={getQueryParam("youtubeId")}
                onPlay={onPlay}
                onPause={onPause}
                onPlaybackRateChange={onPlaybackRateChange}
            />
            {messages && <Chat chatMessages={messagesToRender}/>}
            {!messages && <ChatSelector onSelect={onSelect}/>}
        </div>
    );
}

export default App;
