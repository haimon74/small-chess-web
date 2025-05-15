import React, { useState, useEffect } from 'react';
import { GameState, GameSettings as GameSettingsType, Position, PieceColor } from '../types/chess';
import ChessBoard from './ChessBoard';
import GameSettings from './GameSettings';
import { initializeBoard, makeMove, calculateValidMoves } from '../utils/chessLogic';
import { calculateComputerMove } from '../utils/chessAI';
import styles from './ChessGame.module.css';

const PROMOTION_PIECES = ['queen', 'rook', 'bishop', 'knight'] as const;
type PromotionPiece = typeof PROMOTION_PIECES[number];

const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [promotion, setPromotion] = useState<{
    from: Position;
    to: Position;
    color: PieceColor;
  } | null>(null);
  const [settings, setSettings] = useState<GameSettingsType>({
    playerColor: 'white',
    computerLevel: 2,
    boardTheme: 'green',
    boardSize: '6x6',
    gameVariant: 'Pawns Chess',
  });

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && promotion) {
        setPromotion(null);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [promotion]);

  const startNewGame = (newSettings: GameSettingsType) => {
    setSettings(newSettings);
    setShowSettings(false);
    const initialBoard = initializeBoard(newSettings.boardSize, newSettings.gameVariant);
    const initialState: GameState = {
      board: initialBoard,
      currentTurn: 'white' as PieceColor,
      selectedPiece: null,
      validMoves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      computerLevel: newSettings.computerLevel,
      playerColor: newSettings.playerColor,
      boardTheme: newSettings.boardTheme,
      boardSize: newSettings.boardSize,
      gameVariant: newSettings.gameVariant,
    };
    setGameState(initialState);
    setMoveHistory([initialState]);
  };

  const handleRevert = () => {
    if (!gameState || gameState.currentTurn !== settings.playerColor) return;
    if (moveHistory.length < 3) return;
    const newHistory = moveHistory.slice(0, -2);
    setMoveHistory(newHistory);
    setGameState(newHistory[newHistory.length - 1]);
  };

  const handlePieceClick = (position: Position) => {
    if (!gameState) return;
    const piece = gameState.board[position.row][position.col];
    if (!piece || piece.color !== gameState.currentTurn) return;
    const validMoves = calculateValidMoves(position, gameState);
    setGameState({
      ...gameState,
      selectedPiece: position,
      validMoves,
    });
  };

  const handlePromotion = (pieceType: PromotionPiece) => {
    if (!promotion || !gameState) return;
    const newGameState = makeMove(gameState, promotion.from, promotion.to, pieceType);
    setGameState(newGameState);
    setMoveHistory(prev => [...prev, newGameState]);
    setPromotion(null);
    if (newGameState.currentTurn !== settings.playerColor && !newGameState.isCheckmate) {
      setIsComputerThinking(true);
      setTimeout(() => {
        const computerMove = calculateComputerMove(newGameState);
        if (computerMove) {
          const updatedGameState = makeMove(newGameState, computerMove.from, computerMove.to);
          setGameState(updatedGameState);
          setMoveHistory(prev => [...prev, updatedGameState]);
        } else if (newGameState.isCheck) {
          setGameState({
            ...newGameState,
            isCheckmate: true
          });
        }
        setIsComputerThinking(false);
      }, 500);
    }
  };

  const handleSquareClick = (position: Position) => {
    if (!gameState || !gameState.selectedPiece) return;
    const isValid = gameState.validMoves.some(
      move => move.row === position.row && move.col === position.col
    );
    if (isValid) {
      const piece = gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col];
      if (
        piece?.type === 'pawn' &&
        (position.row === 0 || position.row === gameState.board.length - 1)
      ) {
        setPromotion({
          from: gameState.selectedPiece,
          to: position,
          color: piece.color,
        });
        return;
      }
      const newGameState = makeMove(gameState, gameState.selectedPiece, position);
      setGameState(newGameState);
      setMoveHistory(prev => [...prev, newGameState]);
      if (newGameState.currentTurn !== settings.playerColor && !newGameState.isCheckmate) {
        setIsComputerThinking(true);
        setTimeout(() => {
          const computerMove = calculateComputerMove(newGameState);
          if (computerMove) {
            const updatedGameState = makeMove(newGameState, computerMove.from, computerMove.to);
            setGameState(updatedGameState);
            setMoveHistory(prev => [...prev, updatedGameState]);
          } else if (newGameState.isCheck) {
            setGameState({
              ...newGameState,
              isCheckmate: true
            });
          }
          setIsComputerThinking(false);
        }, 500);
      }
    }
  };

  if (!gameState) {
    return <GameSettings onStart={startNewGame} />;
  }

  return (
    <div className={styles.chessGame}>
      <div className={styles.gameInfo}>
        <div className={styles.turnInfo}>
          <button className={styles.button} onClick={() => setShowSettings(true)}>New Game</button>
          <button 
            onClick={handleRevert}
            disabled={gameState.currentTurn !== settings.playerColor || moveHistory.length < 3}
            className={`${styles.button} ${styles.revertButton}`}
            title="Undo Move"
          >
            <b>&#8630;</b>
          </button>
          <div className={styles.turnLabel}>
            <span>Current Turn: {gameState.currentTurn}</span>
            <div className={`${styles.spinner} ${isComputerThinking ? styles.visible : ''}`}></div>
          </div>
        </div>
        {gameState.isCheckmate && <p className={styles.checkmate}>Checkmate!</p>}
        {gameState.isStalemate && <p className={styles.stalemate}>Stalemate!</p>}
      </div>
      <div className={styles.boardContainer}>
        <ChessBoard
          board={gameState.board}
          selectedPiece={gameState.selectedPiece}
          validMoves={gameState.validMoves}
          onPieceClick={handlePieceClick}
          onSquareClick={handleSquareClick}
          theme={gameState.boardTheme}
          isCheck={gameState.isCheck}
          gameState={gameState}
        />
      </div>
      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <GameSettings onStart={startNewGame} />
          </div>
        </div>
      )}
      {promotion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setPromotion(null)}
              title="Close"
              aria-label="Close promotion modal"
            >
              ×
            </button>
            <h3>Choose Promotion</h3>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              {PROMOTION_PIECES.map((type) => {
                const colorForImage = promotion.color === 'white' ? 'light' : 'dark';
                return (
                  <button
                    key={type}
                    onClick={() => handlePromotion(type as PromotionPiece)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                  >
                    <img
                      src={`/assets/images/${colorForImage}_${type}.svg`}
                      alt={`${promotion.color} ${type}`}
                      style={{ width: 48, height: 48, display: 'block' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame; 