import { Message, Whiteboard as WhiteboardPrisma } from "@prisma/client";

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
