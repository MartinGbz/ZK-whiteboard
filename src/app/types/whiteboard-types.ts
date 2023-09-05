import { Message, Whiteboard as WhiteboardPrisma } from "@prisma/client";

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

// type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// export type WhiteboardSignedMessage = {
//   type: WhiteboardOperationType;
//   message: PartialBy<WhiteboardPrisma, "id" | "authorVaultId" | "curated">;
// };

export type WhiteboardCreateSignedMessage = {
  type: WhiteboardOperationType;
  message: Omit<WhiteboardPrisma, "id" | "authorVaultId" | "curated">;
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
