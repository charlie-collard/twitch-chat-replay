import './App.css';
import {Video} from "./Video";
import Chat from "./Chat";
import {useState, useEffect} from "react";
import data from "./json/66523331.json";

const comments = data.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
const firstCommentTime = new Date(comments[0].created_at)

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [startTime, setStartTime] = useState(new Date());
    const [chatEnabled, setChatEnabled] = useState(false)
    const [i, setI] = useState(0);

    const findCommentIndexForTimestamp = (timestamp) => {
        let left = 0;
        let right = comments.length;
        let middle = 0;
        while (left !== right) {
            middle = left + Math.floor((right - left) / 2)
            const commentCreated = new Date(comments[middle].created_at)
            if ((commentCreated - timestamp) > 0) {
                right = middle
            } else if((commentCreated - timestamp) < 0) {
                left = middle + 1
            } else {
                return middle
            }
        }
        return left
    }

    const updateChatMessages = () => {
        if (!chatEnabled) {
            return;
        }
        const currentTime = new Date()
        var messagesToAdd = []
        var j = i
        while (j < comments.length && (currentTime - startTime) > (new Date(comments[j].created_at) - firstCommentTime)) {
            messagesToAdd = messagesToAdd.concat(comments[j])
            j += 1
        }
        setI(j)

        const newChatMessages = chatMessages.concat(messagesToAdd)
        const start = Math.max(newChatMessages.length - 100, 0)
        const end = newChatMessages.length
        setChatMessages(newChatMessages.slice(start, end));
    }

    const onPlay = (event) => {
        setChatEnabled(true)
        const offsetTime = new Date(firstCommentTime)
        offsetTime.setSeconds(offsetTime.getSeconds() + event.target.getMediaReferenceTime())
        setI(Math.max(0, findCommentIndexForTimestamp(offsetTime)-35))
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - event.target.getMediaReferenceTime())
        setStartTime(startTime)
        setChatMessages([])
    }

    const onPause = () => {
        setChatEnabled(false)
    }

    const onPlaybackRateChange = (event) => {
        console.log(event.data)
    }

    useEffect(() => {
        const timer = setTimeout(updateChatMessages, 500);
        return () => clearTimeout(timer);
    })

    return (
        <div className="App">
            <Video
                videoId={window.location.search.split("=")[1]}
                onPlay={onPlay}
                onPause={onPause}
                onPlaybackRateChange={onPlaybackRateChange}
            />
            <Chat chatMessages={chatMessages}/>
        </div>
    );
}

export default App;
