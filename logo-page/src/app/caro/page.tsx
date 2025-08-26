'use client';

import React, { useState, useEffect } from 'react';
import {
  GameBoard,
  GameStatus,
  ScoreBoard,
  GameControls,
  GameStats,
  GameHeader,
  TutorialModal,
  GameModeSelection,
  DifficultySelection
} from '@/components/layout/(components)/(caro)';

interface Cell {
  value: 'X' | 'O' | null;
  isWinning: boolean;
  isLastMove: boolean;
}

interface GameState {
  board: Cell[][];
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | 'DRAW' | null;
  gameOver: boolean;
  moveCount: number;
  gameTime: number;
  isPaused: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = '2player' | 'ai';

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

const CaroGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({ value: null, isWinning: false, isLastMove: false }))
    ),
    currentPlayer: 'X',
    winner: null,
    gameOver: false,
    moveCount: 0,
    gameTime: 0,
    isPaused: false,
  });

  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('2player');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!gameState.gameOver && !gameState.isPaused && gameStarted) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          gameTime: prev.gameTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.gameOver, gameState.isPaused, gameStarted]);

  // Initialize board
  const initializeBoard = (): Cell[][] => {
    return Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({ value: null, isWinning: false, isLastMove: false }))
    );
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if there's a winner
  const checkWinner = (board: Cell[][], row: number, col: number, player: 'X' | 'O'): boolean => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const winningCells: [number, number][] = [[row, col]];

      // Check in positive direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          board[newRow][newCol].value === player
        ) {
          count++;
          winningCells.push([newRow, newCol]);
        } else {
          break;
        }
      }

      // Check in negative direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          board[newRow][newCol].value === player
        ) {
          count++;
          winningCells.push([newRow, newCol]);
        } else {
          break;
        }
      }

      if (count >= WIN_LENGTH) {
        // Mark winning cells
        winningCells.forEach(([r, c]) => {
          board[r][c].isWinning = true;
        });
        return true;
      }
    }

    return false;
  };

  // Evaluate position for AI
  const evaluatePosition = (board: Cell[][], player: 'X' | 'O'): number => {
    let score = 0;
    const opponent = player === 'X' ? 'O' : 'X';

    // Check all possible lines
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].value === player) {
          // Check horizontal
          let count = 1;
          let blocked = 0;
          for (let i = 1; i < WIN_LENGTH && col + i < BOARD_SIZE; i++) {
            if (board[row][col + i].value === player) count++;
            else if (board[row][col + i].value === opponent) { blocked++; break; }
            else break;
          }
          for (let i = 1; i < WIN_LENGTH && col - i >= 0; i++) {
            if (board[row][col - i].value === player) count++;
            else if (board[row][col - i].value === opponent) { blocked++; break; }
            else break;
          }
          score += Math.pow(10, count) * (2 - blocked);

          // Check vertical
          count = 1;
          blocked = 0;
          for (let i = 1; i < WIN_LENGTH && row + i < BOARD_SIZE; i++) {
            if (board[row + i][col].value === player) count++;
            else if (board[row + i][col].value === opponent) { blocked++; break; }
            else break;
          }
          for (let i = 1; i < WIN_LENGTH && row - i >= 0; i++) {
            if (board[row - i][col].value === player) count++;
            else if (board[row - i][col].value === opponent) { blocked++; break; }
            else break;
          }
          score += Math.pow(10, count) * (2 - blocked);

          // Check diagonal down-right
          count = 1;
          blocked = 0;
          for (let i = 1; i < WIN_LENGTH && row + i < BOARD_SIZE && col + i < BOARD_SIZE; i++) {
            if (board[row + i][col + i].value === player) count++;
            else if (board[row + i][col + i].value === opponent) { blocked++; break; }
            else break;
          }
          for (let i = 1; i < WIN_LENGTH && row - i >= 0 && col - i >= 0; i++) {
            if (board[row - i][col - i].value === player) count++;
            else if (board[row - i][col - i].value === opponent) { blocked++; break; }
            else break;
          }
          score += Math.pow(10, count) * (2 - blocked);

          // Check diagonal down-left
          count = 1;
          blocked = 0;
          for (let i = 1; i < WIN_LENGTH && row + i < BOARD_SIZE && col - i >= 0; i++) {
            if (board[row + i][col - i].value === player) count++;
            else if (board[row + i][col - i].value === opponent) { blocked++; break; }
            else break;
          }
          for (let i = 1; i < WIN_LENGTH && row - i >= 0 && col + i < BOARD_SIZE; i++) {
            if (board[row - i][col + i].value === player) count++;
            else if (board[row - i][col + i].value === opponent) { blocked++; break; }
            else break;
          }
          score += Math.pow(10, count) * (2 - blocked);
        }
      }
    }

    return score;
  };

  // AI move with different difficulty levels
  const makeAIMove = (board: Cell[][], difficulty: Difficulty): [number, number] | null => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j].value === null) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    console.log('Empty cells found:', emptyCells.length);
    if (emptyCells.length === 0) return null;

    switch (difficulty) {
      case 'easy':
        // Random move with 70% chance, simple evaluation with 30% chance
        if (Math.random() < 0.7) {
          return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        // Simple evaluation
        let bestScore = -Infinity;
        let bestMove = emptyCells[0];
        for (const [row, col] of emptyCells) {
          const testBoard = board.map(row => row.map(cell => ({ ...cell })));
          testBoard[row][col] = { value: 'O', isWinning: false, isLastMove: false };
          const score = evaluatePosition(testBoard, 'O');
          if (score > bestScore) {
            bestScore = score;
            bestMove = [row, col];
          }
        }
        return bestMove;

      case 'medium':
        // Mix of random and evaluation
        if (Math.random() < 0.4) {
          return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        // Better evaluation
        let bestScoreMedium = -Infinity;
        let bestMoveMedium = emptyCells[0];
        for (const [row, col] of emptyCells) {
          const testBoard = board.map(row => row.map(cell => ({ ...cell })));
          testBoard[row][col] = { value: 'O', isWinning: false, isLastMove: false };
          const score = evaluatePosition(testBoard, 'O') - evaluatePosition(testBoard, 'X') * 0.8;
          if (score > bestScoreMedium) {
            bestScoreMedium = score;
            bestMoveMedium = [row, col];
          }
        }
        return bestMoveMedium;

      case 'hard':
        // Advanced evaluation with blocking
        let bestScoreHard = -Infinity;
        let bestMoveHard = emptyCells[0];
        for (const [row, col] of emptyCells) {
          const testBoard = board.map(row => row.map(cell => ({ ...cell })));
          testBoard[row][col] = { value: 'O', isWinning: false, isLastMove: false };
          
          // Check if this move wins
          if (checkWinner(testBoard, row, col, 'O')) {
            return [row, col];
          }
          
          // Check if this move blocks opponent's win
          testBoard[row][col] = { value: 'X', isWinning: false, isLastMove: false };
          if (checkWinner(testBoard, row, col, 'X')) {
            testBoard[row][col] = { value: 'O', isWinning: false, isLastMove: false };
            return [row, col];
          }
          
          testBoard[row][col] = { value: 'O', isWinning: false, isLastMove: false };
          const score = evaluatePosition(testBoard, 'O') - evaluatePosition(testBoard, 'X') * 0.9;
          if (score > bestScoreHard) {
            bestScoreHard = score;
            bestMoveHard = [row, col];
          }
        }
        return bestMoveHard;

      default:
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.board[row][col].value !== null || !gameStarted) {
      return;
    }

    const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell, isLastMove: false })));
    newBoard[row][col] = { value: gameState.currentPlayer, isWinning: false, isLastMove: true };

    const isWinner = checkWinner(newBoard, row, col, gameState.currentPlayer);
    const isDraw = gameState.moveCount + 1 === BOARD_SIZE * BOARD_SIZE;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      winner: isWinner ? prev.currentPlayer : isDraw ? 'DRAW' : null,
      gameOver: isWinner || isDraw,
      moveCount: prev.moveCount + 1,
    }));

    // Update scores if there's a winner
    if (isWinner) {
      setScores(prev => ({
        ...prev,
        [gameState.currentPlayer]: prev[gameState.currentPlayer] + 1
      }));
    }

    // AI move if in AI mode and game not over
    if (gameMode === 'ai' && !isWinner && !isDraw) {
      console.log('AI turn - Difficulty:', difficulty, 'Game mode:', gameMode);
      setAiThinking(true);
      setTimeout(() => {
        const aiMove = makeAIMove(newBoard, difficulty);
        console.log('AI move result:', aiMove);
        if (aiMove) {
          const [aiRow, aiCol] = aiMove;
          const aiBoard = newBoard.map(row => row.map(cell => ({ ...cell, isLastMove: false })));
          aiBoard[aiRow][aiCol] = { value: 'O', isWinning: false, isLastMove: true };

          const aiWinner = checkWinner(aiBoard, aiRow, aiCol, 'O');
          const aiDraw = gameState.moveCount + 2 === BOARD_SIZE * BOARD_SIZE;

          setGameState(prev => ({
            ...prev,
            board: aiBoard,
            currentPlayer: 'X',
            winner: aiWinner ? 'O' : aiDraw ? 'DRAW' : null,
            gameOver: aiWinner || aiDraw,
            moveCount: prev.moveCount + 2,
          }));

          if (aiWinner) {
            setScores(prev => ({
              ...prev,
              O: prev.O + 1
            }));
          }
        }
        setAiThinking(false);
      }, difficulty === 'easy' ? 300 : difficulty === 'medium' ? 500 : 800);
    }
  };

  // Start game
  const startGame = () => {
    console.log('Starting game with mode:', gameMode, 'difficulty:', difficulty);
    setGameStarted(true);
    setShowDifficultySelect(false);
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'X',
      winner: null,
      gameOver: false,
      moveCount: 0,
      gameTime: 0,
      isPaused: false,
    });
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'X',
      winner: null,
      gameOver: false,
      moveCount: 0,
      gameTime: 0,
      isPaused: false,
    });
    setGameStarted(false);
  };

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0 });
  };

  // Toggle pause
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  // Get difficulty info
  const getDifficultyInfo = (level: Difficulty) => {
    switch (level) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
    }
  };

  // Handle game mode selection
  const handleModeSelection = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === '2player') {
                     setGameStarted(true);
    } else {
                       setShowDifficultySelect(true);
    }
  };

  // Handle difficulty selection
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  // Handle back from difficulty selection
  const handleBackFromDifficulty = () => {
    setShowDifficultySelect(false);
  };

  // Debug AI function
  const debugAI = () => {
                            console.log('Current game state:', {
                              gameMode,
                              difficulty,
                              gameStarted,
                              currentPlayer: gameState.currentPlayer,
                              moveCount: gameState.moveCount
                            });
  };

  // Difficulty selection screen
  if (showDifficultySelect) {
    return (
      <DifficultySelection
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        onBack={handleBackFromDifficulty}
        onStartGame={startGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <GameHeader
        onToggleTutorial={() => setShowTutorial(!showTutorial)}
        onTogglePause={togglePause}
        isPaused={gameState.isPaused}
        gameOver={gameState.gameOver}
        gameStarted={gameStarted}
      />

      <div className="max-w-7xl mx-auto p-4">
        <TutorialModal
          showTutorial={showTutorial}
          onClose={() => setShowTutorial(false)}
        />

        {!gameStarted ? (
          <GameModeSelection onSelectMode={handleModeSelection} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GameBoard
                board={gameState.board}
                currentPlayer={gameState.currentPlayer}
                gameTime={gameState.gameTime}
                gameOver={gameState.gameOver}
                isPaused={gameState.isPaused}
                aiThinking={aiThinking}
                gameMode={gameMode}
                difficulty={getDifficultyInfo(difficulty)}
                onCellClick={handleCellClick}
                formatTime={formatTime}
              />
                  </div>

            <div className="space-y-6">
              <GameStatus
                winner={gameState.winner}
                isPaused={gameState.isPaused}
                aiThinking={aiThinking}
                moveCount={gameState.moveCount}
              />

              <ScoreBoard scores={scores} />

              <GameControls
                onResetGame={resetGame}
                onResetScores={resetScores}
                gameMode={gameMode}
                onDebugAI={debugAI}
              />

              <GameStats
                gameTime={gameState.gameTime}
                moveCount={gameState.moveCount}
                gameMode={gameMode}
                difficulty={getDifficultyInfo(difficulty)}
                formatTime={formatTime}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaroGame;
