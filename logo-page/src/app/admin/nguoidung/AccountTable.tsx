"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Account } from '@/components/types/account.type'; // Import Account type

interface AccountTableProps {
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (accountId: string) => void;
    type: 'employee' | 'customer'; // Prop 'type' này vẫn được sử dụng trong logic màu sắc
  }
  
  const AccountTable: React.FC<AccountTableProps> = ({ accounts, onEdit, onDelete, type }) => {
    // Thêm kiểu cho tham số status
    const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Hoạt động':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Tạm khóa':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Ngừng hoạt động':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleColor = (role: string): string => {
    if (type === 'employee') {
      switch (role) {
        case 'Quản lý':
          return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'Nhân viên':
          return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'Thực tập sinh':
          return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    } else {
      switch (role) {
        case 'Khách hàng VIP':
          return 'bg-gold-500/20 text-yellow-400 border-yellow-500/30';
        case 'Khách hàng':
          return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'Khách hàng mới':
          return 'bg-green-500/20 text-green-400 border-green-500/30';
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">
          Chưa có {type === 'employee' ? 'nhân viên' : 'khách hàng'} nào
        </div>
        <div className="text-gray-500 text-sm mt-2">
          Hãy thêm {type === 'employee' ? 'nhân viên' : 'khách hàng'} đầu tiên!
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl border border-blue-500/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-blue-500/20 hover:bg-blue-500/5">
            <TableHead className="text-blue-200 font-semibold">Thông tin</TableHead>
            <TableHead className="text-blue-200 font-semibold">Liên hệ</TableHead>
            <TableHead className="text-blue-200 font-semibold">Vai trò</TableHead>
            {type === 'employee' && (
              <TableHead className="text-blue-200 font-semibold">Phòng ban</TableHead>
            )}
            <TableHead className="text-blue-200 font-semibold">Trạng thái</TableHead>
            <TableHead className="text-blue-200 font-semibold text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account, index) => (
            <motion.tr
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-blue-500/10 hover:bg-blue-500/5 transition-colors"
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
                  <AvatarImage src={account.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {account.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">{account.name}</div>
                    <div className="text-sm text-gray-400">ID: {account.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">{account.email}</span>
                  </div>
                  {account.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">{account.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getRoleColor(account.role)}>
                  {account.role}
                </Badge>
              </TableCell>
              {type === 'employee' && (
                <TableCell>
                  <span className="text-gray-300">{account.department || 'Chưa phân công'}</span>
                </TableCell>
              )}
              <TableCell>
                <Badge className={getStatusColor(account.status)}>
                  {account.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(account)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(account.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccountTable;
