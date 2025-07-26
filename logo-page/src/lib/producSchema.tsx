import { z } from "zod";

export const sanPhamCreateSchema = z.object({
  tenSanPham: z.string().nonempty("Tên sản phẩm không được để trống"),
  doTuoi: z.number({ required_error: "Vui lòng nhập độ tuổi" }),
  moTa: z.string().nonempty("Mô tả không được để trống"),
  gia: z.number({ required_error: "Giá là bắt buộc" }),
  soLuongManhGhep: z.number(),
  soLuongTon: z.number(),
  danhMucId: z.number({ required_error: "Danh mục là bắt buộc" }),
  boSuuTapId: z.number().nullable().optional(),
  // maSanPham: z.string().optional(),
  trangThai: z.string().default("Đang kinh doanh"),

  files: z
    .custom<FileList>(
      (files) => files instanceof FileList && files.length > 0,
      {
        message: "Cần chọn ít nhất một ảnh",
      }
    )
    .refine((files) => files.length <= 5, {
      message: "Tối đa 5 ảnh",
    }),
});
export type SanPhamCreateInput = z.infer<typeof sanPhamCreateSchema>;
