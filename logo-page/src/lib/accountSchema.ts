import { z } from "zod";

export const accountSchema = z.object({
  ten: z.string().min(1, "Vui lòng nhập tên").max(100, "Tên không được quá 100 ký tự"),
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
  matKhau: z.string().min(6, "Mật khẩu ít nhất 6 ký tự").max(50, "Mật khẩu không được quá 50 ký tự"),
  sdt: z.string().min(10, "SĐT phải có ít nhất 10 số").max(11, "SĐT không được quá 11 số").regex(/^\d+$/, "SĐT chỉ được chứa số"),
  diaChi: z.string().min(1, "Vui lòng nhập địa chỉ").max(200, "Địa chỉ không được quá 200 ký tự"),
  roleId: z.number({
    required_error: "Vui lòng chọn vai trò",
  }).min(1, "Vui lòng chọn vai trò"),
  trangThai: z.number().min(0).max(1),
});

export type AccountFormData = z.infer<typeof accountSchema>;