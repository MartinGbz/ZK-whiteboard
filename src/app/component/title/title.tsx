"use client";
import React, { CSSProperties } from "react";
import "./title.css";

interface MessageProps {
  text: string;
  style?: CSSProperties;
}

const Title: React.FC<MessageProps> = ({ text, style }) => {
  const transformedElements = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const animationDelay = 0.1 * (i + 1);
    transformedElements.push(
      <span
        key={i}
        className={`waviy-char`}
        style={{ animationDelay: `${animationDelay}s` }}>
        {char}
      </span>
    );
  }

  return (
    <div className="waviy" style={style}>
      {transformedElements}
    </div>
  );
};

export default Title;
