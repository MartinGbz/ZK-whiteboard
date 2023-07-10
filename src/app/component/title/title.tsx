"use client";
import React, { CSSProperties } from "react";
import "./title.css";

interface MessageProps {
  text: string;
  style?: CSSProperties;
}

const Title: React.FC<MessageProps> = ({
  text,
  style,
}) => {

  // const characters = "TESSST";
  // const transformedElements = Array.from(characters).map((char, index) => (
  //   <span
  //     key={index}
  //     className={`waviy-char waviy-char-${index + 1}`}
  //   >
  //     {char}
  //   </span>
  // ));

  const transformedElements = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const animationDelay = 0.1 * (i + 1);
    transformedElements.push(
      <span
        key={i}
        className={`waviy-char`}
        style={{ animationDelay: `${animationDelay}s` }}
      >
        {char}
      </span>
    );
  }

  return (
    <div className="waviy" style={style}>{transformedElements}</div>
  );

  // return (
  //   <div className="waviy">
  //     <span className={`waviy-char waviy-char-${index + 1}`}>Z</span>
  //     <span>I</span>
  //     <span>Y</span>
  //     <span>O</span>
  //     <span>V</span>
  //     <span>U</span>
  //     <span>D</span>
  //     <span>D</span>
  //     <span>I</span>
  //     <span>N</span>
  //   </div>
  // );
};

export default Title;
