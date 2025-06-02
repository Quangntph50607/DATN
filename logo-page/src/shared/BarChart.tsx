'use client'

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarChartProps {
  data: Array<{
    name: string
    value: number
  }>
  color?: string
  title: string
}

export const BarChart = ({
  data,
  color = '#3b82f6',
  title,
}: BarChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: '#6b7280',
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: '#6b7280',
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
