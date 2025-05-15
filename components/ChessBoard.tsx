import React from 'react';
import { Piece, Position, BoardTheme, BoardSize } from '../src/types/chess';
import { UNICODE_PIECES } from '../src/types/chess';
import styles from './ChessBoard.module.css';

interface ChessBoardProps {
  board: (Piece | null)[][];
  selectedPiece: Position | null;
  validMoves: Position[];
  onPieceClick: (position: Position) => void;
  onSquareClick: (position: Position) => void;
  theme: BoardTheme;
  isCheck: boolean;
  gameState: any;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedPiece,
  validMoves,
  onPieceClick,
  onSquareClick,
  theme,
  isCheck,
  gameState,
}) => {
  const rows = board.length;
  const cols = board[0].length;
  const fileLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, cols);
  const rankLabels = Array.from({ length: rows }, (_, i) => (rows - i).toString());

  const getSquareClass = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const baseClass = `${styles.square} ${styles[theme]} ${isLight ? styles.light : styles.dark}`;
    const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
    const isValidMove = validMoves.some(move => move.row === row && move.col === col);
    const isKingInCheck = isCheck && board[row][col]?.type === 'king' && board[row][col]?.color === gameState.currentTurn;

    return `${baseClass} ${isSelected ? styles.selected : ''} ${isValidMove ? styles.validMove : ''} ${isKingInCheck ? styles.kingInCheck : ''}`;
  };

  return (
    <div className={styles.chessBoardContainer}>
      <div className={styles.chessBoard} style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        width: `${cols * 70}px`,
        height: `${rows * 70}px`,
      }}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.boardRow}>
            {row.map((piece, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getSquareClass(rowIndex, colIndex)}
                onClick={() => piece ? onPieceClick({ row: rowIndex, col: colIndex }) : onSquareClick({ row: rowIndex, col: colIndex })}
              >
                {piece && (
                  <div className={`${styles.piece} ${styles[piece.color]}`}>
                    <span className={styles.pieceImage}>{UNICODE_PIECES[piece.color][piece.type]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={`${styles.boardLabels} ${styles.files}`}>
        {fileLabels.map((label, index) => (
          <div key={index} className={styles.label}>{label}</div>
        ))}
      </div>
      <div className={`${styles.boardLabels} ${styles.ranks}`}>
        {rankLabels.map((label, index) => (
          <div key={index} className={styles.rank}>{label}</div>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard; 