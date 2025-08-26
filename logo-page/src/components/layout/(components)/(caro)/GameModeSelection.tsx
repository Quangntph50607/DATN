'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Crown } from 'lucide-react';

interface GameModeSelectionProps {
  onSelectMode: (mode: '2player' | 'ai') => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-black">
            <Crown className="w-6 h-6 text-purple-500" />
            Chọn chế độ chơi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => onSelectMode('2player')}
            className="w-full justify-start h-16 text-lg border-2 border-gray-400 hover:border-gray-600 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
            variant="outline"
          >
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">2 Người chơi</div>
              <div className="text-sm text-gray-600">Chơi với bạn bè</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onSelectMode('ai')}
            className="w-full justify-start h-16 text-lg border-2 border-gray-400 hover:border-gray-600 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
            variant="outline"
          >
            <Crown className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Chơi với AI</div>
              <div className="text-sm text-gray-600">Chọn cấp độ khó</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameModeSelection;
