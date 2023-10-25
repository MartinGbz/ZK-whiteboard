import {
  Message,
  Whiteboard as WhiteboardPrisma,
  User as UserPrisma,
  Reaction,
} from "@prisma/client";

export enum MessageOperationType {
  POST = "post",
  DELETE = "delete",
}
export enum WhiteboardOperationType {
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete",
}

export type SignedMessage = {
  type: MessageOperationType;
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
  type: WhiteboardOperationType;
  message: Omit<
    WhiteboardPrisma,
    "id" | "authorVaultId" | "curated" | "appId" | "createdAt" | "updatedAt"
  >;
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

export enum ReactionOperationType {
  POST = "post",
  DELETE = "delete",
}

export type ReactionSignedMessage = {
  type: ReactionOperationType;
  message: Omit<Reaction, "id" | "userId" | "createdAt" | "updatedAt">;
};
