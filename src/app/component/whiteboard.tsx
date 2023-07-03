'use client';
import React, { useEffect, useRef, useState } from 'react';
import './Whiteboard.css';
import { Message } from  '../types/whiteboard-types'
import Draggable from 'react-draggable';

const Whiteboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagePosition, setMessagePosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [disableClick, setDisableClick] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Code asynchrone à exécuter une fois que le composant a fini de charger
        const response = await fetch('/api/whiteboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setMessages(data);
        console.log("messages");
        console.log(messages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const userId = localStorage.getItem('userId');
    if(userId) {
      setUserId(userId)
    }

  }, [messages]);

  useEffect(() => {
    // Focus the input when the modal opens
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Reset the modal position when it opens
    if(isModalOpen && modalRef.current && messagePosition) {
      modalRef.current.style.top = `${messagePosition.y}px`;
      modalRef.current.style.left = `${messagePosition.x}px`;
    }
  }, [isModalOpen, messagePosition]);

  const handleSave = async () => {

    // sismo connect
    // get the user id

    const newMessage: Message = {
      userId: 'TODO123',
      text: inputValue,
      positionX: messagePosition.x,
      positionY: messagePosition.y,
    };

    setNewMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsModalOpen(false);

    const response = await fetch('/api/whiteboard', {
      method: 'POST',
      body: JSON.stringify(newMessage),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log(data);
  };

  const handleMessageClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  };

  const startMessageCreation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
    const initialPosition = { x: event.clientX - containerRect.left, y: event.clientY - containerRect.top };
    setMessagePosition(initialPosition);
    setIsModalOpen(true);
  };

  return (
    <div className="whiteboard">
      <h1>Whiteboard</h1>
      <div className="messages_container"
      onDoubleClick={(e) => startMessageCreation(e)}>
        {messages.map((message: Message) => (
          <Draggable
            key={message.userId}
            defaultPosition={{x: message.positionX, y: message.positionY}}
            bounds="parent"
            // disabled={message.userId !== newMessage?.userId}
            disabled={message.userId !== userId}
            >
            <div
              className="message"
              onClick={handleMessageClick}
              onMouseDown={() => setDisableClick(true)}
              onMouseUp={() => setDisableClick(false)}
            >
              {message.text}
            </div>
          </Draggable>
        ))}
      </div>
      {isModalOpen && (
        <div className="modal"
        ref={modalRef}
        style={{ position: 'absolute', top: messagePosition?.y, left: messagePosition?.x }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === 'Enter') { 
                handleSave()
              }
              else if(e.key === 'Escape') {
                setIsModalOpen(false)
              }
            }}
            ref={inputRef}
          />
          <button onClick={() => setIsModalOpen(false)}> Cancel </button>
          <button onClick={() => handleSave()}> Save </button>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;