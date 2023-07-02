'use client';
import React, { useEffect, useRef, useState } from 'react';
import './Whiteboard.css';
import { Message } from  '../types/whiteboard-types'
import Draggable from 'react-draggable';

const Whiteboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagePositions, setMessagePositions] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [messageInitalPosition, setMessageInitalPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }

    if(isModalOpen && modalRef.current && messageInitalPosition) {
      modalRef.current.style.top = `${messageInitalPosition.y}px`;
      modalRef.current.style.left = `${messageInitalPosition.x}px`;
    }
    console.log(messageInitalPosition)
  }, [isModalOpen, messageInitalPosition]);

  const handleSave = async () => {
    const newMessage: Message = {
      userId: 'TODO', // Ajoute l'ID de l'utilisateur approprié ici
      text: inputValue,
    };
    addMessage(newMessage);
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

  const addMessage = (message: Message) => {
    setMessages([...messages, message]);
    setMessagePositions({ ...messagePositions, [message.userId]: {x: messageInitalPosition.x, y: messageInitalPosition.y} });
  };

  const handleMessageClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation(); // Empêche la propagation de l'événement de clic aux messages individuels
  };

  const startMessageCreation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
    const initialPosition = { x: event.clientX - containerRect.left, y: event.clientY - containerRect.top };
    console.log("startMessageCreation", initialPosition)
    setMessageInitalPosition(initialPosition);
    setIsModalOpen(true);
  };

  return (
    <div className="whiteboard">
      <h1>Whiteboard</h1>
      <div className="messages_container"
      onClick={(e) => startMessageCreation(e)}>
        {messages.map((message: Message) => (
          <Draggable
            key={message.userId}
            defaultPosition={{x: messageInitalPosition.x, y: messageInitalPosition.y}}
            bounds="parent">
            <div
              className="message"
              onClick={handleMessageClick}
            >
              {message.text}
            </div>
          </Draggable>
        ))}
      </div>
      {isModalOpen && (
        <div className="modal"
        ref={modalRef}
        style={{ position: 'absolute', top: messageInitalPosition?.y, left: messageInitalPosition?.x }}>
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
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button
            onClick={() => handleSave()}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;