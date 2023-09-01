import { Whiteboard as WhiteboardPrisma } from "@prisma/client";

export interface Message {
  id: number;
  text: string;
  positionX: number;
  positionY: number;
  order: number;
  color: string;
  whiteboardId: number;
  authorVaultId: string;
}

export enum OperationType {
  POST = "post",
  DELETE = "delete",
}

export type SignedMessage = {
  type: OperationType;
  message: Omit<Message, "id" | "authorVaultId" | "order">;
};

export interface Position {
  x: number;
  y: number;
}

export interface Whiteboard extends WhiteboardPrisma {
  messages: Message[];
}
