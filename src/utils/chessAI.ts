import { GameState, Position, Piece, PieceColor, PIECE_VALUES } from '../types/chess';
import { calculateValidMoves, makeMove, isKingInCheck, isCheckmate, isStalemate } from './chessLogic';

// Rename the local Move interface to ComputerMove to avoid conflict
interface ComputerMove {
  from: Position;
  to: Position;
  score?: number;
}

const getDepthFromLevel = (level: number): number => {
  // Level 1: depth 2, Level 2: depth 3, etc.
  return Math.min(level + 1, 5);
};

const evaluatePosition = (gameState: GameState): number => {
  let score = 0;
  const rows = gameState.board.length;
  const cols = gameState.board[0].length;
  // Material evaluation
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        score += piece.color === 'white' ? value : -value;
      }
    }
  }

  // Mobility evaluation (number of legal moves)
  const whiteMoves = getAllLegalMoves(gameState, 'white').length;
  const blackMoves = getAllLegalMoves(gameState, 'black').length;
  score += (whiteMoves - blackMoves) * 0.1;

  // Center control evaluation
  const centerSquares = [
    { row: Math.floor(rows / 2) - 1, col: Math.floor(cols / 2) - 1 },
    { row: Math.floor(rows / 2) - 1, col: Math.floor(cols / 2) },
    { row: Math.floor(rows / 2), col: Math.floor(cols / 2) - 1 },
    { row: Math.floor(rows / 2), col: Math.floor(cols / 2) }
  ];

  for (const square of centerSquares) {
    if (
      square.row >= 0 && square.row < rows &&
      square.col >= 0 && square.col < cols
    ) {
      const piece = gameState.board[square.row][square.col];
      if (piece) {
        score += piece.color === 'white' ? 0.1 : -0.1;
      }
    }
  }

  // King safety evaluation
  if (isKingInCheck(gameState)) {
    score += gameState.currentTurn === 'white' ? -0.5 : 0.5;
  }

  return score;
};

const getAllLegalMoves = (gameState: GameState, color: PieceColor): ComputerMove[] => {
  const moves: ComputerMove[] = [];
  const rows = gameState.board.length;
  const cols = gameState.board[0].length;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const validMoves = calculateValidMoves({ row, col }, gameState);
        for (const move of validMoves) {
          moves.push({ from: { row, col }, to: move });
        }
      }
    }
  }
  return moves;
};

const minimax = (
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  // Terminal conditions
  if (depth === 0 || isCheckmate(gameState) || isStalemate(gameState)) {
    return evaluatePosition(gameState);
  }

  const moves = getAllLegalMoves(gameState, gameState.currentTurn);
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.from, move.to);
      const score = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.from, move.to);
      const score = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const calculateComputerMove = (gameState: GameState): ComputerMove | null => {
  const depth = getDepthFromLevel(gameState.computerLevel);
  let moves = getAllLegalMoves(gameState, gameState.currentTurn);
  
  if (moves.length === 0) return null;

  // If in check, filter moves to only those that get out of check
  if (gameState.isCheck) {
    moves = moves.filter(move => {
      const newState = makeMove(gameState, move.from, move.to);
      return !isKingInCheck(newState);
    });
    
    // If no moves get out of check, it's checkmate
    if (moves.length === 0) {
      gameState.isCheckmate = true;
      return null;
    }
  }

  // If not in check, filter out moves that would put or leave the king in check
  moves = moves.filter(move => {
    const newState = makeMove(gameState, move.from, move.to);
    return !isKingInCheck(newState);
  });

  if (moves.length === 0) return null;

  let bestMove: ComputerMove | null = null;
  let bestScore = gameState.currentTurn === 'white' ? -Infinity : Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  for (const move of moves) {
    const newState = makeMove(gameState, move.from, move.to);
    const score = minimax(newState, depth - 1, alpha, beta, gameState.currentTurn === 'black');

    if (gameState.currentTurn === 'white') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}; 