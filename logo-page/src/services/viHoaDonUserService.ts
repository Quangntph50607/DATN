import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";

const API_URL = "http://localhost:8080/api/lego-store/vi-phieu-giam-gia";

export const viPhieuGiamGiaService = {
  async getHoaDonTheoUser(
    userId: number,
    trangThai: string
  ): Promise<PhieuGiamGiaResponse[]> {
    const params = trangThai ? `?trangThai=${trangThai}` : "";
    const res = await fetch(`${API_URL}/user/${userId}${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        "Không thể lấy phiếu giảm giá cho user: " + JSON.stringify(error)
      );
    }
    return res.json();
  },
};
