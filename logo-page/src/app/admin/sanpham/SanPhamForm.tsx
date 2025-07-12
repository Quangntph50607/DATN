"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductData } from "@/lib/sanphamschema";
import { SanPham } from "@/components/types/product.type";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Props {
  onSubmit: (data: ProductData, id?: number) => void;
  edittingSanPham?: SanPham | null;
  setEditing: (data: SanPham | null) => void;
  onSucces?: () => void;
}

export default function SanPhamForm({
  onSubmit,
  edittingSanPham,
  onSucces,
  setEditing,
}: Props) {
  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenSanPham: "",
      moTa: "",
      danhMucId: undefined,
      boSuuTapId: undefined,
      gia: undefined,
      doTuoi: undefined,
      trangThai: "Đang kinh doanh",
      soLuongTon: undefined,
      soLuongManhGhep: undefined,
    },
  });

  const { data: danhMucList = [], isLoading: isLoadingDanhMuc } = useDanhMuc();
  const { data: BoSuuTapList = [], isLoading: isLoadingBoSuuTap } =
    useBoSuutap();

  // Helper functions để lấy tên danh mục và bộ sưu tập
  const getDanhMucName = (id?: number) => {
    return danhMucList.find((dm) => dm.id === id)?.tenDanhMuc || "";
  };

  const getBoSuuTapName = (id?: number) => {
    return BoSuuTapList.find((bst) => bst.id === id)?.tenBoSuuTap || "";
  };

  useEffect(() => {
    if (edittingSanPham) {
      const formData = {
        tenSanPham: edittingSanPham.tenSanPham,
        moTa: edittingSanPham.moTa ?? "",
        danhMucId: edittingSanPham.danhMucId,
        boSuuTapId: edittingSanPham.boSuuTapId,
        soLuongTon: edittingSanPham.soLuongTon,
        gia: edittingSanPham.gia,
        doTuoi: edittingSanPham.doTuoi,
        soLuongManhGhep: edittingSanPham.soLuongManhGhep,
        trangThai: edittingSanPham.trangThai,
      };

      form.reset(formData);

      setTimeout(() => {
        if (form.getValues("danhMucId") !== edittingSanPham.danhMucId) {
          form.setValue("danhMucId", edittingSanPham.danhMucId);
        }

        if (form.getValues("boSuuTapId") !== edittingSanPham.boSuuTapId) {
          form.setValue("boSuuTapId", edittingSanPham.boSuuTapId);
        }
      }, 100);
    }
  }, [edittingSanPham, form]);

  // Cập nhật form khi danh sách được load xong
  useEffect(() => {
    if (edittingSanPham && danhMucList.length > 0 && BoSuuTapList.length > 0) {
      form.trigger();
    }
  }, [danhMucList, BoSuuTapList, edittingSanPham, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const sl = values.soLuongTon ?? 0;
      const current = values.trangThai;

      const expected = sl > 0 ? "Đang kinh doanh" : "Hết hàng";

      if (current !== expected) {
        form.setValue("trangThai", expected);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          console.log("Submit update:", data, edittingSanPham?.id);
          await onSubmit(data, edittingSanPham?.id);
          onSucces?.();
        })}
        className="space-y-6 mt-4"
      >
        {/* Tên sản phẩm */}
        <FormField
          control={form.control}
          name="tenSanPham"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên sản phẩm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid chia các input theo hàng */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Danh mục */}
          <FormField
            control={form.control}
            name="danhMucId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={
                      field.value !== undefined
                        ? String(field.value)
                        : undefined
                    }
                    disabled={isLoadingDanhMuc}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn danh mục">
                        {field.value ? getDanhMucName(field.value) : ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {danhMucList.map((dm) => (
                        <SelectItem key={dm.id} value={dm.id.toString()}>
                          {dm.tenDanhMuc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bộ sưu tập */}
          <FormField
            control={form.control}
            name="boSuuTapId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bộ sưu tập</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={
                      field.value !== undefined
                        ? String(field.value)
                        : undefined
                    }
                    disabled={isLoadingBoSuuTap}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn bộ sưu tập">
                        {field.value ? getBoSuuTapName(field.value) : ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {BoSuuTapList.map((bst) => (
                        <SelectItem key={bst.id} value={bst.id.toString()}>
                          {bst.tenBoSuuTap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Độ tuổi */}
          <FormField
            control={form.control}
            name="doTuoi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ tuổi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Giá */}
          <FormField
            control={form.control}
            name="gia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá (VNĐ)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Số lượng tồn */}
          <FormField
            control={form.control}
            name="soLuongTon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng tồn</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Số lượng mảnh ghép */}
          <FormField
            control={form.control}
            name="soLuongManhGhep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng mảnh ghép</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Trạng thái (disabled) */}
          <FormField
            control={form.control}
            name="trangThai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    className="bg-gray-100 text-gray-100"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Mô tả sản phẩm */}
        <FormField
          control={form.control}
          name="moTa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả sản phẩm</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả sản phẩm"
                  {...field}
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nổi bật toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Nổi bật</span>
          <Switch />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {edittingSanPham ? "Cập nhật" : "Thêm mới"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditing(null);
              form.reset();
              onSucces?.();
            }}
          >
            Hủy bỏ
          </Button>
        </div>
      </form>
    </Form>
  );
}
