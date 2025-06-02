'use client'

import React from 'react'
import { ArrowUpIcon, ArrowDownIcon, AlertCircleIcon } from 'lucide-react'

export type StatusType = 'success' | 'error' | 'warning'

export interface ActivityItem {
  id: number
  title: string
  description: string
  time: string
  status: StatusType
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return <ArrowUpIcon size={16} className="text-green-500" />
      case 'error':
        return <ArrowDownIcon size={16} className="text-red-500" />
      case 'warning':
        return <AlertCircleIcon size={16} className="text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Hoạt động gần đây
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="mr-3 mt-0.5">
              <div className="p-1.5 rounded-full bg-gray-100">
                {getStatusIcon(activity.status)}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Xem tất cả hoạt động
        </a>
      </div>
    </div>
  )
}
