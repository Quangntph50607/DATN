"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  ProductData,
  ProductDataWithoutFiles,
} from "@/lib/sanphamschema";
import { SanPham } from "@/components/types/product.type";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { useXoaAnhSanPham, useAddAnhSanPham } from "@/hooks/useAnhSanPham";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { LegoCategoryForm } from "@/app/admin/danhmuc/LegoCategoryForm";
import LegoCollectionForm from "@/app/admin/bosuutap/LegoCollectionForm";
import { ThuongHieuForm } from "@/app/admin/thuonghieu/ThuongHieuForm";
import { XuatXuForm } from "@/app/admin/xuatxu/XuatXuForm";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useAddSDanhMuc } from "@/hooks/useDanhMuc";
import { useAddBoSuuTap } from "@/hooks/useBoSutap";
import { useAddThuongHieu } from "@/hooks/useThuongHieu";
import { useAddXuatXu } from "@/hooks/useXuatXu";

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
  onSubmit: (data: ProductData | ProductDataWithoutFiles, id?: number) => void;
  edittingSanPham?: SanPham | null;
  setEditing: (data: SanPham | null) => void;
  onSucces?: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export default function SanPhamForm({
  onSubmit,
  edittingSanPham,
  setEditing,
  onSucces,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const isEdit = !!edittingSanPham;
  // const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Add-new dialogs state
  const [openDanhMuc, setOpenDanhMuc] = useState(false);
  const [openBoSuuTap, setOpenBoSuuTap] = useState(false);
  const [openThuongHieu, setOpenThuongHieu] = useState(false);
  const [openXuatXu, setOpenXuatXu] = useState(false);

  // Mutations for quick create
  const { mutateAsync: addDanhMuc } = useAddSDanhMuc();
  const { mutateAsync: addBoSuuTap } = useAddBoSuuTap();
  const { mutateAsync: addThuongHieu } = useAddThuongHieu();
  const { mutateAsync: addXuatXu } = useAddXuatXu();

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

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            setIsSubmitting(true);

            const checkTrungTen = sanPhamList.some(
              (sp) =>
                sp.tenSanPham.trim().toLowerCase() ===
                  data.tenSanPham.trim().toLowerCase() &&
                sp.id !== edittingSanPham?.id
            );
            if (checkTrungTen) {
              toast.error("Tên sản phẩm đã tồn tại !");
              setIsSubmitting(false);
              return;
            }

            try {
              if (edittingSanPham) {
                // CẬP NHẬT SẢN PHẨM
                // Xóa ảnh cũ nếu có (xóa tất cả ảnh trong deletedOldImages)
                if (deletedOldImages.length > 0) {
                  console.log("Đang xóa các ảnh:", deletedOldImages);
                  await Promise.all(
                    deletedOldImages.map((imgId) => xoaAnh(imgId))
                  );
                  console.log("Đã xóa xong các ảnh");
                }

                // Tạo data không có files để gọi API update sản phẩm (chỉ cập nhật thông tin)
                const updateData = {
                  tenSanPham: data.tenSanPham,
                  moTa: data.moTa,
                  danhMucId: data.danhMucId,
                  boSuuTapId: data.boSuuTapId,
                  gia: data.gia,
                  doTuoi: data.doTuoi,
                  trangThai: data.trangThai,
                  soLuongTon: data.soLuongTon,
                  soLuongManhGhep: data.soLuongManhGhep,
                  xuatXuId: data.xuatXuId,
                  thuongHieuId: data.thuongHieuId,
                  noiBat: data.noiBat,
                } as ProductDataWithoutFiles;
                await onSubmit(updateData, edittingSanPham.id);

                // Thêm ảnh mới nếu có (xử lý riêng vì API Update không xử lý ảnh)
                if (data.files && data.files.length > 0) {
                  // Kiểm tra sản phẩm đã có ảnh chưa (sau khi xóa ảnh cũ)
                  const remainingImages =
                    edittingSanPham.anhUrls?.filter(
                      (anh) =>
                        !deletedOldImages.includes(
                          typeof anh === "object" ? anh.id : 0
                        )
                    ) || [];
                  const hasExistingImages = remainingImages.length > 0;

                  console.log("Đang thêm ảnh mới:", {
                    filesCount: data.files.length,
                    hasExistingImages,
                    remainingImagesCount: remainingImages.length,
                    sanPhamId: edittingSanPham.id,
                    files: Array.from(data.files).map((f) => ({
                      name: f.name,
                      size: f.size,
                      type: f.type,
                    })),
                  });

                  try {
                    const result = await addAnh({
                      files: Array.from(data.files),
                      anhChinh: !hasExistingImages, // Chỉ ảnh đầu tiên mới là ảnh chính nếu chưa có ảnh
                      sanPhamId: edittingSanPham.id,
                    });
                    console.log("Thêm ảnh thành công:", result);
                    toast.success(
                      `Đã thêm ${data.files.length} ảnh thành công!`
                    );

                    // Đợi một chút để BE xử lý xong ảnh trước khi gọi onSuccess
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  } catch (error) {
                    console.error("Lỗi khi thêm ảnh:", error);
                    toast.error(
                      "Có lỗi khi thêm ảnh, nhưng thông tin sản phẩm đã được cập nhật!"
                    );
                    setIsSubmitting(false);
                    // Không throw error để không ảnh hưởng đến việc update sản phẩm
                  }
                } else {
                  console.log("Không có ảnh mới để thêm");
                }
              } else {
                // THÊM SẢN PHẨM MỚI
                // Gọi API thêm sản phẩm mới
                await onSubmit(data);

                // Lưu ý: Ảnh sẽ được xử lý trong API thêm sản phẩm
                // API sẽ tự động set ảnh đầu tiên làm ảnh chính
              }

              // Không gọi onSucces ngay lập tức, để form tự đóng
              // onSucces?.();
            } catch (error) {
              console.error("Lỗi khi cập nhật sản phẩm:", error);
              toast.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
              setIsSubmitting(false);
            } finally {
              setIsSubmitting(false);
              // Tự động đóng form sau khi hoàn thành
              setTimeout(() => {
                setEditing(null);
                form.reset();
                // Gọi onSucces để đóng modal
                onSucces?.();
              }, 1500);
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
                    onBlur={() =>
                      setTimeout(() => setSuggestVisible(false), 200)
                    }
                    onChange={(e) => {
                      field.onChange(e);
                      setSearchValue(e.target.value);
                    }}
                  />
                </FormControl>
                {suggestVisible &&
                  searchValue.trim() &&
                  matchingProducts.length > 0 && (
                    <div className="bg-gray-600 border border-gray-200 rounded shadow w-full max-h-60 overflow-y-auto">
                      {matchingProducts.map((sp) => (
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
                            form.setValue("xuatXuId", sp.xuatXuId);
                            form.setValue("thuongHieuId", sp.thuongHieuId);
                            setSuggestVisible(false);
                            setSearchValue("");
                            toast.success("Đã lấy dữ liệu từ sản phẩm gợi ý!");
                          }}
                        >
                          {sp.tenSanPham}
                        </div>
                      ))}
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
                <div className="flex items-center gap-2">
                  <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...danhMucList]
                          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                          .map((dm) => (
                          <SelectItem key={dm.id} value={dm.id.toString()}>
                            {dm.tenDanhMuc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="icon" variant="outline" onClick={() => setOpenDanhMuc(true)}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                </div>
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
                <div className="flex items-center gap-2">
                  <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn bộ sưu tập" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...boSuuTapList]
                          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                          .map((bst) => (
                          <SelectItem key={bst.id} value={bst.id.toString()}>
                            {bst.tenBoSuuTap}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="icon" variant="outline" onClick={() => setOpenBoSuuTap(true)}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                </div>
              </FormControl>
                  <FormMessage />
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
                <div className="flex items-center gap-2">
                  <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn xuất xứ" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...xuatXuList]
                          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                          .map((xx) => (
                          <SelectItem key={xx.id} value={xx.id.toString()}>
                            {xx.ten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="icon" variant="outline" onClick={() => setOpenXuatXu(true)}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                </div>
              </FormControl>
                  <FormMessage />
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
                <div className="flex items-center gap-2">
                  <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...thuongHieuList]
                          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                          .map((th) => (
                          <SelectItem key={th.id} value={th.id.toString()}>
                            {th.ten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="icon" variant="outline" onClick={() => setOpenThuongHieu(true)}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                </div>
              </FormControl>
                  <FormMessage />
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
                    <FormMessage />
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
                  <FormLabel>Ảnh sản phẩm (tối đa 10 ảnh)</FormLabel>
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
                            if (total > 10) {
                              toast.error(
                                `Chỉ cho phép tối đa 10 ảnh, bạn đang cố chọn ${total} ảnh`
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
                        disabled={currentFiles.length >= 10}
                      />

                      {/* Preview ảnh cũ khi sửa */}
                      {(() => {
                        // Helper function để parse anhUrls một cách type-safe
                        const parseAnhUrls = (
                          anhUrls:
                            | (
                                | import("@/components/types/product.type").AnhSanPhamChiTiet
                                | string
                              )[]
                            | undefined
                        ): import("@/components/types/product.type").AnhSanPhamChiTiet[] => {
                          if (!anhUrls || !Array.isArray(anhUrls)) return [];

                          return anhUrls
                            .map((item, index) => {
                              try {
                                // Kiểm tra xem item có phải là AnhSanPhamChiTiet object không
                                if (
                                  item &&
                                  typeof item === "object" &&
                                  "id" in item &&
                                  "url" in item
                                ) {
                                  const anhItem =
                                    item as import("@/components/types/product.type").AnhSanPhamChiTiet;

                                  // Validate URL
                                  const isValidUrl =
                                    anhItem.url &&
                                    (anhItem.url.startsWith("http://") ||
                                      anhItem.url.startsWith("https://") ||
                                      anhItem.url.startsWith("data:") ||
                                      anhItem.url.startsWith("blob:"));

                                  return {
                                    id: anhItem.id || index + 1,
                                    url: isValidUrl
                                      ? anhItem.url
                                      : "/images/avatar-admin.png", // Fallback to existing image
                                    moTa: anhItem.moTa || "",
                                    anhChinh: anhItem.anhChinh || false,
                                    sanPhamId: edittingSanPham!.id,
                                  } as import("@/components/types/product.type").AnhSanPhamChiTiet;
                                }

                                // Handle case where item might be a string URL
                                if (typeof item === "string") {
                                  const isValidUrl =
                                    item &&
                                    (item.startsWith("http://") ||
                                      item.startsWith("https://") ||
                                      item.startsWith("data:") ||
                                      item.startsWith("blob:"));

                                  return {
                                    id: index + 1,
                                    url: isValidUrl
                                      ? item
                                      : "/images/avatar-admin.png",
                                    moTa: "",
                                    anhChinh: index === 0, // First image is main image
                                    sanPhamId: edittingSanPham!.id,
                                  } as import("@/components/types/product.type").AnhSanPhamChiTiet;
                                }

                                return null;
                              } catch (error) {
                                console.error(
                                  "Error parsing image item:",
                                  item,
                                  error
                                );
                                return null;
                              }
                            })
                            .filter(
                              (
                                img
                              ): img is import("@/components/types/product.type").AnhSanPhamChiTiet =>
                                !!img
                            );
                        };

                        const previewImages = parseAnhUrls(
                          edittingSanPham?.anhUrls
                        );
                        console.log(
                          "edittingSanPham.anhUrls:",
                          edittingSanPham?.anhUrls
                        );
                        console.log("previewImages:", previewImages);
                        console.log("Sample image URL:", previewImages[0]?.url);

                        // Ensure we have at least one image if the product has anhUrls but parsing failed
                        const finalPreviewImages =
                          previewImages.length > 0
                            ? previewImages
                            : edittingSanPham?.anhUrls &&
                              edittingSanPham.anhUrls.length > 0
                            ? [
                                {
                                  id: 0,
                                  url: "/images/avatar-admin.png",
                                  moTa: "",
                                  anhChinh: true,
                                  sanPhamId: edittingSanPham.id,
                                },
                              ]
                            : [];

                        // Lọc ảnh đã bị xóa tạm thời (có thể xóa cả ảnh cũ và mới)
                        const filteredImages = finalPreviewImages.filter(
                          (anh) => !deletedOldImages.includes(anh.id)
                        );
                        console.log("filteredImages:", filteredImages);
                        return filteredImages.length > 0 ? (
                          <div className="flex flex-wrap gap-3 mt-3">
                            {filteredImages.map((anh, idx) => {
                              return (
                                <div
                                  key={String(anh.id) + "-" + anh.url}
                                  className="relative w-24 h-24 border rounded overflow-hidden"
                                >
                                  <Image
                                    src={anh.url}
                                    alt={`Ảnh ${idx + 1}`}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to placeholder if image fails to load
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/images/avatar-admin.png";
                                    }}
                                  />
                                  {anh.anhChinh && (
                                    <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1 rounded-br">
                                      Ảnh chính
                                    </span>
                                  )}
                                  {/* Nút xóa ảnh cũ - chỉ hiển thị cho ảnh có id thật */}
                                  {anh.id > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeletedOldImages((prev) => [
                                          ...prev,
                                          anh.id,
                                        ])
                                      }
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
                              {idx === 0 &&
                                (() => {
                                  if (
                                    !edittingSanPham?.anhUrls ||
                                    edittingSanPham.anhUrls.length === 0
                                  ) {
                                    return true; // Sản phẩm mới, ảnh đầu tiên sẽ là ảnh chính
                                  }
                                  // Kiểm tra xem còn ảnh nào sau khi xóa ảnh cũ
                                  const remainingImages =
                                    edittingSanPham.anhUrls.filter(
                                      (anh) =>
                                        !deletedOldImages.includes(
                                          typeof anh === "object" ? anh.id : 0
                                        )
                                    );
                                  return remainingImages.length === 0; // Chỉ hiển thị nếu không còn ảnh nào
                                })() && (
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
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? edittingSanPham
                  ? "Đang cập nhật..."
                  : "Đang thêm..."
                : edittingSanPham
                ? "Cập nhật"
                : "Thêm mới"}
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
      {/* Dialogs for quick add */}
      <Dialog open={openDanhMuc} onOpenChange={setOpenDanhMuc}>
        <DialogContent className="bg-gray-800 text-white border-white/10">
          <DialogTitle className="sr-only">Thêm danh mục</DialogTitle>
          <ToastProvider>
            <LegoCategoryForm
              onSubmit={async (data) => {
                try {
                  const created = await addDanhMuc(data);
                  toast.success("Đã thêm danh mục!");
                  if (created && created.id) {
                    form.setValue("danhMucId", Number(created.id));
                  }
                  setOpenDanhMuc(false);
                } catch {
                  toast.error("Thêm danh mục thất bại");
                }
              }}
              onClearEdit={() => setOpenDanhMuc(false)}
            />
          </ToastProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={openBoSuuTap} onOpenChange={setOpenBoSuuTap}>
        <DialogContent className="bg-gray-800 text-white border-white/10">
          <DialogTitle className="sr-only">Thêm bộ sưu tập</DialogTitle>
          <LegoCollectionForm
            collectionToEdit={null}
            onSubmit={async (data) => {
              try {
                const created = await addBoSuuTap(data);
                toast.success("Đã thêm bộ sưu tập!");
                if (created && created.id) {
                  form.setValue("boSuuTapId", Number(created.id));
                }
                setOpenBoSuuTap(false);
              } catch {
                toast.error("Thêm bộ sưu tập thất bại");
              }
            }}
            onClearEdit={() => setOpenBoSuuTap(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openThuongHieu} onOpenChange={setOpenThuongHieu}>
        <DialogContent className="bg-gray-800 text-white border-white/10">
          <DialogTitle className="sr-only">Thêm thương hiệu</DialogTitle>
          <ThuongHieuForm
            thuongHieuToEdit={null}
            onSubmit={async (data) => {
              try {
                const created = await addThuongHieu(data);
                toast.success("Đã thêm thương hiệu!");
                if (created && created.id) {
                  form.setValue("thuongHieuId", Number(created.id));
                }
                setOpenThuongHieu(false);
              } catch {
                toast.error("Thêm thương hiệu thất bại");
              }
            }}
            onClearEdit={() => setOpenThuongHieu(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openXuatXu} onOpenChange={setOpenXuatXu}>
        <DialogContent className="bg-gray-800 text-white border-white/10">
          <DialogTitle className="sr-only">Thêm xuất xứ</DialogTitle>
          <XuatXuForm
            xuatXuToEdit={null}
            onSubmit={async (data) => {
              try {
                const created = await addXuatXu(data);
                toast.success("Đã thêm xuất xứ!");
                if (created && created.id) {
                  form.setValue("xuatXuId", Number(created.id));
                }
                setOpenXuatXu(false);
              } catch {
                toast.error("Thêm xuất xứ thất bại");
              }
            }}
            onClearEdit={() => setOpenXuatXu(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
