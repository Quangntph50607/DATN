"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductData } from "@/lib/sanphamschema";
import { SanPham } from "@/components/types/product.type";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useSanPham } from "@/hooks/useSanPham";
import { toast } from "sonner";

interface Props {
  onSubmit: (data: ProductData, id?: number) => void;
  edittingSanPham?: SanPham | null;
  setEditing: (data: SanPham | null) => void;
  onSucces?: () => void;
}

export default function SanPhamForm({
  onSubmit,
  edittingSanPham,
  setEditing,
  onSucces,
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
      files: undefined as unknown as FileList,
    },
  });

  const { data: danhMucList = [] } = useDanhMuc();
  const { data: boSuuTapList = [] } = useBoSuutap();
  const { data: sanPhamList = [] } = useSanPham();

  // Thêm nhanh
  const [suggestVisible, setSuggestVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingProducts = sanPhamList.filter((sp) =>
    sp.tenSanPham.toLowerCase().includes(searchValue.toLowerCase())
  );

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
  useEffect(() => {
    if (edittingSanPham && danhMucList.length > 0 && boSuuTapList.length > 0) {
      form.trigger();
    }
  }, [danhMucList, boSuuTapList, edittingSanPham, form]);

  useEffect(() => {
    const sub = form.watch(({ soLuongTon, trangThai }) => {
      const expected = (soLuongTon ?? 0) > 0 ? "Đang kinh doanh" : "Hết hàng";
      if (trangThai !== expected) {
        form.setValue("trangThai", expected);
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const numberFields = [
    { name: "doTuoi", label: "Độ tuổi" },
    { name: "gia", label: "Giá (VNĐ)" },
    { name: "soLuongTon", label: "Số lượng tồn" },
    { name: "soLuongManhGhep", label: "Số lượng mảnh ghép" },
  ] as const;
  console.log("Current danhMucId:", form.watch("danhMucId"));
  console.log("Current boSuuTapId:", form.watch("boSuuTapId"));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          const checkTrungTen = sanPhamList.some(
            (sp) =>
              sp.tenSanPham.trim().toLowerCase() ===
                data.tenSanPham.trim().toLowerCase() &&
              sp.id !== edittingSanPham?.id
          );
          if (checkTrungTen) {
            toast.error("Tên sản phẩm đã tồn tại !");
            return;
          }
          await onSubmit(data, edittingSanPham?.id);
          onSucces?.();
        })}
        className="space-y-6 mt-4"
      >
        <FormField
          control={form.control}
          name="tenSanPham"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên sản phẩm"
                  {...field}
                  ref={inputRef}
                  onFocus={() => setSuggestVisible(true)}
                  onBlur={() => setTimeout(() => setSuggestVisible(false), 200)}
                  onChange={(e) => {
                    field.onChange(e);
                    setSearchValue(e.target.value);
                  }}
                />
              </FormControl>
              {suggestVisible && searchValue.trim() && (
                <div className="  bg-gray-600 border border-gray-200 rounded shadow  w-full max-h-60 overflow-y-auto">
                  {matchingProducts.length > 0 ? (
                    matchingProducts.map((sp) => (
                      <div
                        key={sp.id}
                        className="px-3 py-2 text-sm hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          form.setValue("tenSanPham", sp.tenSanPham);
                          form.setValue("moTa", sp.moTa ?? "");
                          form.setValue("danhMucId", sp.danhMucId);
                          form.setValue("boSuuTapId", sp.boSuuTapId);
                          form.setValue("gia", sp.gia ?? 0);
                          form.setValue("doTuoi", sp.doTuoi ?? 0);
                          form.setValue("soLuongTon", sp.soLuongTon ?? 0);
                          form.setValue(
                            "soLuongManhGhep",
                            sp.soLuongManhGhep ?? 0
                          );
                          form.setValue("trangThai", sp.trangThai);
                          setSuggestVisible(false);
                          setSearchValue("");
                          toast.success("Đã lấy dữ liệu từ sản phẩm gợi ý!");
                        }}
                      >
                        {sp.tenSanPham}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Không tìm thấy sản phẩm
                    </div>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Danh mục */}
          <FormField
            control={form.control}
            name="danhMucId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn danh mục" />
                      {/* {getName(field.value, danhMucList, "tenDanhMuc")}
                      </SelectValue> */}
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
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn bộ sưu tập" />
                      {/* {getName(field.value, boSuuTapList, "tenBoSuuTap")}
                      </SelectValue> */}
                    </SelectTrigger>
                    <SelectContent>
                      {boSuuTapList.map((bst) => (
                        <SelectItem key={bst.id} value={bst.id.toString()}>
                          {bst.tenBoSuuTap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Các trường số dạng input */}
          {numberFields.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
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
                </FormItem>
              )}
            />
          ))}

          {/* Trạng thái (disabled) */}
          <FormField
            control={form.control}
            name="trangThai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <Input disabled {...field} className="bg-muted" />
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
                <Textarea {...field} className="min-h-[100px]" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="files"
          render={({ field }) => {
            const currentFiles = Array.from(field.value ?? []);

            const handleRemove = (index: number) => {
              const newFiles = currentFiles.filter((_, i) => i !== index);
              const dt = new DataTransfer();
              newFiles.forEach((f) => dt.items.add(f));
              field.onChange(dt.files);
            };

            return (
              <FormItem>
                <FormLabel>Ảnh sản phẩm (tối đa 5 ảnh)</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const selectedFiles = e.target.files;
                        if (selectedFiles) {
                          const total =
                            currentFiles.length + selectedFiles.length;
                          if (total > 5) {
                            toast.error(
                              `Chỉ cho phép tối đa 5 ảnh, bạn đang cố chọn ${total} ảnh`
                            );
                            return;
                          }
                          const dt = new DataTransfer();
                          [
                            ...currentFiles,
                            ...Array.from(selectedFiles),
                          ].forEach((f) => dt.items.add(f));
                          field.onChange(dt.files);
                        }
                      }}
                      disabled={currentFiles.length >= 5}
                    />

                    {/* Preview ảnh */}
                    {currentFiles.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {currentFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative w-24 h-24 border rounded overflow-hidden"
                          >
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Ảnh ${idx + 1}`}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                            {/* Gắn nhãn Ảnh chính cho ảnh đầu */}
                            {idx === 0 && (
                              <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1 rounded-br">
                                Ảnh chính
                              </span>
                            )}
                            {/* Nút xóa */}
                            <button
                              type="button"
                              onClick={() => handleRemove(idx)}
                              className="absolute top-1 right-1 bg-white text-red-500 text-xs rounded-full px-1 shadow"
                              title="Xóa ảnh"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Toggle nổi bật (placeholder UI) */}
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
