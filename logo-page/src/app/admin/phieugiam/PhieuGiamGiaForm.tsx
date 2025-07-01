"use client";

import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPhieuGiamGia, useEditPhieuGiamGia } from "@/hooks/usePhieuGiam";
import { PhieuGiamGiaData, phieuGiamGiaSchema } from "@/lib/phieugiamgiaschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
interface Props {
  editing: PhieuGiamGia | null;
  setEditing: (data: PhieuGiamGia | null) => void;
  onSucess: () => void;
}

export default function PhieuGiamGia({ editing, setEditing }: Props) {
  const addPhieuGG = useAddPhieuGiamGia();
  const editPhieuGG = useEditPhieuGiamGia();

  const form = useForm<PhieuGiamGiaData>({
    resolver: zodResolver(phieuGiamGiaSchema),
    defaultValues: {
      soLuong: undefined,
      giaTriGiam: undefined,
      giamToiDa: undefined,
      giaTriToiThieu: undefined,
      loaiPhieuGiam: undefined,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(),
      trangThai: undefined,
    },
  });

  const PHIEU_GIAM_GIA = [
    { label: "Theo %", value: "Theo %" },
    { label: "Theo giá tiền", value: "Theo số tiền" },
  ];
  const TRANG_THAI = [
    { label: "Đang hoạt động", value: "Đang hoạt động" },
    { label: "Ngừng hoạt động", value: "Ngừng" },
    { label: "Hết hạn", value: "Hết hạn" },
  ];
  useEffect(() => {
    if (editing) {
      form.reset({
        soLuong: editing.soLuong,
        giaTriGiam: editing.giaTriGiam,
        giamToiDa: editing.giamToiDa,
        giaTriToiThieu: editing.giaTriToiThieu,
        loaiPhieuGiam: editing.loaiPhieuGiam,
        ngayBatDau: parse(editing.ngayBatDau, "dd-MM-yyyy", new Date()),
        ngayKetThuc: parse(editing.ngayKetThuc, "dd-MM-yyyy", new Date()),
        trangThai: editing.trangThai,
      });
    }
  }, [editing, form]);

  function onSubmit(data: PhieuGiamGiaData) {
    const payload = {
      ...data,
      ngayBatDau: format(data.ngayBatDau, "dd-MM-yyyy"),
      ngayKetThuc: format(data.ngayKetThuc, "dd-MM-yyyy"),
    };
    if (editing) {
      editPhieuGG.mutate(
        {
          id: editing.id,
          data: {
            ...payload,
            id: editing.id,
            maPhieu: editing.maPhieu,
          },
        },
        {
          onSuccess: () => {
            toast.success("Sửa khuyến mãi thành công!");
            setEditing(null);
            form.reset();
          },
          onError: () => {
            toast.error("Sửa thất bại");
          },
        }
      );
    } else {
      addPhieuGG.mutate(payload, {
        onSuccess: () => {
          toast.success("Thêm phiếu giảm thành công!");
          form.reset();
        },
        onError: () => {
          toast.error("Thêm phiếu giảm không thành công!");
        },
      });
    }
  }
  return (
    <div className=" ">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="soLuong"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : +value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="giaTriGiam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá trị giảm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : +value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="giamToiDa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giảm tối đa</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : +value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="giaTriToiThieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giảm giá tối thiểu</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : +value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="ngayBatDau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      mode="date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ngayKetThuc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      mode="date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 items-center">
              <FormField
                control={form.control}
                name="loaiPhieuGiam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại phiếu giảm</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn phiếu giảm giá" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHIEU_GIAM_GIA.map((pgg) => (
                            <SelectItem key={pgg.value} value={pgg.value}>
                              {pgg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trangThai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANG_THAI.map((tt) => (
                            <SelectItem key={tt.value} value={tt.value}>
                              {tt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit">
            {editing ? "Cập nhật phiếu giảm" : "Thêm phiếu giảm"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
