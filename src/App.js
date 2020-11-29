import './App.css';
import Video from "./Video";
import Chat from "./Chat";
import {useState, useEffect} from "react";

const initialState = [
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
    "hi",
];

function App() {
    const [chatMessages, setChatMessages] = useState(initialState);

    useEffect(() => {
        const timer = setTimeout(() => {
            setChatMessages(chatMessages.concat(["hi"]));
        }, 1000);
        return () => clearTimeout(timer);
    })

    return (
        <div className="App">
            <Video/>
            <Chat chatMessages={chatMessages}/>
        </div>
    );
}

export default App;
