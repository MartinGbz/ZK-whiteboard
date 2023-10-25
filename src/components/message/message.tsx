"use client";
import React, {
  CSSProperties,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MAX_Z_INDEX,
  TRANSPARENCY,
  blueColor,
  greenColor,
  redColor,
} from "@/configs/configs";
import "./message.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { Message as MessageType } from "@prisma/client";
import axios from "axios";
import {
  ReactionOperationType,
  ReactionSignedMessage,
  ReactionsStats,
} from "@/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectClient,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import { usePathname, useRouter } from "next/navigation";

interface MessageProps {
  message: MessageType;
  appId: string;
  vaultId: string | null;
  onDelete?: (message: MessageType) => void;
}

let sismoConnect: SismoConnectClient | null = null;

const Message: React.FC<MessageProps> = ({
  message,
  appId,
  vaultId,
  onDelete,
}) => {
  const [x, setX] = useState(message.positionX);
  const [y, setY] = useState(message.positionY);

  const [isMessageHovering, setIsMessageHovering] = useState(false);

  const messageRef = useRef<HTMLInputElement>(null);

  // const messageReactions = useRef<Array<any>>([]);

  // const thumbsUpReaction = useRef<any>(null);
  // const purpleHeartReaction = useRef<any>(null);
  // const okHandReaction = useRef<any>(null);

  const [reactionsStats, setReactionsStats] = useState<ReactionsStats | null>(
    null
  );
  // const [clickedReactions, setClickedReactions] = useState<{
  //   [type: string]: boolean;
  // }>({});

  const router = useRouter();
  const pathname = usePathname();

  const redirectToRoot = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // const [thumbsUpReaction, setThumbsUpReaction] = useState<Reaction | null>(
  //   null
  // );
  // const [purpleHeartReaction, setPurpleHeartReaction] =
  //   useState<Reaction | null>(null);
  // const [okHandReaction, setOkHandReaction] = useState<Reaction | null>(null);

  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);

  const messageStyle: CSSProperties = {
    backgroundColor: "#" + message.color + TRANSPARENCY,
    zIndex: isMessageHovering ? MAX_Z_INDEX : MAX_Z_INDEX - message.order,
    animation:
      vaultId === message.authorVaultId && !isMessageHovering
        ? `shine 5s infinite linear`
        : "",
    top: y,
    left: x,
    ["--shadow-color" as string]: `#${message.color}`,
    fontSize: -message.text.length * 0.05 + 20, // f(x)= -0,05x + 20 (fontSize = 20 for 0 char and 10 for 200 char)
    overflowWrap: "break-word",
    position: "absolute",
  };

  const topButtonStyle: CSSProperties = {
    zIndex: MAX_Z_INDEX + 1,
    // opacity: isMessageHovering ? "1" : "0",
    transform: isMessageHovering ? "scale(1.1)" : "scale(1)",

    cursor: "pointer",
    display: "inline-flex",
    padding: "5px",
    boxShadow: "rgba(0, 0, 0, 0.25) -5px 5px 15px 3px",
    transition: "opacity 0.2s transform 0.2s translate 0.2s",
    borderRadius: "50%",
    textAlign: "center",

    alignItems: "center",
    justifyContent: "center",
  };

  const deleteButtonStyle: CSSProperties = {
    position: "absolute",
    backgroundColor: redColor,
    top: "-10px",
    right: "-10px",
  };

  const reactionButtonStyle: CSSProperties = {
    fontSize: "12px",
    textAlign: "center",
    top: "-10px",
    height: "25px",
    // width: "25px",

    minWidth: "25px",
    width: "fit-content",
    borderRadius: "2em",
  };

  const handleMessageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  const handleMouseEnter = () => {
    setIsMessageHovering(true);
  };

  const handleMouseLeave = () => {
    setIsMessageHovering(false);
  };

  useEffect(() => {
    // get message reactions
    const getReaction = async () => {
      const res = await axios.get(
        "/api/message/reaction?id=" + message.id + "&userId=" + vaultId,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // messageReactions.current = reactions.data;
      const reactions: ReactionsStats = res.data;
      setReactionsStats(reactions);
      // if (!reactions) return;
      // setThumbsUpReaction(reactions.find((r) => r.type == "👍") ?? null);
      // setPurpleHeartReaction(reactions.find((r) => r.type == "💜") ?? null);
      // setOkHandReaction(reactions.find((r) => r.type == "👌") ?? null);
    };

    getReaction();
  }, [message.id, vaultId]);

  function reactionClick(type: string): void {
    let requestType: ReactionOperationType;
    // if type is already clicked, remove reaction
    // if (clickedReactions[type]) {
    //   console.log("remove reaction");
    //   Object.keys(clickedReactions).forEach((key) => {
    //     clickedReactions[key] = false;
    //   });
    //   setClickedReactions({ ...clickedReactions });
    //   requestType = ReactionOperationType.DELETE;
    // } else {
    //   console.log("add reaction");
    //   // reset all clicked reactions
    //   const newClickedReactions = { ...clickedReactions };
    //   Object.keys(newClickedReactions).forEach((key) => {
    //     newClickedReactions[key] = false;
    //   });
    //   setClickedReactions({ ...newClickedReactions, [type]: true });
    //   requestType = ReactionOperationType.POST;
    // }

    // detect if the user already reacted with this reaction
    if (reactionsStats?.userReaction?.type.toString() === type.toString()) {
      requestType = ReactionOperationType.DELETE;
    } else {
      requestType = ReactionOperationType.POST;
    }

    const sismoConnectSignedMessage: ReactionSignedMessage = {
      type: requestType,
      message: {
        type: type,
        messageId: message.id,
      },
    };
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      return;
    }
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  }

  // useEffect(() => {
  //   // set clicked reactions
  //   if (!reactionsStats) return;
  //   Object.keys(newClickedReactions).forEach((key) => {
  //     newClickedReactions[key] = false;
  //   });
  //   if (reactionsStats.userReaction) {
  //     newClickedReactions[reactionsStats.userReaction.type] = true;
  //   }
  //   setClickedReactions({ ...newClickedReactions });
  // }, [reactionsStats]);

  useEffect(() => {
    sismoConnect = SismoConnect({
      config: {
        appId: appId,
      },
    });
    const responseMessage: SismoConnectResponse | null =
      sismoConnect.getResponse();
    if (responseMessage?.signedMessage) {
      const signedMessage = JSON.parse(responseMessage.signedMessage);
      // check if the message is a reaction
      if (signedMessage.message.type) {
        // check if we are verifying the right message
        if (signedMessage.message.messageId === message.id) {
          console.log("signedMessage");
          console.log(message.id);
          console.log("responseMessage");
          console.log(responseMessage);
          setSismoConnectResponseMessage(responseMessage);
        }
      }
    }
  }, [appId]);

  useEffect(() => {
    const verifyProof = async () => {
      if (!sismoConnectResponseMessage) return;
      const res = await axios.post(
        "/api/message/reaction",
        sismoConnectResponseMessage,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const reactions: ReactionsStats = res.data;
      setReactionsStats(reactions);
      redirectToRoot();
    };
    verifyProof();
  }, [redirectToRoot, sismoConnectResponseMessage]);

  return (
    <div
      ref={messageRef}
      key={message.authorVaultId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="message hoverable"
      style={messageStyle}
      onClick={handleMessageClick}>
      <div>{message.text}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <div
          title={message.authorVaultId}
          style={{
            fontSize: "10px",
            fontWeight: "normal",
            fontFamily: "Inter-Regular",
            whiteSpace: "nowrap",
          }}>
          {message.authorVaultId !== vaultId
            ? "from: " + message.authorVaultId.substring(0, 7) + "..."
            : "from: You"}
        </div>
      </div>
      {vaultId === message.authorVaultId && (
        <button
          className="delete-button"
          style={{ ...topButtonStyle, ...deleteButtonStyle }}
          onClick={onDelete ? () => onDelete(message) : undefined}>
          <DeleteIcon
            style={{
              color: "white",
              fontSize: "15px",
            }}
          />
        </button>
      )}
      {vaultId !== message.authorVaultId && (
        // <div
        //   style={{
        //     width: "fit-content",
        //     height: "fit-content",
        //     // position: "absolute",
        //     // display: "flex",
        //   }}>
        //   <button
        //     style={{
        //       ...topButtonStyle,
        //       ...reactionButtonStyle,
        //       right: "-10px",
        //     }}>
        //     <span>👍</span>
        //   </button>
        //   <button
        //     style={{
        //       ...topButtonStyle,
        //       ...reactionButtonStyle,
        //       right: -10 + 25 + 4 + "px",
        //     }}>
        //     <span>💜</span>
        //   </button>
        //   <button
        //     style={{
        //       ...topButtonStyle,
        //       ...reactionButtonStyle,
        //       right: -10 + 2 * 25 + 2 * 4 + "px",
        //     }}>
        //     <span>👌</span>
        //   </button>
        // </div>
        <div
          style={{
            position: "absolute",
            display: "flex",
            right: "-15px",
            top: "-15px",
          }}
          className="buttons-container">
          {reactionsStats?.reactionCounts?.map((reaction) => {
            return (
              <button
                key={reaction.type}
                style={{
                  ...topButtonStyle,
                  ...reactionButtonStyle,
                  backgroundColor:
                    reactionsStats?.userReaction?.type.toString() ===
                    reaction.type.toString()
                      ? greenColor
                      : blueColor,
                }}
                onClick={() => reactionClick(reaction.type)}>
                <span className="emoji-animation">{reaction.type}</span>
                {reaction._count > 0 && (
                  <span className="count">{reaction._count}</span>
                )}
              </button>
            );
          })}
          {/* <button
            style={{
              ...topButtonStyle,
              ...reactionButtonStyle,
            }}
            onClick={(e) => reactionClick(e)}>
            <span className="emoji-animation">👍</span>
            {thumbsUpReaction && (
              <span className="count">{thumbsUpReaction._count}</span>
            )}
          </button>
          <button
            style={{
              ...topButtonStyle,
              ...reactionButtonStyle,
            }}>
            <span className="emoji-animation">💜</span>
            {purpleHeartReaction && (
              <span className="count">{purpleHeartReaction._count}</span>
            )}
          </button>
          <button
            style={{
              ...topButtonStyle,
              ...reactionButtonStyle,
            }}>
            <span className="emoji-animation">👌</span>
            {okHandReaction && (
              <span className="count">{okHandReaction._count}</span>
            )}
          </button> */}
        </div>
      )}
    </div>
  );
};

export default Message;
