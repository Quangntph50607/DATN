export interface ShippingResult {
  phiShip: number;
  soNgayGiao: number;
}

export class ShippingCalculator {
  // Chuẩn hóa chuỗi: bỏ dấu, hạ chữ, bỏ tiền tố hành chính và khoảng trắng thừa
  private static normalizeText(input: string): string {
    if (!input) return "";
    const noDiacritics = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lower = noDiacritics.toLowerCase().trim();
    // Bỏ các tiền tố hành chính phổ biến ở Việt Nam
    const removedPrefixes = lower
      .replace(
        /^(tinh|thanh pho|tp\.?|tp\s|do thi|thi xa|thi tran|quan|huyen|phuong|xa|thi tran)\s+/g,
        ""
      )
      .replace(/^tp\.?\s+/g, "");
    return removedPrefixes.replace(/\s+/g, " ").trim();
  }

  // Danh sách tỉnh miền Bắc
  private static mienBac = [
    "Hà Nội",
    "Bắc Ninh",
    "Cao Bằng",
    "Điện Biên",
    "Hải Phòng",
    "Lai Châu",
    "Lạng Sơn",
    "Lào Cai",
    "Ninh Bình",
    "Phú Thọ",
    "Quảng Ninh",
    "Sơn La",
    "Thái Nguyên",
    "Tuyên Quang",
  ];

  // Danh sách chuẩn hóa để so sánh không dấu/không tiền tố
  private static mienBacNormalized = ShippingCalculator.mienBac.map((p) =>
    ShippingCalculator.normalizeText(p)
  );

  // Quận nội thành Hà Nội
  private static noiThanhHN = [
    "Ba Đình",
    "Hoàn Kiếm",
    "Đống Đa",
    "Hai Bà Trưng",
    "Cầu Giấy",
    "Thanh Xuân",
    "Hoàng Mai",
    "Long Biên",
    "Tây Hồ",
    "Nam Từ Liêm",
    "Bắc Từ Liêm",
    "Hà Đông",
  ];

  private static noiThanhHNNormalized = ShippingCalculator.noiThanhHN.map((d) =>
    ShippingCalculator.normalizeText(d)
  );

  static isMienBac(province: string): boolean {
    const pv = this.normalizeText(province);
    return this.mienBacNormalized.includes(pv);
  }

  static getLoaiVanChuyen(fromProvince: string, toProvince: string): string {
    const fromN = this.normalizeText(fromProvince);
    const toN = this.normalizeText(toProvince);

    if (fromN === toN) {
      return "NOI_TINH";
    }
    if (
      fromN === this.normalizeText("Hà Nội") &&
      toN === this.normalizeText("Đà Nẵng")
    ) {
      return "DAC_BIET";
    }
    if (fromN === this.normalizeText("Hà Nội") && this.isMienBac(toProvince)) {
      return "NOI_MIEN";
    }
    return "LIEN_MIEN";
  }

  static isNoiThanh(province: string, district: string): boolean {
    const pv = this.normalizeText(province);
    const dt = this.normalizeText(district);
    if (pv === this.normalizeText("Hà Nội")) {
      return this.noiThanhHNNormalized.includes(dt);
    }
    return false;
  }

  static tinhPhiShip(
    loaiVanChuyen: string,
    khuVuc: string,
    weightKg: number
  ): number {
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
      case "NOI_TINH":
        return 1;
      case "NOI_MIEN":
        return 2;
      case "DAC_BIET":
        return 4;
      case "LIEN_MIEN":
        return 4;
      default:
        return 3;
    }
  }

  static calculateShipping(
    wardOrDistrictName: string,
    provinceName: string,
    isFast: number,
    totalWeight: number
  ): ShippingResult {
    const fromProvince = "Hà Nội";
    const loaiVanChuyen = this.getLoaiVanChuyen(fromProvince, provinceName);
    const khuVuc = this.isNoiThanh(provinceName, wardOrDistrictName)
      ? "Nội thành"
      : "Ngoại thành";

    console.log("=== DEBUG SHIPPING CALCULATION ===");
    console.log("From:", fromProvince, "To:", provinceName);
    console.log(
      "Ward/District:",
      wardOrDistrictName,
      "District check:",
      this.isNoiThanh(provinceName, wardOrDistrictName)
    );
    console.log("Loại vận chuyển:", loaiVanChuyen);
    console.log("Khu vực:", khuVuc);
    console.log("Trọng lượng:", totalWeight, "kg");
    console.log("Giao nhanh:", isFast === 1 ? "Có" : "Không");

    let phiShip = this.tinhPhiShip(loaiVanChuyen, khuVuc, totalWeight);
    let soNgayGiao = this.tinhSoNgayGiao(loaiVanChuyen);

    console.log("Phí ship cơ bản:", phiShip);

    // Phí giao hàng nhanh
    if (
      isFast === 1 &&
      (loaiVanChuyen === "DAC_BIET" || loaiVanChuyen === "LIEN_MIEN")
    ) {
      phiShip += 15000;
      soNgayGiao = Math.max(1, soNgayGiao - 1);
      console.log("Phí giao nhanh: +15,000đ");
    }
    return { phiShip, soNgayGiao };
  }
}
