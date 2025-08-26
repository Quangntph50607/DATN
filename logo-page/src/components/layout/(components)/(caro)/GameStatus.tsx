'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface GameStatusProps {
  winner: 'X' | 'O' | 'DRAW' | null;
  isPaused: boolean;
  aiThinking: boolean;
  moveCount: number;
}

const GameStatus: React.FC<GameStatusProps> = ({
  winner,
  isPaused,
  aiThinking,
  moveCount
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Trạng thái game
        </CardTitle>
      </CardHeader>
      <CardContent>
        {winner ? (
          <div className="text-center">
            {winner === 'DRAW' ? (
              <div className="text-orange-600 font-semibold text-lg">🤝 Hòa!</div>
            ) : (
              <div className="text-green-600 font-semibold text-lg">
                🎉 Người chơi {winner} thắng!
              </div>
            )}
          </div>
        ) : isPaused ? (
          <div className="text-center">
            <div className="text-blue-600 font-semibold">⏸️ Đã tạm dừng</div>
          </div>
        ) : aiThinking ? (
          <div className="text-center">
            <div className="text-blue-600 font-semibold">🤖 AI đang suy nghĩ...</div>
            <div className="text-sm text-gray-500 mt-1">
              Vui lòng chờ một chút
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-600">🎮 Đang chơi...</div>
            <div className="text-sm text-gray-500 mt-1">
              Lượt đi: {moveCount + 1}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameStatus;
