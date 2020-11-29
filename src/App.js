import './App.css';
import Video from "./Video";
import Chat from "./Chat";
import {useState, useEffect} from "react";

function App() {
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setChatMessages(chatMessages.concat(["Hi"]));
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
