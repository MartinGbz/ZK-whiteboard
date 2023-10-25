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
  onError?: (error: string) => void;
}

let sismoConnect: SismoConnectClient | null = null;

const Message: React.FC<MessageProps> = ({
  message,
  appId,
  vaultId,
  onDelete,
  onError,
}) => {
  const [x, setX] = useState(message.positionX);
  const [y, setY] = useState(message.positionY);
  const [isMessageHovering, setIsMessageHovering] = useState(false);
  const messageRef = useRef<HTMLInputElement>(null);

  const [reactionsStats, setReactionsStats] = useState<ReactionsStats | null>(
    null
  );

  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const redirectToRoot = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

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
    opacity: isMessageHovering ? "1" : "0",
    transform: isMessageHovering ? "scale(1.1)" : "scale(1)",
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
      try {
        const res = await axios.get(
          "/api/message/reaction?id=" + message.id + "&userId=" + vaultId,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const reactions: ReactionsStats = res.data;
        setReactionsStats(reactions);
      } catch (error: any) {
        const defaultErrorMessage =
          "An error occured while fetching the messages reactions";
        const errorMessage = error.response.data.error
          ? `${defaultErrorMessage}: ${error.response.data.error}`
          : defaultErrorMessage;
        onError && onError(errorMessage);
      }
    };

    getReaction();
  }, [message.id, onError, vaultId]);

  function reactionClick(type: string): void {
    let requestType: ReactionOperationType;

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

  useEffect(() => {
    if (!appId) return;
    if (!message.id) return;

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
          setSismoConnectResponseMessage(responseMessage);
        }
      }
    }
  }, [appId, message.id]);

  useEffect(() => {
    const verifyProof = async () => {
      try {
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
      } catch (error: any) {
        const defaultErrorMessage =
          "An error occured while posting your reaction";
        const errorMessage = error.response.data.error
          ? `${defaultErrorMessage}: ${error.response.data.error}`
          : defaultErrorMessage;
        onError && onError(errorMessage);
      }
    };
    verifyProof();
  }, [onError, redirectToRoot, sismoConnectResponseMessage]);

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
          className="top-button delete-button"
          style={{ ...topButtonStyle, backgroundColor: redColor }}
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
                className="top-button reaction-button"
                key={reaction.type}
                style={{
                  ...topButtonStyle,
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
        </div>
      )}
    </div>
  );
};

export default Message;
