import { z } from "zod";

export const phieuGiamGiaSchema = z
  .object({
    soLuong: z
      .number({ required_error: "Số lượng không được để trống" })
      .min(1, { message: "Số lượng phải lớn hơn hoặc bằng 1" }),

    loaiPhieuGiam: z.enum(["Theo %", "Theo số tiền"], {
      required_error: "Không để trống loại phiếu giảm",
    }),

    giaTriGiam: z
      .number({ required_error: "Giá trị giảm không được để trống" })
      .gt(0, { message: "Giá trị giảm phải lớn hơn 0" }),

    giamToiDa: z
      .number({ required_error: "Giảm tối đa không được để trống" })
      .min(0, { message: "Giảm tối đa phải lớn hơn hoặc bằng 0" }),

    giaTriToiThieu: z
      .number({ required_error: "Giá trị tối thiểu không được để trống" })
      .min(0, { message: "Giá trị tối thiểu phải lớn hơn hoặc bằng 0" }),

    ngayBatDau: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    ngayKetThuc: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),

    trangThai: z.enum(["Đang hoạt động", "Ngừng", "Hết hạn"], {
      required_error: "Trạng thái không được để trống",
    }),
  })
  .refine((data) => data.ngayKetThuc >= data.ngayBatDau, {
    message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
    path: ["ngayKetThuc"],
  })
  .refine(
    (data) => (data.loaiPhieuGiam === "Theo %" ? data.giaTriGiam < 100 : true),
    {
      message: "Giá trị giảm (%) phải nhỏ hơn 100",
      path: ["giaTriGiam"],
    }
  )
  .refine(
    (data) =>
      data.loaiPhieuGiam === "Theo số tiền"
        ? data.giaTriGiam <= data.giamToiDa
        : true,
    {
      message: "Giá trị giảm không được lớn hơn giảm tối đa",
      path: ["giaTriGiam"],
    }
  );

export type PhieuGiamGiaData = z.infer<typeof phieuGiamGiaSchema>;
