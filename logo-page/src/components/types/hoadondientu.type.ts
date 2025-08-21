export interface HoaDonSanPham {
  ten: string; // Tên sản phẩm
  ma: string; // Mã sản phẩm
  gia: string; // Giá sản phẩm (VNĐ, dạng string)
  soLuong: number; // Số lượng sản phẩm
  tongTien: string; // Tổng tiền sản phẩm (VNĐ, dạng string)
}

export interface GuiHoaDonRequest {
  idHD: number; // ID hóa đơn
  toEmail: string; // Email người nhận
  tenKH: string; // Tên khách hàng
  maHD: string; // Mã hóa đơn
  ngayTao: string; // Ngày tạo hóa đơn (dd/MM/yyyy)
  diaChi: string; // Địa chỉ giao hàng
  pttt: string; // Phương thức thanh toán
  ptvc: string; // Phương thức vận chuyển
  listSp: HoaDonSanPham[]; // Danh sách sản phẩm
  totalAmount: string; // Tổng tiền hóa đơn (VNĐ, dạng string)
  tienGiam: string;
  phiShip: string;
}
export interface GuiHoaDonResponse {
  status: number; // Mã trạng thái HTTP
  message: string; // Thông báo từ API
}
