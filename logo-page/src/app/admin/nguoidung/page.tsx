"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  Building,
  TrendingUp,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { DTOUser, DTOUserWithId } from "@/components/types/account.type";
import StatsCard from "./StatsCard";
import AccountTable from "./AccountTable";
import AccountForm from "./AccountForm";
import {
  useAccounts,
  useAccountsByRole,
  useCreateUser,
  useUpdateAccount,
  useSoftDeleteAccount,
  useRoles,
} from "@/hooks/useAccount";
import { ToastProvider } from "@/components/ui/toast-provider";

type TabType = "employee" | "customer" | "inactive";

function UserManagementContent() {
  const [currentTab, setCurrentTab] = useState<TabType>("employee");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DTOUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formKey, setFormKey] = useState(0);

  const { data: allAccounts = [] } = useAccounts();
  const { data: roles = [] } = useRoles();

  const employees = allAccounts.filter((a) => a.role_id === 2 && a.trangThai === 1);
  const customers = allAccounts.filter((a) => a.role_id === 3 && a.trangThai === 1);
  const inactiveAccounts = allAccounts.filter((a) => a.trangThai === 0);

  // Thêm biến để đếm tổng số (bao gồm cả ngừng hoạt động)
  const totalEmployees = allAccounts.filter((a) => a.role_id === 2);
  const totalCustomers = allAccounts.filter((a) => a.role_id === 3);

  let accounts: DTOUserWithId[] = [];
  if (currentTab === "employee") {
    accounts = employees as DTOUserWithId[];
  } else if (currentTab === "customer") {
    accounts = customers as DTOUserWithId[];
  } else {
    accounts = inactiveAccounts as DTOUserWithId[];
  }

  const getRoleName = (roleId: number) => {
    return roles.find((r) => r.id === roleId)?.name || `Sai role ID: ${roleId}`;
  };

  const filteredAccounts: DTOUserWithId[] = accounts.filter((acc) =>
    [acc.ten, acc.email, getRoleName(acc.role_id)].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Phân trang
  const itemPerPage = 5;
  const totalPages = Math.ceil(filteredAccounts.length / itemPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  // Reset về trang 1 khi thay đổi tab hoặc search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, searchTerm]);

  const createUser = useCreateUser();
  const updateUser = useUpdateAccount();
  const softDelete = useSoftDeleteAccount();
  const { refetch } = useAccounts();

  const handleEditAccount = (account: DTOUser) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleSaveAccount = (accountData: DTOUser) => {
    // Kiểm tra email trùng lặp ở frontend
    const existingUser = allAccounts.find(user =>
      user.email.toLowerCase() === accountData.email.toLowerCase() &&
      (!editingAccount || user.id !== editingAccount.id)
    );

    if (existingUser) {
      toast.error("Email đã tồn tại trong hệ thống");
      return;
    }

    if (editingAccount) {
      updateUser.mutate(
        {
          id: editingAccount.id!,
          data: {
            ten: accountData.ten,
            email: accountData.email,
            matKhau: accountData.matKhau,
            sdt: accountData.sdt,
            diaChi: accountData.diaChi,
            trangThai: accountData.trangThai,
            role_id: accountData.role_id,
          },
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật tài khoản thành công");
            setIsFormOpen(false);
            setEditingAccount(null);
            refetch();
          },
          onError: (error) => {
            toast.error(error.message || "Lỗi cập nhật tài khoản");
          },
        }
      );
    } else {
      createUser.mutate(accountData, {
        onSuccess: () => {
          toast.success("Thêm tài khoản thành công");
          setIsFormOpen(false);
          refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Thêm tài khoản thất bại");
        },
      });
    }
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleDelete = (account: DTOUser) => {
    if (!confirm("Bạn có chắc chắn muốn ngừng hoạt động tài khoản này?")) return;

    softDelete.mutate(
      {
        ...account
      },
      {
        onSuccess: () => {
          toast.success("Đã chuyển tài khoản sang trạng thái ngừng hoạt động");
          refetch();
        },
        onError: () => {
          toast.error("Xóa tài khoản thất bại");
        },
      }
    );
  };

  console.log("Employees:", employees);
  console.log("Customers:", customers);
  console.log("Inactive accounts:", inactiveAccounts);
  console.log("Current tab:", currentTab);
  console.log("Filtered accounts:", filteredAccounts);


  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Hệ Thống Quản Lý Người Dùng
          </h1>
          <p className="text-gray-400 text-lg">
            Quản lý nhân viên và khách hàng một cách hiệu quả
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard title="Tổng nhân viên" value={totalEmployees.length} icon={Users} color="border-blue-500/60" />
          <StatsCard title="Nhân viên hoạt động" value={employees.length} icon={UserCheck} color="border-green-500/60" />
          <StatsCard title="Tổng khách hàng" value={totalCustomers.length} icon={Building} color="border-purple-500/60" />
          <StatsCard title="Khách hàng hoạt động" value={customers.length} icon={TrendingUp} color="border-green-500/60" />
        </motion.div>

        {/* Tabs & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-6 border border-blue-500/60"
        >
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TabType)}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <TabsList className="bg-slate-800/50 border border-blue-500/20 p-1 rounded-xl">
                <TabsTrigger
                  value="employee"
                  className="data-[state=active]:!bg-blue-600 data-[state=active]:!text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-blue-500/20"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Nhân viên
                </TabsTrigger>
                <TabsTrigger
                  value="customer"
                  className="data-[state=active]:!bg-purple-600 data-[state=active]:!text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-purple-500/20"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Khách hàng
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:!bg-yellow-600 data-[state=active]:!text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-yellow-500/20"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Ngừng hoạt động
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, vai trò..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-blue-500/30 focus:border-blue-400 w-full sm:w-80"
                  />
                </div>
                {currentTab !== "inactive" && (
                  <Button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mới
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="employee" className="mt-6">
              <AccountTable
                accounts={paginatedAccounts}
                onEdit={handleEditAccount}
                onDelete={handleDelete}
                roles={roles}
                type="employee"
              />
              {/* Phân trang */}
              <div className="flex gap-2 items-center justify-center mt-4">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trước
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Sau
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="mt-6">
              <AccountTable
                accounts={paginatedAccounts}
                roles={roles}
                onEdit={handleEditAccount}
                onDelete={handleDelete}
                type={currentTab}
              />
              {/* Phân trang */}
              <div className="flex gap-2 items-center justify-center mt-4">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trước
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Sau
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="inactive" className="mt-6">
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  Số lượng tài khoản ngừng hoạt động: {filteredAccounts.length}
                </p>
              </div>
              <AccountTable
                accounts={paginatedAccounts}
                roles={roles}
                onEdit={handleEditAccount}
                onDelete={handleDelete}
                type={currentTab}
              />
              {/* Phân trang */}
              <div className="flex gap-2 items-center justify-center mt-4">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trước
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Sau
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <AccountForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAccount(null);
          }}
          account={editingAccount}
          onSave={handleSaveAccount}
          type={currentTab}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ToastProvider>
      <UserManagementContent />
    </ToastProvider>
  );
}
