export interface ShippingResult {
  phiShip: number;
  soNgayGiao: number;
}

export class ShippingCalculator {
  // Danh sách tỉnh miền Bắc
  private static mienBac = [
    "Hà Nội", "Bắc Ninh", "Cao Bằng", "Điện Biên", "Hải Phòng",
    "Lai Châu", "Lạng Sơn", "Lào Cai", "Ninh Bình", "Phú Thọ",
    "Quảng Ninh", "Sơn La", "Thái Nguyên", "Tuyên Quang"
  ];

  // Quận nội thành Hà Nội
  private static noiThanhHN = [
    "Ba Đình", "Hoàn Kiếm", "Đống Đa", "Hai Bà Trưng",
    "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên",
    "Tây Hồ", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông"
  ];

  static isMienBac(province: string): boolean {
    return this.mienBac.includes(province);
  }

  static getLoaiVanChuyen(fromProvince: string, toProvince: string): string {
    if (fromProvince.toLowerCase() === toProvince.toLowerCase()) {
      return "NOI_TINH";
    }
    if (fromProvince === "Hà Nội" && toProvince === "Đà Nẵng") {
      return "DAC_BIET";
    }
    if (fromProvince === "Hà Nội" && this.isMienBac(toProvince)) {
      return "NOI_MIEN";
    }
    return "LIEN_MIEN";
  }

  static isNoiThanh(province: string, district: string): boolean {
    if (province === "Hà Nội") {
      return this.noiThanhHN.includes(district);
    }
    return false;
  }

  static tinhPhiShip(loaiVanChuyen: string, khuVuc: string, weightKg: number): number {
    let base = 0;
    let extraWeight = 0;

    switch (loaiVanChuyen) {
      case "NOI_TINH":
        base = khuVuc === "Nội thành" ? 22000 : 30000;
        extraWeight = Math.max(0, weightKg - 3);
        base += 2500 * Math.ceil(extraWeight / 0.5);
        break;
      case "NOI_MIEN":
        base = khuVuc === "Nội thành" ? 30000 : 35000;
        extraWeight = Math.max(0, weightKg - 0.5);
        base += 2500 * Math.ceil(extraWeight / 0.5);
        break;
      case "DAC_BIET":
        base = khuVuc === "Nội thành" ? 30000 : 40000;
        extraWeight = Math.max(0, weightKg - 0.5);
        base += 5000 * Math.ceil(extraWeight / 0.5);
        break;
      case "LIEN_MIEN":
        base = khuVuc === "Nội thành" ? 32000 : 37000;
        extraWeight = Math.max(0, weightKg - 0.5);
        base += 5000 * Math.ceil(extraWeight / 0.5);
        break;
    }
    return base;
  }

  static tinhSoNgayGiao(loaiVanChuyen: string): number {
    switch (loaiVanChuyen) {
      case "NOI_TINH": return 1;
      case "NOI_MIEN": return 2;
      case "DAC_BIET": return 4;
      case "LIEN_MIEN": return 4;
      default: return 3;
    }
  }

  static calculateShipping(
    address: string,
    wardName: string,
    provinceName: string,
    isFast: number,
    totalWeight: number
  ): ShippingResult {
    const fromProvince = "Hà Nội";
    const loaiVanChuyen = this.getLoaiVanChuyen(fromProvince, provinceName);
    const khuVuc = this.isNoiThanh(provinceName, wardName) ? "Nội thành" : "Ngoại thành";

    console.log("=== DEBUG SHIPPING CALCULATION ===");
    console.log("From:", fromProvince, "To:", provinceName);
    console.log("Ward:", wardName, "District check:", this.isNoiThanh(provinceName, wardName));
    console.log("Loại vận chuyển:", loaiVanChuyen);
    console.log("Khu vực:", khuVuc);
    console.log("Trọng lượng:", totalWeight, "kg");
    console.log("Giao nhanh:", isFast === 1 ? "Có" : "Không");

    let phiShip = this.tinhPhiShip(loaiVanChuyen, khuVuc, totalWeight);
    let soNgayGiao = this.tinhSoNgayGiao(loaiVanChuyen);

    console.log("Phí ship cơ bản:", phiShip);

    // Phí giao hàng nhanh
    if (isFast === 1 && (loaiVanChuyen === "DAC_BIET" || loaiVanChuyen === "LIEN_MIEN")) {
      phiShip += 15000;
      soNgayGiao = Math.max(1, soNgayGiao - 1);
      console.log("Phí giao nhanh: +15,000đ");
    }

    console.log("Phí ship cuối cùng:", phiShip);
    console.log("=====================================");

    return { phiShip, soNgayGiao };
  }
}
