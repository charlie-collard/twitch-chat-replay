import './Chat.css';
import React, { FC } from 'react'

type ChatProps = {
    chatMessages: String[]
}

const Chat: FC<ChatProps> = ({ chatMessages }) => {
    return (
        <div className="Chat">
            {chatMessages.map( message => (
                <p>{message}</p>
            ))}
        </div>
    );
}

export default Chat;
