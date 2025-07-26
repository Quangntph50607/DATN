// lib/schemas/productSchema.ts
import { z } from "zod";

export function productSchema(isEdit: boolean) {
  return z.object({
    tenSanPham: z.string().nonempty("Tên sản phẩm là bắt buộc").max(200),
    gia: z.number().min(1000, "Giá tối thiểu là 1000 VNĐ"),
    soLuongTon: z.number().min(0, "Số lượng tồn phải >= 0"),
    soLuongManhGhep: z.number().min(0, "Phải có ít nhất 1 mảnh ghép"),
    moTa: z.string().nonempty("Mô tả không để trống").max(1000),
    doTuoi: z.number().min(6).max(50),
    trangThai: z.string().nonempty(),
    noiBat: z.boolean().optional(),
    danhMucId: z.number({ required_error: "Phải chọn danh mục" }),
    boSuuTapId: z.number({ required_error: "Phải chọn bộ sưu tập" }),
    xuatXuId: z.number({ required_error: "Phải chọn xuất xứ" }),
    thuongHieuId: z.number({ required_error: "Phải chọn thương hiệu" }),
    files: isEdit
      ? z
        .custom<FileList>((files) => files instanceof FileList, {
          message: "Phải chọn ảnh hợp lệ",
        })
        .optional()
      : z
        .custom<FileList>((files) => files instanceof FileList, {
          message: "Phải chọn ảnh hợp lệ",
        })
        .refine((files) => files.length > 0, {
          message: "Phải chọn ít nhất 1 ảnh",
        })
        .refine((files) => files.length <= 5, {
          message: "Tối đa 5 ảnh",
        }),
  });
}

export const productAddSchema = productSchema(false);
export const productEditSchema = productSchema(true);
export type ProductData = z.infer<ReturnType<typeof productSchema>>;

