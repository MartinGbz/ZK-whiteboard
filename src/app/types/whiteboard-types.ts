export interface Message {
  vaultId: string;
  text: string;
  positionX: number;
  positionY: number;
  order: number;
  color: string;
}

export enum OperationType {
  POST = "post",
  DELETE = "delete",
}

export type SignedMessage = {
  type: OperationType;
  message: Omit<Message, "vaultId" | "order">;
};

export interface Position {
  x: number;
  y: number;
}
