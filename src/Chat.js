import './Chat.css';
import React, {FC, useEffect, useRef} from 'react'
import SimpleBar from "simplebar-react";
import 'simplebar/dist/simplebar.min.css';
import {colors} from "./colors";


type Fragment = {
    text: string,
    emoticon: {
        emoticon_id: string
    }
}

type ChatMessage = {
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
        messagesEndRef.current.scrollIntoView({behavior: "smooth"})
        simpleBarRef.current.recalculate()
    }

    const formatFragment = (fragment) => {
        if (fragment.emoticon) {
            const emoticonId = fragment.emoticon.emoticon_id
            return <img alt="emote" className="emoticon" src={"https://static-cdn.jtvnw.net/emoticons/v1/" + emoticonId + "/1.0"}/>
        }
        return <span>{fragment.text}</span>
    }

    const getColor = function (message) {
        let colorHash = Math.abs(message.commenter.display_name.hashCode());
        return colors[colorHash % colors.length];
    };

    const formatMessage = (message) => {
        return <>
            <span className="commenter" style={{color: getColor(message)}}>{message.commenter.display_name + ": "}</span>
            {message.message.fragments.map(formatFragment)}
        </>
    }

    useEffect(scrollToBottom, [chatMessages])

    return (
        <div className="Chat">
            <SimpleBar forceVisible="y" autoHide={false} ref={simpleBarRef}>
                {chatMessages.map(message => (
                    <p className="chatMessage">{formatMessage(message)}</p>
                ))}
                <div ref={messagesEndRef}/>
            </SimpleBar>
        </div>
    );
}

export default Chat;
