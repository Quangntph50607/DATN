"use client";

import React, { ElementType } from 'react'; // Import ElementType
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: ElementType; // Kiểu cho component Icon
    color: string;      // Kiểu cho màu sắc (chuỗi class Tailwind)
    trend?: number;     // Trend là tùy chọn và là số
  }
  
  const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => {  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-effect rounded-xl p-6 border ${color} hover-glow transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-400 mt-1">
              +{trend}% từ tháng trước
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color.replace('border-', 'from-').replace('/20', '/20 to-').replace('/20', '/10')}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
