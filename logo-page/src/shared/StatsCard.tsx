'use client'

import React, { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export const StatsCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  color = 'blue',
}: StatsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <span
                className={`text-xs font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {change}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                so với tháng trước
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
