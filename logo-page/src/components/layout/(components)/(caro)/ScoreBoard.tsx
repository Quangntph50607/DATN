'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
  scores: { X: number; O: number };
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Bảng điểm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-semibold">Người chơi X</span>
            </div>
            <Badge variant="outline" className="text-lg font-bold text-gray-700 hover:text-gray-900">{scores.X}</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="font-semibold">Người chơi O</span>
            </div>
            <Badge variant="outline" className="text-lg font-bold text-gray-700 hover:text-gray-900">{scores.O}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreBoard;
