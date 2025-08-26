'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Sparkles } from 'lucide-react';

interface GameHeaderProps {
  onToggleTutorial: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  gameOver: boolean;
  gameStarted: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onToggleTutorial,
  onTogglePause,
  isPaused,
  gameOver,
  gameStarted
}) => {
  return (
    <div className="border-b top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Cờ Caro Online
              </h1>
              <p className="text-sm text-gray-600">Thư giãn với game cờ caro thú vị</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={onToggleTutorial}
              size="sm"
              className="shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 bg-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Hướng dẫn
            </Button>
            <Button
              onClick={onTogglePause}             
              size="sm"
              disabled={gameOver || !gameStarted}
              className="shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 bg-white"
            >
              {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
