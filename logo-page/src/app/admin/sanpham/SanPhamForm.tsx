"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { toast } from "sonner";

interface Props {
  onSubmit: (data: ProductData, id?: number) => void;
  edittingSanPham?: SanPham | null;
  onSucces?: () => void;
}

export default function SanPhamForm({
  onSubmit,
  edittingSanPham,
  onSucces,
}: Props) {
  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenSanPham: "",
      moTa: "",
      danhMucId: undefined,
      boSuuTapId: undefined,
      gia: 1000,
      doTuoi: undefined,
      trangThai: "Còn hàng",
      anhDaiDien: "",
      soLuongTon: undefined,
      soLuongManhGhep: undefined,
    },
  });

  const [preview, setPreview] = useState<string | null>(null);

  const { data: danhMucList = [], isLoading: isLoadingDanhMuc } = useDanhMuc();
  const { data: BoSuuTapList = [], isLoading: isLoadingBoSuuTap } =
    useBoSuutap();

  useEffect(() => {
    if (edittingSanPham) {
      form.reset({
        tenSanPham: edittingSanPham.tenSanPham,
        moTa: edittingSanPham.moTa ?? "",
        danhMucId: edittingSanPham.idDanhMuc,
        boSuuTapId: edittingSanPham.idBoSuuTap,
        soLuongTon: edittingSanPham.soLuongTon,
        gia: edittingSanPham.gia,
        doTuoi: edittingSanPham.doTuoi,
        soLuongManhGhep: edittingSanPham.soLuongManhGhep,
        trangThai: edittingSanPham.trangThai,
        anhDaiDien: edittingSanPham.anhDaiDien ?? "",
      });
      setPreview(edittingSanPham.anhDaiDien ?? null);
    } else {
      form.reset();
      setPreview(null);
    }
  }, [edittingSanPham, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const sl = values.soLuongTon ?? 0;
      const expectedTrangThai = sl > 0 ? "Còn hàng" : "Hết hàng";

      if (values.trangThai !== expectedTrangThai) {
        form.setValue("trangThai", expectedTrangThai);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleUploadImage = async (file: File, sanPhamId: number) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("anhChinh", "true");
    formData.append("sanPhamId", sanPhamId.toString());

    const res = await fetch("http://localhost:8080/api/anhsp/upload-images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Upload failed:", text);
      toast.error("Lỗi khi upload ảnh đại diện");
      return null;
    }

    const data = await res.json();
    return data[0]?.url;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          await onSubmit(data, edittingSanPham?.id);
          setPreview(null);
          onSucces?.();
        })}
        className="space-y-4"
      >
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

        <FormField
          control={form.control}
          name="moTa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập mô tả sản phẩm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap  gap-4">
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="danhMucId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingDanhMuc}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
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
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="boSuuTapId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bộ Sưu Tập</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingBoSuuTap}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bộ sưu tập" />
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
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="doTuoi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ tuổi</FormLabel>
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
          </div>

          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="gia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
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
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="soLuongTon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn</FormLabel>
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
                </FormItem>
              )}
            />
          </div>

          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="soLuongManhGhep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng mảnh ghép</FormLabel>
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
          </div>

          <div className=" basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="trangThai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const currentSoLuongTon =
                          form.getValues("soLuongTon") ?? 0;
                        if (value === "Hết hàng" && currentSoLuongTon > 0) {
                          toast.error(
                            "Không thể đặt trạng thái 'Hết hàng' khi số lượng tồn lớn hơn 0"
                          );
                        } else if (
                          value === "Còn hàng" &&
                          currentSoLuongTon == 0
                        ) {
                          toast.error(
                            "Không thể đặt trạng thái 'Còn hàng' khi số lượng tồn  bằng 0"
                          );
                          return;
                        }

                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Còn hàng">Còn hàng</SelectItem>
                        <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-3 items-center ">
          <span> Nổi bật</span>
          <Switch />
        </div>

        <FormField
          control={form.control}
          name="anhDaiDien"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh đại diện</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const uploadedUrl = await handleUploadImage(file);
                      if (uploadedUrl) {
                        const fullUrl = `/api/anhsp/images/${uploadedUrl}`;
                        setPreview(fullUrl);
                        field.onChange(fullUrl);
                      }
                    }
                  }}
                />
              </FormControl>

              {preview && (
                <div className="mt-2 w-40 h-40 relative">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {edittingSanPham ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          </Button>
          {edittingSanPham && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onSucces?.();
                form.reset();
                setPreview(null);
              }}
            >
              Hủy chỉnh sửa
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
