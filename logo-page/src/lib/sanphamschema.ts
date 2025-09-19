// lib/schemas/productSchema.ts
import { z } from "zod";

export function productSchema(isEdit: boolean) {
  return z.object({
    tenSanPham: z.string().nonempty("Tên sản phẩm là bắt buộc").max(200),
    gia: z
      .number({
        required_error: "Vui lòng nhập giá",
        invalid_type_error: "Giá phải là số",
      })
      .min(10, { message: "Giá tối thiểu là 10 VNĐ" }),

    soLuongTon: z
      .number({ required_error: "Vui lòng nhập số lượng tồn" })
      .min(0, "Số lượng tồn phải >= 0"),
    soLuongManhGhep: z
      .number({ required_error: "Vui lòng chọn nhập số lượng mảnh ghép" })
      .min(0, "Phải có ít nhất 1 mảnh ghép"),
    moTa: z.string().nonempty("Mô tả không để trống").max(1000),
    doTuoi: z
      .number({ required_error: "Vui lòng nhập độ tuổi" })
      .min(2, { message: "Độ tuổi phải từ 2 trở lên" })
      .max(18, { message: "Độ tuổi phải nhỏ hơn hoặc bằng 18" }),
    trangThai: z.string().nonempty(),
    noiBat: z.boolean().optional(),
    danhMucId: z.number({ required_error: "Phải chọn danh mục" }),
    boSuuTapId: z.number({ required_error: "Phải chọn bộ sưu tập" }),
    xuatXuId: z.number({ required_error: "Phải chọn xuất xứ" }),
    thuongHieuId: z.number({ required_error: "Phải chọn thương hiệu" }),
    files: isEdit
      ? z.instanceof(FileList).optional()
      : z
          .instanceof(FileList, { message: "Ảnh không được để trống" })
          .refine((files) => files && files.length > 0, {
            message: "Phải chọn ít nhất 1 ảnh",
          })
          .refine((files) => files && files.length <= 10, {
            message: "Tối đa 10 ảnh",
          }),
  });
}

export const productAddSchema = productSchema(false);
export const productEditSchema = productSchema(true);
export type ProductData = z.infer<ReturnType<typeof productSchema>>;

// Type cho việc edit sản phẩm không có files
export type ProductDataWithoutFiles = Omit<ProductData, "files">;
