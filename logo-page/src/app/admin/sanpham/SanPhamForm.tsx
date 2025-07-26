"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductData } from "@/lib/sanphamschema";
import { SanPham } from "@/components/types/product.type";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { useXoaAnhSanPham, useAddAnhSanPham } from "@/hooks/useAnhSanPham";

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
  const isEdit = !!edittingSanPham;
  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema(isEdit)),
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
  const { data: xuatXuList = [] } = useXuatXu();
  const { data: thuongHieuList = [] } = useThuongHieu();

  // Thêm nhanh
  const [suggestVisible, setSuggestVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingProducts = sanPhamList.filter((sp) =>
    sp.tenSanPham.toLowerCase().includes(searchValue.toLowerCase())
  );

  const [deletedOldImages, setDeletedOldImages] = useState<number[]>([]);
  const { mutateAsync: xoaAnh } = useXoaAnhSanPham();
  const { mutateAsync: addAnh } = useAddAnhSanPham();

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
        xuatXuId: edittingSanPham.xuatXuId,
        thuongHieuId: edittingSanPham.thuongHieuId,
        noiBat: edittingSanPham.noiBat === 1 || edittingSanPham.noiBat === true,
      };
      console.log("Ảnh", edittingSanPham);
      form.reset(formData);
      setTimeout(() => {
        if (form.getValues("danhMucId") !== edittingSanPham.danhMucId) {
          form.setValue("danhMucId", edittingSanPham.danhMucId);
        }

        if (form.getValues("boSuuTapId") !== edittingSanPham.boSuuTapId) {
          form.setValue("boSuuTapId", edittingSanPham.boSuuTapId);
        }
        if (form.getValues("xuatXuId") !== edittingSanPham.xuatXuId) {
          form.setValue("xuatXuId", edittingSanPham.xuatXuId);
        }
        if (form.getValues("thuongHieuId") !== edittingSanPham.thuongHieuId) {
          form.setValue("thuongHieuId", edittingSanPham.thuongHieuId);
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
  console.log("sp1", edittingSanPham);

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

          try {
            if (edittingSanPham) {
              // CẬP NHẬT SẢN PHẨM
              // Xóa ảnh cũ nếu có (xóa tất cả ảnh trong deletedOldImages)
              if (deletedOldImages.length > 0) {
                console.log("Đang xóa các ảnh:", deletedOldImages);
                await Promise.all(deletedOldImages.map((imgId) => xoaAnh(imgId)));
                console.log("Đã xóa xong các ảnh");
              }

              // Gọi API update sản phẩm (form-data, kèm ảnh mới nếu có)
              await onSubmit(data, edittingSanPham.id);

              // Thêm ảnh mới nếu có
              if (data.files && data.files.length > 0) {
                // Kiểm tra sản phẩm đã có ảnh chưa
                const hasExistingImages = edittingSanPham.anhUrls && edittingSanPham.anhUrls.length > 0;

                console.log("Đang thêm ảnh mới:", {
                  filesCount: data.files.length,
                  hasExistingImages,
                  sanPhamId: edittingSanPham.id
                });

                try {
                  await addAnh({
                    files: Array.from(data.files),
                    anhChinh: !hasExistingImages, // Chỉ ảnh đầu tiên mới là ảnh chính
                    sanPhamId: edittingSanPham.id,
                  });
                  console.log("Thêm ảnh thành công");
                } catch (error) {
                  console.error("Lỗi khi thêm ảnh:", error);
                  // Không throw error để không ảnh hưởng đến việc update sản phẩm
                  // Có thể ảnh đã được thêm thành công mặc dù có lỗi response
                }
              }
            } else {
              // THÊM SẢN PHẨM MỚI
              // Gọi API thêm sản phẩm mới
              await onSubmit(data);

              // Lưu ý: Ảnh sẽ được xử lý trong API thêm sản phẩm
              // API sẽ tự động set ảnh đầu tiên làm ảnh chính
            }

            onSucces?.();
          } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            toast.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
          }
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

          {/* Xuất xứ */}
          <FormField
            control={form.control}
            name="xuatXuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xuất xứ</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn xuất xứ" />
                    </SelectTrigger>
                    <SelectContent>
                      {xuatXuList.map((xx) => (
                        <SelectItem key={xx.id} value={xx.id.toString()}>
                          {xx.ten}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          {/* Thương hiệu */}
          <FormField
            control={form.control}
            name="thuongHieuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thương hiệu</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="w-77">
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      {thuongHieuList.map((th) => (
                        <SelectItem key={th.id} value={th.id.toString()}>
                          {th.ten}
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
                        console.log("Selectt:", selectedFiles);
                      }}
                      disabled={currentFiles.length >= 5}
                    />

                    {/* Preview ảnh cũ khi sửa */}
                    {(() => {
                      const BASE_IMAGE_URL = "http://localhost:8080/api/anhsp/images/";

                      // Helper function để parse anhUrls một cách type-safe
                      const parseAnhUrls = (anhUrls: (import("@/components/types/product.type").AnhSanPhamChiTiet | string)[] | undefined): import("@/components/types/product.type").AnhSanPhamChiTiet[] => {
                        if (!anhUrls || !Array.isArray(anhUrls)) return [];

                        return anhUrls
                          .map((item) => {
                            // Kiểm tra xem item có phải là AnhSanPhamChiTiet object không
                            if (item && typeof item === "object" && "id" in item && "url" in item) {
                              const anhItem = item as import("@/components/types/product.type").AnhSanPhamChiTiet;
                              return {
                                id: anhItem.id,
                                url: anhItem.url,
                                moTa: anhItem.moTa || "",
                                anhChinh: anhItem.anhChinh || false,
                                sanPhamId: edittingSanPham!.id,
                              } as import("@/components/types/product.type").AnhSanPhamChiTiet;
                            }
                            return null;
                          })
                          .filter((img): img is import("@/components/types/product.type").AnhSanPhamChiTiet => !!img);
                      };

                      const previewImages = parseAnhUrls(edittingSanPham?.anhUrls);
                      console.log("edittingSanPham.anhUrls:", edittingSanPham?.anhUrls);
                      console.log("previewImages:", previewImages);
                      // Lọc ảnh đã bị xóa tạm thời (có thể xóa cả ảnh cũ và mới)
                      const filteredImages = previewImages.filter((anh) => !deletedOldImages.includes(anh.id));
                      console.log("filteredImages:", filteredImages);
                      return filteredImages.length > 0 ? (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {filteredImages.map((anh, idx) => {
                            let imgSrc = anh.url;
                            if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("/")) {
                              imgSrc = BASE_IMAGE_URL + imgSrc;
                            }
                            return (
                              <div key={String(anh.id) + '-' + anh.url} className="relative w-24 h-24 border rounded overflow-hidden">
                                <Image
                                  src={imgSrc}
                                  alt={`Ảnh ${idx + 1}`}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                                {idx === 0 && (
                                  <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1 rounded-br">
                                    Ảnh chính
                                  </span>
                                )}
                                {/* Nút xóa ảnh cũ - chỉ hiển thị cho ảnh có id thật */}
                                {anh.id > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setDeletedOldImages((prev) => [...prev, anh.id])}
                                    className="absolute top-1 right-1 bg-white text-red-500 text-xs rounded-full px-1 shadow"
                                    title="Xóa ảnh"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : null;
                    })()}

                    {/* Preview ảnh mới chọn */}
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
                            {/* Gắn nhãn Ảnh chính cho ảnh đầu nếu sản phẩm chưa có ảnh */}
                            {idx === 0 && (!edittingSanPham?.anhUrls || edittingSanPham.anhUrls.length === 0) && (
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

        {/* Toggle nổi bật (controlled) */}
        <FormField
          control={form.control}
          name="noiBat"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel>Nổi bật</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

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
