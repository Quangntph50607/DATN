'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Brain, Zap, Target } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectionProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onBack: () => void;
  onStartGame: () => void;
}

const DifficultySelection: React.FC<DifficultySelectionProps> = ({
  difficulty,
  onDifficultyChange,
  onBack,
  onStartGame
}) => {
  const getDifficultyInfo = (level: Difficulty) => {
    switch (level) {
      case 'easy':
        return {
          name: 'Dễ',
          description: 'AI đơn giản, phù hợp cho người mới chơi',
          icon: Brain,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300'
        };
      case 'medium':
        return {
          name: 'Trung bình',
          description: 'AI cân bằng, thử thách vừa phải',
          icon: Zap,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300'
        };
      case 'hard':
        return {
          name: 'Khó',
          description: 'AI thông minh, thử thách cao',
          icon: Target,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300'
        };
    }
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-xl border-0 text-gray-700 hover:text-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <Gamepad2 className="w-8 h-8 text-purple-500" />
            Chọn cấp độ AI
          </CardTitle>
          <p className="text-gray-600 mt-2">Chọn mức độ khó phù hợp với khả năng của bạn</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficulties.map((level) => {
              const info = getDifficultyInfo(level);
              const Icon = info.icon;
              const isSelected = difficulty === level;
              
              return (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(level)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300 text-left shadow-lg hover:shadow-xl
                    ${isSelected 
                      ? `${info.borderColor} ${info.bgColor} scale-105 shadow-xl` 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${info.bgColor}`}>
                      <Icon className={`w-6 h-6 ${info.color}`} />
                    </div>
                    <h3 className={`font-bold text-lg ${info.color}`}>{info.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{info.description}</p>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Đã chọn</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 border-2 border-gray-400 hover:border-gray-600 text-gray-700 hover:text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Quay lại
            </Button>
            <Button
              onClick={onStartGame}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold border-2 border-purple-600 shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-600/50 transition-all duration-300"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Bắt đầu chơi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DifficultySelection;
