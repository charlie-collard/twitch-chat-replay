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
            body: string
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

    useEffect(scrollToBottom, [chatMessages])

    return (
        <div className="Chat">
            <SimpleBar forceVisible="y" autoHide={false} ref={simpleBarRef}>
                {chatMessages.map(message => (
                    <p className="chatMessage">{message.commenter.display_name + ": " + message.message.body}</p>
                ))}
                <div ref={messagesEndRef}/>
            </SimpleBar>
        </div>
    );
}

export default Chat;
