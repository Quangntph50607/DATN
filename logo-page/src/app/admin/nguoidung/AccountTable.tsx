"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, SwitchCameraIcon } from "lucide-react";
import { DTOUser, Role } from "@/components/types/account.type";
import { parseBackendDate } from "@/utils/dateUtils";

type DTOUserWithId = DTOUser & { id: number };

type AccountTableProps = {
  accounts: DTOUserWithId[];
  roles: Role[];
  onEdit: (acc: DTOUserWithId) => void;
  onDelete: (acc: DTOUserWithId) => void;
  type: "employee" | "customer" | "inactive";
};

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  roles,
  onEdit,
  onDelete,
}) => {

  const getRoleName = (roleId: number | string | null | undefined) => {
    if (!roleId || !roles || roles.length === 0) return "Không xác định";

    const id = typeof roleId === "string" ? Number(roleId) : roleId;
    const foundRole = roles.find((r) => r.id === id);

    return foundRole?.name || "Không xác định";
  };

  console.log("Roles list:", roles);
  console.log("Account role_ids:", accounts.map((a) => a.role_id));

  return (
    <div className="border-3 border-blue-500 rounded-2xl mt-4 overflow-x-auto shadow-2xl shadow-blue-500/20">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.map((acc, idx) => (
            <TableRow key={acc.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{acc.ten}</TableCell>
              <TableCell>{acc.email}</TableCell>
              <TableCell>{acc.sdt}</TableCell>             
              <TableCell>{acc.diaChi}</TableCell>

              {/* TÊN VAI TRÒ */}
              <TableCell>
                {roles.find((r) => r.id === Number(acc.role_id)) ? (
                  <Badge
                    variant="outline"
                    className={Number(acc.role_id) === 2 ? "bg-blue-600 text-white border-blue-600" : "bg-purple-600 text-white border-purple-600"}
                  >
                    {getRoleName(Number(acc.role_id))}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Sai role ID: {String(acc.role_id)}</Badge>
                )}
              </TableCell>

              {/* Ngày tạo */}
              <TableCell>
                {acc.ngayTao
                  ? parseBackendDate(acc.ngayTao)?.toLocaleString("vi-VN") ?? "-"
                  : "-"}
              </TableCell>

              {/* Trạng thái */}
              <TableCell>
                {acc.trangThai === 1 ? (
                  <Badge variant="default" className="bg-green-600">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="destructive">Ngừng hoạt động</Badge>
                )}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right space-x-2">
                <Button
                  size="icon"
                  className="hover:opacity-80 transition"
                  onClick={() => onEdit(acc)}
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  size="icon"
                  className="hover:opacity-80 transition"
                  onClick={() => onDelete(acc)}
                  disabled={acc.trangThai === 0}
                  title="Chuyển trạng thái"
                >
                  <SwitchCameraIcon className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccountTable;
