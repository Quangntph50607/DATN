'use client'

import React from 'react'
import { UsersIcon, ShoppingCartIcon, CreditCardIcon, PackageIcon } from 'lucide-react'
import { StatsCard } from '@/shared/StatsCard'
import { ActivityItem, RecentActivity } from '@/shared/RecentActivity'
import { BarChart } from '@/shared/BarChart'
import { PieChart } from '@/shared/PieChart'
import { AreaChart } from '@/shared/AreaChart'


const salesData = [
  { name: 'T1', value: 3200 },
  { name: 'T2', value: 4500 },
  { name: 'T3', value: 5800 },
  { name: 'T4', value: 4900 },
  { name: 'T5', value: 6200 },
  { name: 'T6', value: 7100 },
  { name: 'T7', value: 8500 },
  { name: 'T8', value: 7800 },
  { name: 'T9', value: 8900 },
  { name: 'T10', value: 9500 },
  { name: 'T11', value: 11000 },
  { name: 'T12', value: 12500 },
]

const topSellingData = [
  { name: 'LEGO City', value: 4500 },
  { name: 'LEGO Star Wars', value: 3800 },
  { name: 'LEGO Technic', value: 3200 },
  { name: 'LEGO Friends', value: 2900 },
  { name: 'LEGO Duplo', value: 2500 },
  { name: 'LEGO Ninjago', value: 2100 },
  { name: 'LEGO Marvel', value: 1800 },
]

const ageGroupData = [
  { name: '3-6 tuổi', value: 350 },
  { name: '7-12 tuổi', value: 480 },
  { name: '13-18 tuổi', value: 280 },
  { name: 'Trên 18 tuổi', value: 390 },
  { name: 'Người sưu tầm', value: 200 },
]

const recentActivities: ActivityItem[] = [
  {
    id: 1,
    title: 'Đơn hàng mới #L8734',
    description: 'Khách hàng Nguyễn Văn A đã mua bộ LEGO Star Wars #75192',
    time: '15 phút trước',
    status: 'success',
  },
  {
    id: 2,
    title: 'Sản phẩm sắp hết hàng',
    description: 'Bộ LEGO Technic Porsche 911 GT3 RS chỉ còn 5 sản phẩm',
    time: '1 giờ trước',
    status: 'warning',
  },
  {
    id: 3,
    title: 'Khiếu nại sản phẩm #L6723',
    description: 'Khách hàng phản ánh thiếu chi tiết trong bộ LEGO City',
    time: '3 giờ trước',
    status: 'error',
  },
  {
    id: 4,
    title: 'Bộ sưu tập mới đã nhập kho',
    description: 'Bộ sưu tập LEGO Harry Potter 2023 đã sẵn sàng bán',
    time: '5 giờ trước',
    status: 'success',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LEGO Mykingdom - Bảng thống kê</h1>
        <p className="text-gray-500 mt-1">Thống kê doanh số và hoạt động cửa hàng đồ chơi LEGO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Tổng khách hàng" value="8,756" change="15.3%" icon={<UsersIcon size={24} />} color="blue" />
        <StatsCard title="Đơn hàng trong tháng" value="342" change="7.8%" icon={<ShoppingCartIcon size={24} />} color="green" />
        <StatsCard title="Doanh thu" value="876,500,000đ" change="12.4%" icon={<CreditCardIcon size={24} />} color="purple" />
        <StatsCard title="Số bộ LEGO đã bán" value="1,245" change="9.6%" icon={<PackageIcon size={24} />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaChart data={salesData} title="Doanh số bán hàng theo tháng (triệu đồng)" color="#e31d1c" />
        </div>
        <div>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={topSellingData} title="Dòng sản phẩm LEGO bán chạy nhất (đơn vị)" color="#f5cd22" />
        <PieChart
          data={ageGroupData}
          title="Phân bổ khách hàng theo độ tuổi"
          colors={['#e31d1c', '#f5cd22', '#0d69ab', '#00af4d', '#f7901e']}
        />
      </div>
    </div>
  )
}
