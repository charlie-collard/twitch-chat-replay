import './Chat.css';
import React, {FC, useEffect, useRef} from 'react'
import SimpleBar from "simplebar-react";
import 'simplebar/dist/simplebar.min.css';

type ChatProps = {
    chatMessages: {
        commenter: {
            display_name: string
        },
        message: {
            body: string,
            user_color: string,
            fragments: {
                text: string,
                emoticon: {
                    emoticon_id: string
                }
            }[]
        }
    }
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

    const formatMessage = (message) => {
        return <>
            <span style={{color: message.message.user_color}}>{message.commenter.display_name + ": "}</span>
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
