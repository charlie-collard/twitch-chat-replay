import './ChatSelector.css'
import React, {FC, useState} from 'react'
import summaries from "../json/summaries.json"

type ChatSelectorProps = {
    onSelectKnownJson: Function,
    onUploadCustomJson: Function
}

const ChatSelector: FC<ChatSelectorProps> = ({onSelectKnownJson, onUploadCustomJson}) => {
    const [currentFilter, setCurrentFilter] = useState("")

    const filterFunction = function (summary) {
        const videoTitle = summary.title.toLowerCase()
        const parts = currentFilter.toLowerCase().split(" ")
        return parts.every((part) => videoTitle.includes(part))
    }

    const getButtonText = function (summary) {
        return <>
            <p className="chat-selection-button-title">{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
        </>
    }

    const updateFilter = function (event) {
        setCurrentFilter(event.target.value)
    }

    const clearSearch = function (event) {
        if (event.target.value === "Search for NL vods here!") {
            event.target.value = ""
        }
    }

    const uploadCustomFile = function (event) {
        const file = event.target.files[0]
        new Promise(((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
            reader.readAsText(file)
        }))
            .then((result) => onUploadCustomJson(JSON.parse(result)))
            .catch((error) => console.log(error))
    }

    return (
        <>
            <form className="search-form">
                <button
                    className="seen-upload-chat-file-button"
                    onClick={(event) => {event.preventDefault(); document.getElementById("uploadChatFile").click()}}
                >
                    Upload chat file...
                </button>
                <input
                    type="file"
                    id="uploadChatFile"
                    className="hidden-upload-chat-file-button"
                    onChange={uploadCustomFile}
                />
                <p>---OR---</p>
                <input
                    defaultValue="Search for NL vods here!"
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
                            onClick={() => onSelectKnownJson(summary)}
                        >
                            {getButtonText(summary)}
                        </button>
                    )}
            </div>
        </>
    )
}

export default ChatSelector
