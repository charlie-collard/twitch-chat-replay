import './ChatSelector.css';
import React, {FC, useState} from 'react'
import summaries from "../json/summaries.json";

type ChatSelectorProps = {
    onSelect: Function
}

const ChatSelector: FC<ChatSelectorProps> = ({onSelect}) => {
    const [currentFilter, setCurrentFilter] = useState("")

    const filterFunction = function (summary) {
        const videoTitle = summary.title.toLowerCase()
        const parts = currentFilter.toLowerCase().split(" ")
        return parts.every((part) => videoTitle.includes(part))
    };

    const getButtonText = function (summary) {
        return <>
            <p className="chat-selection-button-title">{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
        </>
    };

    const updateFilter = function (event) {
        setCurrentFilter(event.target.value);
    };

    const clearSearch = function (event) {
        if (event.target.value === "Search Here!") {
            event.target.value = ""
        }
    };

    return (
        <>
            <form>
                <input
                    defaultValue="Search Here!"
                    onClick={clearSearch}
                    onChange={updateFilter}
                    className="chat-search-box"
                />
            </form>
            <div className="chat-selector">
                {summaries.filter(filterFunction)
                    .map((summary) =>
                        <button
                            key={summary.id}
                            className="chat-selection-button"
                            onClick={() => onSelect(summary)}
                        >
                            {getButtonText(summary)}
                        </button>
                    )}
            </div>
        </>
    );
}

export default ChatSelector;
