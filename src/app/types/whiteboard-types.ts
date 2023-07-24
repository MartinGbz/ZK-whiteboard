export interface Message {
  vaultId: string;
  text: string;
  positionX: number;
  positionY: number;
  order: number;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}
