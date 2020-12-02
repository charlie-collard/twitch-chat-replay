import './Chat.css';
import React, {FC, useEffect, useRef} from 'react'
import SimpleBar from "simplebar-react";
import 'simplebar/dist/simplebar.min.css';
import {colors} from "../utils/colors";


type Fragment = {
    text: string,
    emoticon: {
        emoticon_id: string
    }
}

type ChatMessage = {
    _id: string,
    content_offset_seconds: number,
    commenter: {
        display_name: string
    },
    message: {
        body: string,
        user_color: string,
        fragments: Fragment[]
    }
}

type ChatProps = {
    chatMessages: ChatMessage[]
}

const Chat: FC<ChatProps> = ({chatMessages}) => {
    const messagesEndRef = useRef(null)
    const simpleBarRef = useRef()

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({behavior: "auto"})
        simpleBarRef.current.recalculate()
    }

    const formatTimestamp = (content_offset) => {
        const hours = Math.floor(content_offset / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((content_offset / 60) % 60).toString().padStart(2, "0");
        const seconds = Math.floor(content_offset % 60).toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds} `
    }

    const formatFragment = (fragment, i) => {
        if (fragment.emoticon) {
            const emoticonId = fragment.emoticon.emoticon_id
            return <img
                key={fragment.text + i.toString()}
                alt={fragment.text}
                className="emoticon"
                src={"https://static-cdn.jtvnw.net/emoticons/v1/" + emoticonId + "/1.0"}
            />
        }
        return <span key={fragment.text + i.toString()}>{fragment.text}</span>
    }

    const getColor = function (message) {
        let colorHash = Math.abs(message.commenter.display_name.hashCode());
        return colors[colorHash % colors.length];
    };

    const formatMessage = (message) => {
        return <>
            <span>{formatTimestamp(message.content_offset_seconds)}</span>
            <span className="commenter" style={{color: getColor(message)}}>{message.commenter.display_name + ": "}</span>
            {message.message.fragments.map(formatFragment)}
        </>
    }

    useEffect(scrollToBottom, [chatMessages])

    return (
        <div className="Chat">
            <SimpleBar forceVisible="y" autoHide={false} ref={simpleBarRef}>
                {chatMessages.map(message => (
                    <p key={message._id} className="chatMessage">{formatMessage(message)}</p>
                ))}
                <div key={"messagesEnd"} ref={messagesEndRef}/>
            </SimpleBar>
        </div>
    );
}

export default Chat;
