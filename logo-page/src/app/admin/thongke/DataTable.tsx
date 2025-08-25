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
import { LucideIcon } from "lucide-react";

interface DataTableProps<T> {
  title: string;
  headers: string[];
  data: T[] | undefined;
  isLoading?: boolean;
  icon: LucideIcon;
  renderRow: (item: T, index: number) => React.ReactNode;
}

export default function DataTable<T>({
  title,
  headers,
  data,
  renderRow,
  isLoading,
  icon: Icon,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/20">
        <Table>
          <TableHeader className="bg-blue-500">
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead key={idx}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {headers.map((_, colIdx) => (
                        <TableCell key={colIdx}>
                          <div className="h-4 bg-gray-400 rounded animate-pulse">
                            Không có dữ liệu
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              : data?.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-300">
                    {renderRow(item, idx)}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
