import {api} from '../../services/api';
import io from 'socket.io-client';
import styles from "./styles.module.scss";
import logoImg from '../../assets/logo.svg';
import { useEffect, useState } from 'react';

interface MessageProps {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

const messagesQueue: MessageProps[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: MessageProps) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<MessageProps[]>([] as MessageProps[]);

  useEffect(() => {
    api.get<MessageProps[]>('messages/last3').then(response => { setMessages(response.data) });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(message => [
          messagesQueue[0],
          message[0],
          message[1]
        ].filter(Boolean));

        messagesQueue.shift();
      }
      
      return () => clearInterval(timer);
    }, 3000)
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="Do While 2021" />
      <ul className={styles.messageList}>
          {
            messages.map(message => {
              return (
                <li className={styles.message} key={message.id}>
                  <p className={styles.messageContent}>{message.text}</p>
                  <div className={styles.messageUser}>
                    <div className={styles.userImage}>
                      <img src={message.user.avatar_url} alt={message.user.name} />
                    </div>
                    <span>{message.user.name}</span>
                  </div>
                </li>
              )
            })
          }
      </ul>
    </div>
  )
}