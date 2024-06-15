import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

import './App.css';
import { MessagePacket } from './types/messages';
import formatDate from './utils/date';

const socket = io("http://localhost:3001");

const App: React.FC = () => {
  // States:
  const [room, setRoom] = useState("");
  const [outgoingMessage, setOutgoingMessage] = useState<MessagePacket>({message: ""});
  const [incomingMessages, setIncomingMessages] = useState<MessagePacket[]>([]);

  // Helper functions:
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const handleInputRoomChange = (evt: React.FormEvent<HTMLInputElement>) => {
    setRoom(evt.currentTarget.value);
  };

  const handleInputMessageChange = (evt: React.FormEvent<HTMLTextAreaElement>) => {
    setOutgoingMessage({room, message: evt.currentTarget.value});
  };
  
  const sendMessage = () => {
    socket.emit("send_message", outgoingMessage);
  };

  // Hooks:
  /*
   * TRICKY: I needed help with incoming messages showing up twice. This solution solved it, but
   * I have some outstanding quesions:

   * 1. Why does the cleanup function prevent the message fromo showing up twice? Does it not
   * only run when the component unmounts?
   
   * 2. If the dependency array is empty, I thought it wouldn't listen to socket changes. But
   * socket is still listened to, so is it because socket is a websocket and trumps React's
   * state update system?
   */
  useEffect(() => {
    const handleMessage = (data: MessagePacket) => {
    // TRICKY: Must use the functional form of the state setter otherwise React will not be able 
    // to update the state inside useEffect hook, because state setter is asynchronous.
      setIncomingMessages(prevIncomingMessages => [...prevIncomingMessages, data]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);
  
  return (
    <div className="App">
      <h1>Nather Chat App</h1>

      <p>Initial proof of concept using Socket.IO</p>

      <section className="inputs">
        <div className="input-row">
          <input placeholder='Join room or leave blank and send to all...' onChange={handleInputRoomChange} className='room-input' />
          <button onClick={joinRoom}>Join Room</button>
        </div>

        <div className="input-row">
          <textarea placeholder='Message...' onChange={handleInputMessageChange} className='message-input' />
          <button onClick={sendMessage}>Send message</button>
        </div>
      </section>

      <h2>Messages</h2>
      
      <ul className="messages">
        {incomingMessages.slice().reverse().map((incomingMessage, index) => {
          return (
            <li key={index + incomingMessage.message.length}>
              <p className='date'>{formatDate(incomingMessage.date)}</p>
              <p className='room'>{incomingMessage.room}</p>
              <p className='message'>{incomingMessage.message}</p>
            </li>
          );
      })}
      </ul>
    </div>
  );
}

export default App;
