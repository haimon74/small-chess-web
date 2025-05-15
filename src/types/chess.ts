export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type BoardTheme = 'classic' | 'brown' | 'green' | 'navy';
export type BoardSize = '6x6' | '6x8';
export type GameVariant = 'Pawns Chess' | 'Diana Chess' | 'Los Alamos Chess' | 'Mallett Chess';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isPromotion?: boolean;
  promotionType?: PieceType;
}

export interface GameState {
  board: (Piece | null)[][];
  currentTurn: PieceColor;
  selectedPiece: Position | null;
  validMoves: Position[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  computerLevel: number;
  playerColor: PieceColor;
  boardTheme: BoardTheme;
  boardSize: BoardSize;
  gameVariant: GameVariant;
}

export interface GameSettings {
  playerColor: PieceColor;
  computerLevel: number;
  boardTheme: BoardTheme;
  boardSize: BoardSize;
  gameVariant: GameVariant;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0, // King's value is not used in evaluation
};

export const UNICODE_PIECES: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
}; 