'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface GameControlsProps {
  onResetGame: () => void;
  onResetScores: () => void;
  gameMode?: '2player' | 'ai';
  onDebugAI?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onResetGame,
  onResetScores
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-green-500" />
          Điều khiển
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={onResetGame} 
            className="w-full border-2 bg-orange-400 text-white hover:bg-orange-500 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Chơi lại
          </Button>
          <Button 
            onClick={onResetScores} 
            className="w-full shadow-lg hover:shadow-xl transition-all duration-300 bg-red-500 text-white hover:bg-red-600"
          >
            Reset điểm số
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameControls;
