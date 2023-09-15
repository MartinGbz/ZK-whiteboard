import {
  Message,
  Whiteboard as WhiteboardPrisma,
  User as UserPrisma,
} from "@prisma/client";

export enum MessageOperationType {
  POST = "post",
  DELETE = "delete",
}
export enum WhiteboardOperationType {
  CREATE = "create",
  EDIT = "edit",
}

export type SignedMessage = {
  type: MessageOperationType;
  message: Omit<Message, "id" | "authorVaultId" | "order">;
};

export type PostDeletionResponse = {
  vaultId: string;
  messages: Message[];
};

export type WhiteboardCreateSignedMessage = {
  type: WhiteboardOperationType;
  message: Omit<WhiteboardPrisma, "id" | "authorVaultId" | "curated" | "appId">;
};

export type WhiteboardEditSignedMessage = {
  type: WhiteboardOperationType;
  message: WhiteboardPrisma;
};

export interface Position {
  x: number;
  y: number;
}

export interface Whiteboard extends WhiteboardPrisma {
  messages: Message[];
}

export type WhiteboardIndex = Omit<WhiteboardPrisma, "groupIds"> & {
  groupNames: string[];
};

export interface User extends UserPrisma {
  createdWhiteboards: Whiteboard[];
}
