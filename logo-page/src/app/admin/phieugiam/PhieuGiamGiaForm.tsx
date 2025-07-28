"use client";

import type {
  PhieuGiamGia,
  PhieuGiamGiaCreate,
} from "@/components/types/phieugiam.type";
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
import { Switch } from "@/components/ui/switch";
import {
  useAddPhieuGiamGia,
  useEditPhieuGiamGia,
  useGetPhieuGiam,
} from "@/hooks/usePhieuGiam";
import { PhieuGiamGiaData, phieuGiamGiaSchema } from "@/lib/phieugiamgiaschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  editing: PhieuGiamGia | null;
  setEditing: (data: PhieuGiamGia | null) => void;
  onSucess?: () => void;
}

export default function PhieuGiamGia({ editing, setEditing, onSucess }: Props) {
  const addPhieuGG = useAddPhieuGiamGia();
  const editPhieuGG = useEditPhieuGiamGia();

  const form = useForm<PhieuGiamGiaData>({
    resolver: zodResolver(phieuGiamGiaSchema),
    defaultValues: {
      tenPhieu: "",
      soLuong: undefined,
      giaTriGiam: undefined,
      giamToiDa: undefined,
      giaTriToiThieu: undefined,
      loaiPhieuGiam: "Theo số tiền",
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(),
    },
  });

  const loaiPhieu = form.watch("loaiPhieuGiam");
  console.log("Phiếu", loaiPhieu);
  useEffect(() => {
    console.log("Loại phiếu đã thay đổi:", loaiPhieu);
  }, [loaiPhieu]);

  useEffect(() => {
    if (editing) {
      form.reset({
        tenPhieu: editing.tenPhieu,
        soLuong: editing.soLuong,
        giaTriGiam: editing.giaTriGiam,
        giamToiDa: editing.giamToiDa,
        giaTriToiThieu: editing.giaTriToiThieu,
        loaiPhieuGiam: editing.loaiPhieuGiam,
        ngayBatDau: parse(
          editing.ngayBatDau,
          "dd-MM-yyyy HH:mm:ss",
          new Date()
        ),
        ngayKetThuc: parse(
          editing.ngayKetThuc,
          "dd-MM-yyyy HH:mm:ss",
          new Date()
        ),
      });
    }
  }, [editing, form]);

  function onSubmit(data: PhieuGiamGiaData) {
    const payload: PhieuGiamGiaCreate = {
      ...data,
      ngayBatDau: format(data.ngayBatDau, "dd-MM-yyyy HH:mm:ss"),
      ngayKetThuc: format(data.ngayKetThuc, "dd-MM-yyyy HH:mm:ss"),
      giamToiDa:
        data.loaiPhieuGiam === "Theo %" ? data.giamToiDa ?? 0 : undefined,
      noiBat: data.noiBat !== undefined ? (data.noiBat ? 1 : 0) : undefined,
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
            onSucess?.();
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
          onSucess?.();
        },
        onError: () => {
          toast.error("Thêm phiếu giảm không thành công!");
        },
      });
    }
  }

  // Thêm nhanh
  const [suggestVisible, setSuggestVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: phieuGiamList = [] } = useGetPhieuGiam();
  const matchingPhieuGG = phieuGiamList.filter((pgg) =>
    pgg.tenPhieu.toLowerCase().includes(searchValue.toLowerCase())
  );
  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="tenPhieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên phiếu</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Nhập tên phiếu"
                    {...field}
                    ref={inputRef}
                    onFocus={() => setSuggestVisible(true)}
                    onBlur={() =>
                      setTimeout(() => setSuggestVisible(false), 200)
                    }
                    onChange={(e) => {
                      field.onChange(e);
                      setSearchValue(e.target.value);
                    }}
                  />
                </FormControl>
                {suggestVisible && searchValue.trim() && (
                  <div className="  bg-gray-600 border border-gray-200 rounded shadow  w-full max-h-60 overflow-y-auto">
                    {matchingPhieuGG.length > 0 ? (
                      matchingPhieuGG.map((pgg) => (
                        <div
                          key={pgg.id}
                          className="px-3 py-2 text-sm hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            form.setValue("tenPhieu", pgg.tenPhieu);
                            form.setValue("soLuong", pgg.soLuong);
                            form.setValue("loaiPhieuGiam", pgg.loaiPhieuGiam, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });

                            form.setValue("giaTriGiam", pgg.giaTriGiam);
                            form.setValue("giamToiDa", pgg.giamToiDa);
                            form.setValue("giaTriToiThieu", pgg.giaTriToiThieu);
                            form.setValue(
                              "ngayBatDau",
                              parse(
                                pgg.ngayBatDau,
                                "dd-MM-yyyy HH:mm:ss",
                                new Date()
                              )
                            );
                            form.setValue(
                              "ngayKetThuc",
                              parse(
                                pgg.ngayKetThuc,
                                "dd-MM-yyyy HH:mm:ss",
                                new Date()
                              )
                            );

                            setSuggestVisible(false);
                            setSearchValue("");
                            toast.success(
                              "Đã lấy dữ liệu từ phiếu giảm giá gợi ý!!"
                            );
                          }}
                        >
                          {pgg.tenPhieu}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Không tìm thấy phiếu giảm giá
                      </div>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soLuong"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(+e.target.value || undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loaiPhieuGiam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại phiếu</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      console.log("Đã chọn:", val);
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại phiếu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Theo %">Theo %</SelectItem>
                      <SelectItem value="Theo số tiền">Theo số tiền</SelectItem>
                    </SelectContent>
                  </Select>
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
                <FormLabel>
                  Giá trị giảm ({loaiPhieu === "Theo %" ? "%" : "VNĐ"})
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(+e.target.value || undefined)
                      }
                      className="pr-12"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                      {loaiPhieu === "Theo %" ? "%" : "VNĐ"}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {loaiPhieu === "Theo %" && (
            <FormField
              control={form.control}
              name="giamToiDa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giảm tối đa (VNĐ)</FormLabel>
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
          )}

          <FormField
            control={form.control}
            name="giaTriToiThieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá trị tối thiểu (áp dụng)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(+e.target.value || undefined)
                    }
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
          {/* Toggle nổi bật (controlled) */}
          <FormField
            control={form.control}
            name="noiBat"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3">
                  <FormLabel>Nổi bật</FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-4">
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
