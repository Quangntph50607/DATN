import { z } from "zod";

export const thongTinNguoiNhanSchema = z.object({
  hoTen: z
    .string()
    .min(6, "Tên người nhận phải từ 6 ký tự")
    .max(50, "Tên người nhận tối đa 50 ký tự")
    .regex(/^[\p{L}\p{N} ]+$/u, "Tên không được chứa ký tự đặc biệt"),

  sdt: z
    .string()
    .regex(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và đủ 10 chữ số"),

  duong: z.string().min(1, "Vui lòng nhập tên đường"),

  xa: z.string().min(1, "Vui lòng nhập tên xã/phường"),

  thanhPho: z.string().min(1, "Vui lòng nhập tên thành phố"),

  isMacDinh: z.boolean().optional(),

  // Không bắt buộc trong form, sẽ gán thủ công khi submit
  idUser: z.number().optional(),

  // Email tùy chọn cho guest checkout
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
});

export type ThongTinNguoiNhanForm = z.infer<typeof thongTinNguoiNhanSchema>;
