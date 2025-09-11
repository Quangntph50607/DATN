'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Timer } from 'lucide-react';

interface Cell {
  value: 'X' | 'O' | null;
  isWinning: boolean;
  isLastMove: boolean;
}

interface GameBoardProps {
  board: Cell[][];
  currentPlayer: 'X' | 'O';
  gameTime: number;
  gameOver: boolean;
  isPaused: boolean;
  aiThinking: boolean;
  gameMode: '2player' | 'ai';
  difficulty: string;
  onCellClick: (row: number, col: number) => void;
  formatTime: (seconds: number) => string;
}

const BOARD_SIZE = 15;

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  gameTime,
  gameOver,
  isPaused,
  aiThinking,
  gameMode,
  difficulty,
  onCellClick,
  formatTime
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-500" />
            Bàn cờ {BOARD_SIZE}x{BOARD_SIZE}
            {gameMode === 'ai' && (
              <Badge variant="outline" className="ml-2">
                {difficulty}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
              <Timer className="w-3 h-3" />
              {formatTime(gameTime)}
            </Badge>
            <Badge variant={currentPlayer === 'X' ? 'default' : 'secondary'}>
              Lượt: {currentPlayer === 'X' ? 'X' : 'O'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-xl shadow-inner border border-amber-200">
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    disabled={gameOver || isPaused || aiThinking || cell.value !== null}
                    className={`
                      w-10 h-10 border-2 border-gray-400 flex items-center justify-center
                      text-lg font-bold transition-all duration-300 relative shadow-lg
                      ${cell.value === 'X' 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl border-red-700 shadow-red-500/50' 
                        : cell.value === 'O' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-blue-700 shadow-blue-500/50' 
                        : 'bg-white hover:bg-gray-50 hover:shadow-xl border-gray-500 hover:border-gray-600 shadow-gray-400/30 hover:shadow-gray-500/50'
                      }
                      ${cell.isWinning ? 'ring-4 ring-yellow-400 ring-offset-2 animate-pulse scale-110 shadow-yellow-400/50' : ''}
                      ${cell.isLastMove ? 'ring-2 ring-green-400 ring-offset-1 shadow-green-400/50' : ''}
                      ${gameOver || isPaused || aiThinking ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
                    `}
                  >
                    {cell.value}
                    {cell.isLastMove && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameBoard;
