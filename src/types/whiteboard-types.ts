import {
  Message,
  Whiteboard as WhiteboardPrisma,
  User as UserPrisma,
  Reaction,
} from "@prisma/client";

export enum OperationType {
  POST = "post",
  EDIT = "edit",
  DELETE = "delete",
}

export type SignedMessage = {
  type: OperationType;
  message: Omit<
    Message,
    "id" | "authorVaultId" | "order" | "createdAt" | "updatedAt"
  >;
};

export type PostDeletionResponse = {
  vaultId: string;
  messages: Message[];
};

export type WhiteboardCreateSignedMessage = {
  type: OperationType;
  message: Omit<
    WhiteboardPrisma,
    "id" | "authorVaultId" | "curated" | "appId" | "createdAt" | "updatedAt"
  >;
};

export type WhiteboardEditSignedMessage = {
  type: OperationType;
  message: WhiteboardPrisma;
};

export interface Position {
  x: number;
  y: number;
}

export interface Whiteboard extends WhiteboardPrisma {
  messages: Message[];
}

export interface whiteboardWithMessageCount extends WhiteboardPrisma {
  messagesCount: number;
}

export type WhiteboardIndex = Omit<WhiteboardPrisma, "groupIds"> & {
  groupNames: string[];
  messagesCount: number;
};

export interface User extends UserPrisma {
  createdWhiteboards: Whiteboard[];
}

export type ReactionCounts = {
  type: string;
  _count: number;
};

export type ReactionsStats = {
  reactionCounts: ReactionCounts[];
  userReaction: Reaction;
};

export type ReactionSignedMessage = {
  type: OperationType;
  message: Omit<Reaction, "id" | "userId" | "createdAt" | "updatedAt">;
  whiteboardId: number;
};
