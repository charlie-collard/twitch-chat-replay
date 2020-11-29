import './Chat.css';
import React, {FC, useEffect, useRef} from 'react'

type ChatProps = {
    chatMessages: String[]
}

const Chat: FC<ChatProps> = ({chatMessages}) => {
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({behavior: "auto"})
    }

    useEffect(scrollToBottom, [chatMessages])

    return (
        <>
            <div className="Chat">
                {chatMessages.map(message => (
                    <p>{message}</p>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </>
    );
}

export default Chat;
