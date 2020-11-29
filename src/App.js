import './App.css';
import Video from "./Video";
import Chat from "./Chat";

function App() {
    return (
        <div className="App">
            <Video/>
            <Chat chatMessages={["a", "b", "c"]}/>
        </div>
    );
}

export default App;
