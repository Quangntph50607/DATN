"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { khuyenMaiSchema, KhuyenMaiData } from "@/lib/khuyenmaischema";
import {
  useAddKhuyenMai,
  useAddKhuyenMaiVaoSanPham,
  useEditKhuyenMai,
  useKhuyenMai,
} from "@/hooks/useKhuyenmai";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { useEffect, useState } from "react";
import SanPhamMultiSelect from "./SanPhamMultiSelect";

interface Props {
  editing: KhuyenMaiDTO | null;
  setEditing: (data: KhuyenMaiDTO | null) => void;
  onSucess?: () => void;
}

export default function KhuyenMaiForm({
  editing,
  setEditing,
  onSucess,
}: Props) {
  const form = useForm<KhuyenMaiData>({
    resolver: zodResolver(khuyenMaiSchema),
    defaultValues: {
      tenKhuyenMai: "",
      phanTramKhuyenMai: undefined,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(),
    },
  });
  useEffect(() => {
    if (editing) {
      if (
        Array.isArray(editing.ngayBatDau) &&
        editing.ngayBatDau.length >= 5 &&
        Array.isArray(editing.ngayKetThuc) &&
        editing.ngayKetThuc.length >= 5
      ) {
        const [y1, m1, d1, h1, min1] = editing.ngayBatDau.map(Number);
        const [y2, m2, d2, h2, min2] = editing.ngayKetThuc.map(Number);

        const start = new Date(y1, m1 - 1, d1, h1, min1);
        const end = new Date(y2, m2 - 1, d2, h2, min2);

        form.reset({
          tenKhuyenMai: editing.tenKhuyenMai,
          phanTramKhuyenMai: editing.phanTramKhuyenMai,
          ngayBatDau: start,
          ngayKetThuc: end,
        });
      }
    }
  }, [editing, form]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const addKhuyenMai = useAddKhuyenMai();
  const editKhuyenMai = useEditKhuyenMai();
  const addKhuyenMaiVaoSp = useAddKhuyenMaiVaoSanPham();
  const { data: khuyenMaiList = [] } = useKhuyenMai();
  const onSubmit = (data: KhuyenMaiData) => {
    const checkTrungTen = khuyenMaiList.some(
      (km) =>
        km.tenKhuyenMai.trim().toLowerCase() ===
          data.tenKhuyenMai.trim().toLowerCase() && km.id !== editing?.id
    );
    if (checkTrungTen) {
      toast.error("Tên khuyến mại đã tồn tại !");
      return;
    }
    if (data.ngayBatDau > data.ngayKetThuc) {
      toast.error("Ngày bắt đầu phải sau ngày kết thúc");
      return;
    }
    const now = new Date();
    if (data.ngayBatDau < now) {
      toast.error("Ngày bắt đầu phải từ hôm nay trở đi");
      return;
    }
    const payload = {
      ...data,
      ngayBatDau: format(data.ngayBatDau, "dd-MM-yyyy HH:mm:ss"),
      ngayKetThuc: format(data.ngayKetThuc, "dd-MM-yyyy HH:mm:ss"),
    };
    if (editing) {
      editKhuyenMai.mutate(
        {
          id: editing.id,
          data: {
            ...payload,
            id: editing.id,
            trangThai: editing.trangThai,
          },
        },
        {
          onSuccess: () => {
            toast.success("Sửa khuyến mãi thành công!");
            setEditing(null);
            form.reset();
            onSucess?.();
          },
          onError: () => {
            toast.error("Sửa thất bại");
          },
        }
      );
    } else {
      addKhuyenMai.mutate(payload, {
        onSuccess: (res) => {
          if (res?.id) {
            if (selectedIds.length > 0) {
              addKhuyenMaiVaoSp.mutate(
                {
                  khuyenMaiId: res.id,
                  listSanPhamId: selectedIds,
                },
                {
                  onSuccess: (res: any) => {
                    if (res.trangThai === "SUCCESS") {
                      toast.success("Áp dụng khuyến mãi thành công!");
                    } else if (
                      res.trangThai === "FAILED" &&
                      res.sanPhamTrung?.length > 0
                    ) {
                      const tenSp = res.sanPhamTrung
                        .map((sp: any) => sp.tenSanPham)
                        .join(", ");
                      toast.error(
                        `Không thể áp dụng cho: ${tenSp}. Các sản phẩm này đã có khuyến mãi trùng thời gian.`
                      );
                    } else {
                      toast.error(res.message || "Áp dụng khuyến mãi thất bại");
                    }
                    // Chỉ reset khi kết quả rõ ràng
                    form.reset();
                    setSelectedIds([]);
                    onSucess?.();
                  },
                  onError: (err: any) => {
                    toast.error(
                      err?.response?.data?.message ||
                        "Áp dụng khuyến mãi thất bại"
                    );
                  },
                }
              );
            } else {
              // Trường hợp không có selectedIds => chỉ tạo khuyến mãi thôi
              toast.success(
                "Tạo khuyến mãi thành công (chưa áp dụng cho sản phẩm)"
              );
              form.reset();
              setSelectedIds([]);
              onSucess?.();
            }
          }
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Tạo khuyến mãi thất bại"
          );
        },
      });
    }
  };

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form className="space-y-6 mt-2" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Tên khuyến mãi */}
          <FormField
            control={form.control}
            name="tenKhuyenMai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Khuyến Mãi</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên khuyến mãi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phần trăm */}
          <FormField
            control={form.control}
            name="phanTramKhuyenMai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phần trăm khuyến mãi (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="---"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ngày bắt đầu - kết thúc */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Checkbox */}
          <SanPhamMultiSelect
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Cập nhật" : "Thêm mới"}</Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                form.reset();
                onSucess?.();
              }}
            >
              Hủy bỏ
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
