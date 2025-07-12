import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  useAddAnhSanPham,
  useAnhSanPhamTheoSanPhamId,
  useSuaAnhSanPham,
  useXoaAnhSanPham,
} from "@/hooks/useAnhSanPham";
import { AnhSanPhamData, anhSanPhamSchema } from "@/lib/sanphamschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import { EyeIcon, PlusCircle, Trash2Icon, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
interface Props {
  sanPhamId: number;
  maSanPham: string;
  tenSanPham: string;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}
export default function AnhSanPhamManager({
  sanPhamId,
  maSanPham,
  tenSanPham,
  trigger = <PlusCircle size={4} />,
  open,
  onOpenChange,
}: Props) {
  const [preview, setPreview] = useState<string[]>([]);
  const { mutate: addAnhSanPham, isPending } = useAddAnhSanPham();
  const { mutate: xoaAnh } = useXoaAnhSanPham();
  const { data: anhSp = [] } = useAnhSanPhamTheoSanPhamId(sanPhamId);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const useOrders = anhSp.map((a) => a.thuTu);
  // const availableOrders = soThuTu.filter((stt) => !useOrders.includes(stt));

  console.log(anhSp);
  const form = useForm<AnhSanPhamData>({
    resolver: zodResolver(anhSanPhamSchema),
    defaultValues: {
      sanPhamId,
      anhChinh: false,
    },
  });
  function onSubmit(data: AnhSanPhamData) {
    if (editMode) {
      const formData = new FormData();
      // formData.append("thuTu", data.thuTu?.toString() ?? "");
      formData.append("anhChinh", data.anhChinh ? "true" : "false");
      formData.append("sanPhamId", data.sanPhamId.toString());
      if (data.file) {
        formData.append("file", data.file);
      }
      // suaAnhSanPham(
      //   {
      //     id: anhDangSua.id,
      //     data: {
      //       file: data.file?.[0],
      //       // thuTu: data.thuTu,
      //       anhChinh: data.anhChinh,
      //       sanPhamId,
      //     },
      //   },
      //   {
      //     onSuccess: () => {
      //       toast.success("Cập nhật thành công");
      //       form.reset();
      //       setAnhDangSua(null);
      //       setEditMode(false);
      //       setPreview(null);
      //       if (fileInputRef.current) {
      //         fileInputRef.current.value = "";
      //       }
      //     },
      //   }
      // );
    } else {
      if (data.file) {
        const files = data.file ? Array.from(data.file as FileList) : [];
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
        ];
        const invalidFiles = files.filter(
          (file) => !validTypes.includes(file.type)
        );
        if (invalidFiles.length > 0) {
          toast.error("Chỉ cho phép file .jpeg, .png, .jpg, .gif!");
          return;
        }
        if (files.length > 0) {
          addAnhSanPham(
            {
              files,
              sanPhamId,
              anhChinh: data.anhChinh,
            },
            {
              onSuccess: () => {
                form.reset({
                  sanPhamId,
                  anhChinh: false,
                  file: undefined,
                  moTa: "",
                });
                setPreview([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                toast.success("Thêm ảnh thành công");
              },
            }
          );
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="bg-gray-800 max-w-none w-[98vw] xl:w-[1800px] rounded-xl overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Quản lý ảnh sản phẩm với mã {maSanPham}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Tên sản phẩm: {tenSanPham ?? "Không rõ"}
          </p>

          {/* Form Ảnh */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => {
                          const files = e.target.files;
                          const anhToiDa = 5;
                          const soAnhDaCo = anhSp.length;
                          const soAnhConLai = anhToiDa - soAnhDaCo;
                          if (files && files.length > soAnhConLai) {
                            toast.error(
                              `Sản phẩm đã có ${soAnhDaCo}. Chỉ thêm tối đa ${soAnhConLai} ảnh nữa !`
                            );
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                            return;
                          }
                          if (files && files.length > 0) {
                            const previews = Array.from(files).map((file) =>
                              URL.createObjectURL(file)
                            );
                            setPreview(previews);
                            field.onChange(e.target.files);
                          }
                        }}
                      />
                    </FormControl>
                    {preview.length > 0 && (
                      <div className="flex flex-wrap gap-2 relative mt-2">
                        {preview.map((src, idx) => (
                          <Image
                            key={idx}
                            src={src}
                            alt="preview"
                            width={100}
                            height={100}
                            unoptimized
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="thuTu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn số thứ tự" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrders.length === 0 ? (
                            <p className="text-sm px-4 py-2 text-muted-foreground">
                              Đã hết số thứ tự
                            </p>
                          ) : (
                            availableOrders.map((stt) => (
                              <SelectItem key={stt} value={stt.toString()}>
                                {stt}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="anhChinh"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="anhChinh"
                      />
                    </FormControl>
                    <FormLabel htmlFor="anhChinh">Ảnh chính</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {editMode
                    ? isPending
                      ? "Đang cập nhật..."
                      : "Cập nhật ảnh"
                    : isPending
                    ? "Đang tải lên... "
                    : "Tải ảnh lên"}
                </Button>
                {/* {editMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setAnhDangSua(null);
                      form.reset();
                      setPreview(null);
                    }}
                  >
                    Hủy chỉnh sửa
                  </Button>
                )} */}
              </div>
            </form>
          </Form>
          {/* Danh sách ảnh */}
          <div className="grid grid-cols-4 gap-4 mt-3 rounded-2xl">
            {anhSp.length === 0 ? (
              <p>Chưa có ảnh cho sản phẩm</p>
            ) : (
              anhSp.map((anh: AnhSanPhamChiTiet, idx) => (
                <div
                  key={anh.id ?? idx}
                  className="relative group border border-gray-200 rounded-xl p-2 shadow-md"
                >
                  <Image
                    src={`http://localhost:8080/api/anhsp/images/${anh.url}`}
                    alt="Ảnh sản phẩm"
                    width={128}
                    height={128}
                    unoptimized
                    className="w-full aspect-square object-cover rounded"
                  />

                  {/* <p className="text-sm mt-2">Thứ tự ảnh: {anh.thuTu} </p> */}
                  {anh.anhChinh && (
                    <span className="absolute top-1 left-1  bg-green-500 text-white text-xs px-1 rounded ">
                      Ảnh chính
                    </span>
                  )}
                  <div className="flex items-center gap-2 justify-between">
                    <Button
                      onClick={() => {
                        if (anh.id) {
                          xoaAnh(anh.id);
                          toast.success("Xóa ảnh thành công!");
                        } else {
                          console.error("ID ảnh không hợp lệ:", anh);
                          toast.error("ID ảnh không hợp lệ, không thể xóa.");
                        }
                      }}
                      className=" size-7 text-red-500 hover:text-red-700"
                      title="Xóa ảnh"
                    >
                      <Trash2Icon size={16} />
                    </Button>
                    {/* <Button
                      onClick={() => {
                        setEditMode(true);
                        setAnhDangSua(anh);
                        setPreview(
                          `http://localhost:8080/api/anhsp/images/${anh.url}`
                        );
                        form.reset({
                          sanPhamId,
                          // thuTu: anh.thuTu,
                          anhChinh: anh.anhChinh,
                        });
                      }}
                      className="size-7 text-blue-500 hover:text-blue-700"
                      title="Chỉnh sửa ảnh"
                    >
                      <Edit size={16} />
                    </Button> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
