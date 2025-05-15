import { Piece, Position, GameState, PieceType, PieceColor, PIECE_VALUES, BoardSize, GameVariant } from '../src/types/chess';

const getBoardDimensions = (boardSize: BoardSize): { rows: number; cols: number } => {
  switch (boardSize) {
    case '6x6':
      return { rows: 6, cols: 6 };
    case '6x8':
      return { rows: 8, cols: 6 };
    default:
      return { rows: 6, cols: 6 };
  }
};

const initializePawnsChess = (board: (Piece | null)[][], boardSize: BoardSize): void => {
  const { rows, cols } = getBoardDimensions(boardSize);
  const kingCol = Math.floor(cols / 2); // Place king in the middle column

  // Place king on first row
  board[0][kingCol] = { type: 'king', color: 'black', hasMoved: false };
  board[rows - 1][kingCol] = { type: 'king', color: 'white', hasMoved: false };

  // Place pawns on second row
  for (let col = 0; col < cols; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[rows - 2][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
};

const initializeDianaChess = (board: (Piece | null)[][], boardSize: BoardSize): void => {
  const { rows, cols } = getBoardDimensions(boardSize);
  const pieces: PieceType[] = ['rook', 'bishop', 'knight', 'king', 'bishop', 'rook'];

  // Place pieces on first row
  for (let col = 0; col < cols; col++) {
    board[0][col] = { type: pieces[col], color: 'black', hasMoved: false };
    board[rows - 1][col] = { type: pieces[col], color: 'white', hasMoved: false };
  }

  // Place pawns on second row
  for (let col = 0; col < cols; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[rows - 2][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
};

const initializeLosAlamosChess = (board: (Piece | null)[][], boardSize: BoardSize): void => {
  const { rows, cols } = getBoardDimensions(boardSize);
  const pieces: PieceType[] = ['rook', 'knight', 'queen', 'king', 'knight', 'rook'];

  // Place pieces on first row
  for (let col = 0; col < cols; col++) {
    board[0][col] = { type: pieces[col], color: 'black', hasMoved: false };
    board[rows - 1][col] = { type: pieces[col], color: 'white', hasMoved: false };
  }

  // Place pawns on second row
  for (let col = 0; col < cols; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[rows - 2][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
};

const initializeMallettChess = (board: (Piece | null)[][], boardSize: BoardSize): void => {
  const { rows, cols } = getBoardDimensions(boardSize);
  const whitePieces: PieceType[] = ['rook', 'knight', 'queen', 'king', 'knight', 'rook'];
  const blackPieces: PieceType[] = ['rook', 'bishop', 'queen', 'king', 'bishop', 'rook'];

  // Place pieces on first row
  for (let col = 0; col < cols; col++) {
    board[0][col] = { type: blackPieces[col], color: 'black', hasMoved: false };
    board[rows - 1][col] = { type: whitePieces[col], color: 'white', hasMoved: false };
  }

  // Place pawns on second row
  for (let col = 0; col < cols; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[rows - 2][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
};

export const initializeBoard = (boardSize: BoardSize = '6x6', gameVariant: GameVariant = 'Pawns Chess'): (Piece | null)[][] => {
  const { rows, cols } = getBoardDimensions(boardSize);
  const board: (Piece | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

  switch (gameVariant) {
    case 'Pawns Chess':
      initializePawnsChess(board, boardSize);
      break;
    case 'Diana Chess':
      initializeDianaChess(board, boardSize);
      break;
    case 'Los Alamos Chess':
      initializeLosAlamosChess(board, boardSize);
      break;
    case 'Mallett Chess':
      initializeMallettChess(board, boardSize);
      break;
    default:
      initializePawnsChess(board, boardSize);
  }

  return board;
};

const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const isSquareUnderAttack = (position: Position, gameState: GameState, defendingColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color !== defendingColor) {
        // Skip king moves to avoid circular dependency
        if (piece.type === 'king') {
          // Check adjacent squares for king attacks
          for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
              if (rowOffset === 0 && colOffset === 0) continue;
              const newRow = row + rowOffset;
              const newCol = col + colOffset;
              if (newRow === position.row && newCol === position.col) {
                return true;
              }
            }
          }
        } else {
          // Direct attack checks for each piece type
          switch (piece.type) {
            case 'pawn':
              const direction = piece.color === 'white' ? -1 : 1;
              if (row + direction === position.row && 
                  (col - 1 === position.col || col + 1 === position.col)) {
                return true;
              }
              break;
            case 'knight':
              const knightMoves = [
                { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
                { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
                { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
                { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 }
              ];
              if (knightMoves.some(move => 
                move.row === position.row && move.col === position.col)) {
                return true;
              }
              break;
            case 'bishop':
              // Check if the target square is on the same diagonal
              if (Math.abs(row - position.row) === Math.abs(col - position.col)) {
                // For adjacent squares, no need to check for pieces in between
                if (Math.abs(row - position.row) === 1) {
                  return true;
                }
                
                // For non-adjacent squares, check if there are any pieces in between
                const rowDir = position.row > row ? 1 : -1;
                const colDir = position.col > col ? 1 : -1;
                let currentRow = row + rowDir;
                let currentCol = col + colDir;
                
                while (currentRow !== position.row && currentCol !== position.col) {
                  if (gameState.board[currentRow][currentCol]) {
                    return false;
                  }
                  currentRow += rowDir;
                  currentCol += colDir;
                }
                return true;
              }
              break;
            case 'queen':
              // Check diagonal moves (like bishop)
              if (Math.abs(row - position.row) === Math.abs(col - position.col)) {
                // For adjacent squares, no need to check for pieces in between
                if (Math.abs(row - position.row) === 1) {
                  return true;
                }
                
                const rowDir = position.row > row ? 1 : -1;
                const colDir = position.col > col ? 1 : -1;
                let currentRow = row + rowDir;
                let currentCol = col + colDir;
                
                while (currentRow !== position.row && currentCol !== position.col) {
                  if (gameState.board[currentRow][currentCol]) {
                    return false;
                  }
                  currentRow += rowDir;
                  currentCol += colDir;
                }
                return true;
              }
              // Check straight moves (like rook)
              if (row === position.row || col === position.col) {
                // For adjacent squares, no need to check for pieces in between
                if (Math.abs(row - position.row) === 1 || Math.abs(col - position.col) === 1) {
                  return true;
                }
                
                const rowDir = position.row > row ? 1 : position.row < row ? -1 : 0;
                const colDir = position.col > col ? 1 : position.col < col ? -1 : 0;
                let currentRow = row + rowDir;
                let currentCol = col + colDir;
                
                // Check all squares between the rook and the target square
                while (currentRow !== position.row || currentCol !== position.col) {
                  if (gameState.board[currentRow][currentCol]) {
                    return false;
                  }
                  currentRow += rowDir;
                  currentCol += colDir;
                }
                return true;
              }
              break;
            case 'rook':
              // Check if the target square is on the same row or column
              if (row === position.row || col === position.col) {
                // For adjacent squares, no need to check for pieces in between
                if (Math.abs(row - position.row) === 1 || Math.abs(col - position.col) === 1) {
                  return true;
                }
                
                // Determine the direction of movement
                const rowDir = position.row > row ? 1 : position.row < row ? -1 : 0;
                const colDir = position.col > col ? 1 : position.col < col ? -1 : 0;
                let currentRow = row + rowDir;
                let currentCol = col + colDir;
                
                // Check all squares between the rook and the target square
                while (currentRow !== position.row || currentCol !== position.col) {
                  if (gameState.board[currentRow][currentCol]) {
                    return false;
                  }
                  currentRow += rowDir;
                  currentCol += colDir;
                }
                return true;
              }
              break;
          }
        }
      }
    }
  }
  return false;
};

export const isKingInCheck = (gameState: GameState): boolean => {
  // Find the king's position
  let kingPosition: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.type === 'king' && piece.color === gameState.currentTurn) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }

  if (!kingPosition) {
    console.error('King not found for current player');
    return false;
  }

  // Check if the king's square is under attack by any opponent's piece
  return isSquareUnderAttack(kingPosition, gameState, gameState.currentTurn);
};

export const isCheckmate = (gameState: GameState): boolean => {
  if (!isKingInCheck(gameState)) return false;

  // Try all possible moves for all pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        const moves = calculateValidMoves({ row, col }, gameState);
        for (const move of moves) {
          // Create a temporary board state to check if the move gets out of check
          const tempBoard = gameState.board.map(row => [...row]);
          tempBoard[move.row][move.col] = tempBoard[row][col];
          tempBoard[row][col] = null;
          
          const tempGameState: GameState = {
            ...gameState,
            board: tempBoard,
            currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white' as PieceColor,
            selectedPiece: null,
            validMoves: [],
            isCheck: false,
            isCheckmate: false,
            isStalemate: false
          };
          
          if (!isKingInCheck(tempGameState)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

export const isStalemate = (gameState: GameState): boolean => {
  if (isKingInCheck(gameState)) return false;

  // Check if any legal moves exist
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        const moves = calculateValidMoves({ row, col }, gameState);
        for (const move of moves) {
          // Create a temporary board state to check if the move is legal
          const tempBoard = gameState.board.map(row => [...row]);
          tempBoard[move.row][move.col] = tempBoard[row][col];
          tempBoard[row][col] = null;
          
          const tempGameState: GameState = {
            ...gameState,
            board: tempBoard,
            currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white' as PieceColor,
            selectedPiece: null,
            validMoves: [],
            isCheck: false,
            isCheckmate: false,
            isStalemate: false
          };
          
          if (!isKingInCheck(tempGameState)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

export const calculateValidMoves = (position: Position, gameState: GameState): Position[] => {
  const piece = gameState.board[position.row][position.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { row, col } = position;

  switch (piece.type) {
    case 'pawn':
      calculatePawnMoves(position, gameState, moves);
      break;
    case 'knight':
      calculateKnightMoves(position, gameState, moves);
      break;
    case 'bishop':
      calculateBishopMoves(position, gameState, moves);
      break;
    case 'rook':
      calculateRookMoves(position, gameState, moves);
      break;
    case 'queen':
      calculateQueenMoves(position, gameState, moves);
      break;
    case 'king':
      calculateKingMoves(position, gameState, moves);
      break;
  }

  // If in check, filter moves to only those that get out of check
  if (gameState.isCheck) {
    return moves.filter(move => {
      const tempBoard = gameState.board.map(row => [...row]);
      tempBoard[move.row][move.col] = tempBoard[position.row][position.col];
      tempBoard[position.row][position.col] = null;
      
      const tempGameState: GameState = {
        ...gameState,
        board: tempBoard,
        currentTurn: gameState.currentTurn,
        selectedPiece: null,
        validMoves: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false
      };
      
      return !isKingInCheck(tempGameState);
    });
  }

  return moves;
};

const calculatePawnMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward move
  if (isValidPosition(row + direction, col) && !gameState.board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    // Double move from starting position
    if (row === startRow && !gameState.board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // Captures
  for (const captureCol of [col - 1, col + 1]) {
    if (isValidPosition(row + direction, captureCol)) {
      const targetPiece = gameState.board[row + direction][captureCol];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({ row: row + direction, col: captureCol });
      }
    }
  }
};

const calculateKnightMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const knightMoves = [
    { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
    { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
    { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
    { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 }
  ];

  for (const move of knightMoves) {
    if (isValidPosition(move.row, move.col)) {
      const targetPiece = gameState.board[move.row][move.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        // Create a temporary board state to check if the move would put or leave our king in check
        const tempBoard = gameState.board.map(row => [...row]);
        tempBoard[move.row][move.col] = tempBoard[position.row][position.col];
        tempBoard[position.row][position.col] = null;
        
        const tempGameState: GameState = {
          ...gameState,
          board: tempBoard,
          currentTurn: gameState.currentTurn,
          selectedPiece: null,
          validMoves: [],
          isCheck: false,
          isCheckmate: false,
          isStalemate: false
        };
        
        // Only prevent moves that would put or leave our own king in check
        if (!isKingInCheck(tempGameState)) {
          moves.push(move);
        }
      }
    }
  }
};

const calculateBishopMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];

  for (const direction of directions) {
    let currentRow = row + direction.row;
    let currentCol = col + direction.col;

    while (isValidPosition(currentRow, currentCol)) {
      const targetPiece = gameState.board[currentRow][currentCol];
      if (!targetPiece) {
        moves.push({ row: currentRow, col: currentCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: currentRow, col: currentCol });
        }
        break;
      }
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
};

const calculateRookMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const directions = [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ];

  for (const direction of directions) {
    let currentRow = row + direction.row;
    let currentCol = col + direction.col;

    while (isValidPosition(currentRow, currentCol)) {
      const targetPiece = gameState.board[currentRow][currentCol];
      if (!targetPiece) {
        moves.push({ row: currentRow, col: currentCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: currentRow, col: currentCol });
        }
        break;
      }
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
};

const calculateQueenMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  calculateBishopMoves(position, gameState, moves);
  calculateRookMoves(position, gameState, moves);
};

const calculateKingMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      if (rowOffset === 0 && colOffset === 0) continue;

      const newRow = row + rowOffset;
      const newCol = col + colOffset;

      if (isValidPosition(newRow, newCol)) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== piece.color) {
          // Create a temporary board state to check if the move is safe
          const tempBoard = gameState.board.map(row => [...row]);
          tempBoard[newRow][newCol] = tempBoard[position.row][position.col];
          tempBoard[position.row][position.col] = null;
          
          const tempGameState: GameState = {
            ...gameState,
            board: tempBoard,
            currentTurn: gameState.currentTurn,
            selectedPiece: null,
            validMoves: [],
            isCheck: false,
            isCheckmate: false,
            isStalemate: false
          };
          
          // Check if the destination square is under attack by opponent's pieces
          const isSquareAttacked = isSquareUnderAttack({ row: newRow, col: newCol }, tempGameState, piece.color);
          
          // Only allow the move if the square is not under attack
          if (!isSquareAttacked) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  }

  // Add castling moves if applicable
  if (!piece.hasMoved) {
    // Kingside castling
    if (canCastle(position, gameState, true)) {
      moves.push({ row, col: col + 2 });
    }
    // Queenside castling
    if (canCastle(position, gameState, false)) {
      moves.push({ row, col: col - 2 });
    }
  }
};

const canCastle = (position: Position, gameState: GameState, isKingside: boolean): boolean => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const rookCol = isKingside ? 7 : 0;
  const rook = gameState.board[row][rookCol];

  // Rule 1: King and rook must not have moved
  if (!rook || rook.type !== 'rook' || rook.hasMoved || rook.color !== piece.color || piece.hasMoved) {
    return false;
  }

  // Rule 2: King cannot be in check
  if (isKingInCheck(gameState)) {
    return false;
  }

  const direction = isKingside ? 1 : -1;
  const endCol = isKingside ? 6 : 2;

  // Rule 3: No pieces between king and rook
  for (let c = col + direction; c !== rookCol; c += direction) {
    if (gameState.board[row][c]) {
      return false;
    }
  }

  // Rule 4: King cannot move through check
  // Check the squares the king will move through and the destination square
  for (let c = col; c !== endCol + direction; c += direction) {
    if (isSquareUnderAttack({ row, col: c }, gameState, piece.color)) {
      return false;
    }
  }

  return true;
};

export const makeMove = (gameState: GameState, from: Position, to: Position): GameState => {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col]!;
  
  // Handle castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const isKingside = to.col > from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? to.col - 1 : to.col + 1;
    
    // Move rook
    newBoard[to.row][rookToCol] = newBoard[to.row][rookFromCol];
    newBoard[to.row][rookFromCol] = null;
  }

  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: 'queen', color: piece.color, hasMoved: true };
  } else {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  }
  newBoard[from.row][from.col] = null;

  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
    selectedPiece: null,
    validMoves: [],
  };

  // Check for check and checkmate
  const isCheck = isKingInCheck(newGameState);
  const checkmateStatus = isCheck && isCheckmate(newGameState);
  const stalemateStatus = !isCheck && isStalemate(newGameState);

  return {
    ...newGameState,
    isCheck,
    isCheckmate: checkmateStatus,
    isStalemate: stalemateStatus,
  };
};

export const evaluatePosition = (gameState: GameState): number => {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        score += piece.color === 'white' ? value : -value;
      }
    }
  }
  return score;
}; 