import { Button } from "@/components/ui/button";
import { Edit, Eye, SwitchCameraIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";

interface Props {
  sanPhams: KhuyenMaiTheoSanPham[];
  onEdit: (product: KhuyenMaiTheoSanPham) => void;
  onDelete: (id: number) => void;
}

export default function SanPhamTable({ sanPhams, onDelete, onEdit }: Props) {
  const { data: xuatXuList = [] } = useXuatXu();
  const { data: thuongHieuList = [] } = useThuongHieu();
  const getTenXuatXu = (id: number) => {
    if (!id) return "Không rõ";
    return xuatXuList.find((x) => x.id === id)?.ten || "Không rõ";
  };
  const getTenThuongHieu = (id: number) => {
    if (!id) return "Không rõ";
    return thuongHieuList.find((t) => t.id === id)?.ten || "Không rõ";
  };
  // const getTenDanhMuc = (id: number) =>
  //   danhMucs.find((dm) => dm.id === id)?.tenDanhMuc || "Không rõ";

  // const getTenBST = (id: number) =>
  //   boSuuTaps.find((bst) => bst.id === id)?.tenBoSuuTap || "Không rõ";
  const sortSanPham = [...sanPhams].sort((a, b) => b.id - a.id);

  return (
    <div className="border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead className="whitespace-nowrap">STT</TableHead>
            <TableHead className="whitespace-nowrap">Mã sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap">Tên sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap">Độ tuổi</TableHead>
            <TableHead className="whitespace-nowrap">Giá</TableHead>
            <TableHead className="whitespace-nowrap">SL Tồn</TableHead>
            <TableHead className="whitespace-nowrap">% Khuyến mãi</TableHead>
            <TableHead className="whitespace-nowrap">Giá khuyến mãi</TableHead>
            <TableHead className="whitespace-nowrap">Trạng Thái</TableHead>
            <TableHead className="whitespace-nowrap">Xuất xứ</TableHead>
            <TableHead className="whitespace-nowrap">Thương hiệu</TableHead>
            <TableHead className="whitespace-nowrap">Nổi bật</TableHead>
            <TableHead className="whitespace-nowrap text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortSanPham.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                Không có sản phẩm nào
              </TableCell>
            </TableRow>
          ) : (
            sortSanPham.map((sp, index) => (
              <TableRow key={sp.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="max-w-[100px] truncate">{sp.maSanPham}</TableCell>
                <TableCell className="max-w-[250px] truncate">{sp.tenSanPham}</TableCell>
                <TableCell>{sp.doTuoi}</TableCell>
                <TableCell>{sp.gia.toLocaleString()}đ</TableCell>
                <TableCell>{sp.soLuongTon}</TableCell>

                <TableCell>
                  {sp.phanTramKhuyenMai ? `${sp.phanTramKhuyenMai}%` : "-"}
                </TableCell>
                <TableCell>
                  {sp.giaKhuyenMai
                    ? `${sp.giaKhuyenMai.toLocaleString()} đ`
                    : "-"}
                </TableCell>
                <TableCell>
                  {sp.trangThai === "Đang kinh doanh" ? (
                    <span className="text-green-600 font-semibold">Đang kinh doanh</span>
                  ) : sp.trangThai === "Ngừng kinh doanh" ? (
                    <span className="text-yellow-500 font-semibold">Ngừng kinh doanh</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Hết hàng</span>
                  )}
                </TableCell>
                <TableCell>{getTenXuatXu(sp.xuatXuId ?? 0)}</TableCell>
                <TableCell>{getTenThuongHieu(sp.thuongHieuId ?? 0)}</TableCell>
                <TableCell>
                  {sp.noiBat === 1 || sp.noiBat === true ? (
                    <span className="text-yellow-500 font-bold">★</span>
                  ) : (
                    <span className="text-gray-400">☆</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    {/* <AnhSanPhamManager
                      sanPhamId={sp.id}
                      maSanPham={sp.maSanPham ?? ""}
                      tenSanPham={sp.tenSanPham}
                      trigger={
                        <Button title="Ảnh sản phẩm">
                          <PlusCircle className="size-4 text-gray-700" />
                        </Button>
                      }
                    /> */}
                    <Button title="Chi tiết sửa">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button onClick={() => onEdit(sp)} title="Chỉnh sửa">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button onClick={() => onDelete(sp.id)} title="Chuyển trạng thái">
                      <SwitchCameraIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
