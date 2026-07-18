export interface Cell {
  x: number;
  y: number;

  text?: string;

  fill?: string;

  stroke?: string;

  strokeWidth?: number;

  radius?: number;

  color?: string;

  fontSize?: number;

  fontWeight?: number;

  image?: string;
}

export interface GridOptions {
  rows: number;

  cols: number;

  tileSize?: number;

  gap?: number;

  background?: string;

  padding?: number;
  scale?: number;
}
