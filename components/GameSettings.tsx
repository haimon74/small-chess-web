import React, { useState } from 'react';
import { GameSettings as GameSettingsType, PieceColor, BoardTheme, BoardSize, GameVariant } from '../../types/chess';
import styles from './GameSettings.module.css';

interface GameSettingsProps {
  onStart: (settings: GameSettingsType) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ onStart }) => {
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [computerLevel, setComputerLevel] = useState<number>(2);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green');
  const [boardSize, setBoardSize] = useState<BoardSize>('6x6');
  const [gameVariant, setGameVariant] = useState<GameVariant>('Pawns Chess');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      playerColor,
      computerLevel,
      boardTheme,
      boardSize,
      gameVariant,
    });
  };

  return (
    <div className={styles.gameSettings}>
      <h2 className={styles.title}>Game Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.settingGroup}>
          <label>
            Choose Your Color:
            <select
              value={playerColor}
              onChange={(e) => setPlayerColor(e.target.value as PieceColor)}
            >
              <option value="white">White (First Move)</option>
              <option value="black">Black</option>
            </select>
          </label>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Board Size:
            <select
              value={boardSize}
              onChange={(e) => setBoardSize(e.target.value as BoardSize)}
            >
              <option value="6x6">6x6 (Default)</option>
              <option value="6x8">6x8</option>
            </select>
          </label>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Game Variant:
            <select
              value={gameVariant}
              onChange={(e) => setGameVariant(e.target.value as GameVariant)}
            >
              <option value="Pawns Chess">Pawns Chess (Default)</option>
              <option value="Diana Chess">Diana Chess</option>
              <option value="Los Alamos Chess">Los Alamos Chess</option>
              <option value="Mallett Chess">Mallett Chess</option>
            </select>
          </label>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Computer Level (1-3):
            <input
              type="range"
              min="1"
              max="3"
              value={computerLevel}
              onChange={(e) => setComputerLevel(parseInt(e.target.value))}
            />
            <span>{computerLevel}</span>
          </label>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Board Theme:
            <select
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value as BoardTheme)}
            >
              <option value="green">Nature</option>
              <option value="classic">Classic</option>
              <option value="brown">Wood</option>
              <option value="navy">Ocean</option>
            </select>
          </label>
        </div>

        <button type="submit" className={styles.startButton}>
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameSettings; 