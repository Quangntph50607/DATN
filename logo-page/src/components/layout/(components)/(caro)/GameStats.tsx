'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameStatsProps {
  gameTime: number;
  moveCount: number;
  gameMode: '2player' | 'ai';
  difficulty: string;
  formatTime: (seconds: number) => string;
}

const GameStats: React.FC<GameStatsProps> = ({
  gameTime,
  moveCount,
  gameMode,
  difficulty,
  formatTime
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
      <CardHeader>
        <CardTitle>Thống kê</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Thời gian chơi:</span>
            <span className="font-semibold">{formatTime(gameTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Số lượt đi:</span>
            <span className="font-semibold">{moveCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Chế độ:</span>
            <span className="font-semibold">
              {gameMode === '2player' ? '2 Người' : `VS AI (${difficulty})`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;
