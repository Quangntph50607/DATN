import {
    TrangThaiPhieuHoan,
    TrangThaiThanhToan,
    PhieuHoanHang,
} from "@/components/types/hoanHang-types";
import { useState } from "react";
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaMoneyCheckAlt } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import { toast } from "sonner";
import {
    useCapNhatThanhToanPhieuHoanHang,
    useDuyetPhieuHoanHang,
    usePhieuHoanByTrangThai,
    useTuChoiPhieuHoanHang,
} from "@/hooks/useHoanHang";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const APPROVE_STATUS_LABELS = {
    CHO_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
};

const APPROVE_STATUS_COLOR = {
    CHO_DUYET: "bg-yellow-400 text-gray-800",
    DA_DUYET: "bg-green-500 text-white",
    TU_CHOI: "bg-red-500 text-white",
};

const REFUND_STATUS_LABELS = {
    CHUA_HOAN: "Chưa hoàn",
    DANG_HOAN: "Đang hoàn",
    DA_HOAN: "Hoàn xong",
};

const REFUND_STATUS_COLOR = {
    CHUA_HOAN: "bg-gray-500 text-white",
    DANG_HOAN: "bg-yellow-500 text-white",
    DA_HOAN: "bg-purple-500 text-white",
};

function formatMoney(value: number) {
    if (!value) return "";
    return value.toLocaleString("vi-VN") + "đ";
}

const TRANG_THAI_OPTIONS = [
    { value: TrangThaiPhieuHoan.CHO_DUYET, label: "Chờ duyệt", icon: <MdOutlinePendingActions /> },
    { value: TrangThaiPhieuHoan.DA_DUYET, label: "Đã duyệt", icon: <FaCheckCircle /> },
    { value: TrangThaiPhieuHoan.TU_CHOI, label: "Từ chối", icon: <FaTimesCircle /> },
];

export default function ReturnOrderManager() {
    // Bộ lọc trạng thái phiếu hoàn hàng (mặc định: CHO_DUYET)
    const [selectedTrangThai, setSelectedTrangThai] = useState<TrangThaiPhieuHoan>(TrangThaiPhieuHoan.CHO_DUYET);
    const [filterRefund, setFilterRefund] = useState<TrangThaiThanhToan | "ALL">("ALL");
    const [search, setSearch] = useState("");

    // Lấy danh sách phiếu hoàn hàng theo trạng thái
    const { data: phieuHoanData, isLoading, isError } = usePhieuHoanByTrangThai(selectedTrangThai);

    // Duyệt/Từ chối/Hoàn tiền API
    const duyetMutation = useDuyetPhieuHoanHang();
    const tuChoiMutation = useTuChoiPhieuHoanHang();
    const capNhatThanhToanMutation = useCapNhatThanhToanPhieuHoanHang();

    // Filter theo trạng thái hoàn tiền và tìm kiếm
    let filteredData: PhieuHoanHang[] = (phieuHoanData ?? []);
    if (filterRefund !== "ALL") {
        filteredData = filteredData.filter(d => d.trangThaiThanhToan === filterRefund);
    }
    if (search.trim()) {
        filteredData = filteredData.filter(d =>
            d.hoaDon?.maHD?.toLowerCase().includes(search.toLowerCase()) ||
            (d.chuTaiKhoan?.toLowerCase().includes(search.toLowerCase())) ||
            (d.hoaDon?.user?.ten?.toLowerCase().includes(search.toLowerCase())) ||
            d.chiTietHoanHangs?.some(ct =>
                ct.sanPham.tenSanPham.toLowerCase().includes(search.toLowerCase())
            )
        );
    }

    // Thống kê tổng số lượng theo trạng thái
    const stats = {
        total: phieuHoanData?.length ?? 0,
        refunded: filteredData.filter(d => d.trangThaiThanhToan === TrangThaiThanhToan.DA_HOAN).length,
    };

    // Xử lý nút
    const handleRefresh = () => {
        setFilterRefund("ALL");
        setSearch("");
        toast.info("Đã làm mới bộ lọc!");
    };

    const handleApprove = async (id: number) => {
        await duyetMutation.mutateAsync(id);
        toast.success("Duyệt đơn hoàn thành công!");
    };

    const handleReject = async (id: number) => {
        const lyDo = prompt("Nhập lý do từ chối:");
        if (!lyDo) return;
        await tuChoiMutation.mutateAsync({ id, lyDo });
        toast.success("Từ chối đơn hoàn thành công!");
    };

    const handleRefund = async (id: number) => {
        await capNhatThanhToanMutation.mutateAsync({ id, trangThai: TrangThaiThanhToan.DA_HOAN });
        toast.success("Hoàn tiền thành công!");
    };

    return (
        <main className=" " aria-label="Quản lý phiếu hoàn hàng">
            {/* Header stat cards */}
            <section className="flex flex-col md:flex-row gap-4 mb-6" aria-label="Thống kê phiếu hoàn hàng">
                <StatCard color="bg-blue-600" icon={<FaClipboardList />} label="Tổng phiếu" value={stats.total} />
                <StatCard color="bg-purple-600" icon={<FaMoneyCheckAlt />} label="Đã hoàn tiền" value={stats.refunded} />
            </section>

            {/* Filter + Table */}
            <section className="bg-gradient-to-br border-blue-500 rounded-xl shadow-lg pt-2" aria-label="Bộ lọc và bảng phiếu hoàn hàng">
                {/* Filter header */}
                <header className="flex flex-col md:flex-row justify-between items-center px-4 py-2 gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-white text-xl flex items-center gap-2">
                            <FaClipboardList className="inline" />
                            Danh Sách Phiếu Hoàn Hàng
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            className="px-3 py-2 rounded-lg bg-blue-950 text-white border border-blue-500 focus:border-blue-400 outline-none transition w-48"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Tìm kiếm phiếu hoàn hàng"
                        />
                        {/* Trạng thái phiếu hoàn hàng */}
                        <Select
                            value={selectedTrangThai}
                            onValueChange={v => setSelectedTrangThai(v as TrangThaiPhieuHoan)}
                        >
                            <SelectTrigger className="w-44 bg-blue-950 text-white border border-blue-500 focus:border-blue-400">
                                <SelectValue placeholder="Trạng thái phiếu" />
                            </SelectTrigger>
                            <SelectContent>
                                {TRANG_THAI_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Trạng thái hoàn tiền */}
                        <Select
                            value={filterRefund}
                            onValueChange={v => setFilterRefund(v as TrangThaiThanhToan | "ALL")}
                        >
                            <SelectTrigger className="w-36 bg-blue-950 text-white border border-blue-500 focus:border-blue-400">
                                <SelectValue placeholder="Trạng thái hoàn tiền" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả hoàn</SelectItem>
                                <SelectItem value={TrangThaiThanhToan.CHUA_HOAN}>Chưa hoàn</SelectItem>
                                <SelectItem value={TrangThaiThanhToan.DA_HOAN}>Đã hoàn tiền</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="default"
                            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 transition rounded-lg"
                            onClick={handleRefresh}
                            aria-label="Làm mới bộ lọc"
                        >
                            <IoMdRefresh className="text-lg" /> Làm mới
                        </Button>
                    </div>
                </header>
                {/* Table */}
                <div className="overflow-x-auto rounded-b-xl">
                    <Table className="min-w-full text-sm">
                        <TableHeader>
                            <TableRow className="bg-blue-950 text-white uppercase">
                                <TableHead className="px-3 py-2 font-semibold"># Mã Phiếu</TableHead>
                                {/* <TableHead className="px-3 py-2 font-semibold">Mã HĐ</TableHead> */}
                                <TableHead className="px-3 py-2 font-semibold">Loại hoàn</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Khách hàng</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Lý do</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Phương thức</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Ngân hàng</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">TK nhận</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Tên TK</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Sản phẩm hoàn</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Tổng tiền</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Duyệt Hoàn</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Hoàn Tiền</TableHead>
                                <TableHead className="px-3 py-2 font-semibold">Thao Tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell colSpan={14}>
                                            <Skeleton className="h-8 w-full bg-blue-950/80" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={14} className="text-center py-6 text-white">
                                        Không có phiếu hoàn hàng nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="px-3 py-2 font-bold text-purple-400">{order.id}</TableCell>
                                        {/* <TableCell className="px-3 py-2 font-bold text-blue-400">{order.hoaDon?.maHD ?? "--"}</TableCell> */}
                                        <TableCell className="px-3 py-2">{order.loaiHoan}</TableCell>
                                        <TableCell className="px-3 py-2">{order.chuTaiKhoan ?? order.hoaDon?.ten ?? "--"}</TableCell>
                                        <TableCell className="px-3 py-2 text-yellow-400">{order.lyDo}</TableCell>
                                        <TableCell className="px-3 py-2">{order.phuongThucHoan}</TableCell>
                                        <TableCell className="px-3 py-2">{order.tenNganHang}</TableCell>
                                        <TableCell className="px-3 py-2">{order.soTaiKhoan}</TableCell>
                                        <TableCell className="px-3 py-2">{order.chuTaiKhoan}</TableCell>
                                        <TableCell className="px-3 py-2">
                                            {order.chiTietHoanHangs?.map(ct =>
                                                ct.sanPham && ct.sanPham.tenSanPham ? (
                                                    <span key={ct.id}>{ct.sanPham.tenSanPham} x {ct.soLuongHoan}<br /></span>
                                                ) : (
                                                    <span key={ct.id}>Sản phẩm không xác định x {ct.soLuongHoan}<br /></span>
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell className="px-3 py-2 font-bold text-green-400">{formatMoney(order.tongTienHoan)}</TableCell>
                                        <TableCell className="px-3 py-2">
                                            <Badge className={APPROVE_STATUS_COLOR[order.trangThai]}>
                                                {APPROVE_STATUS_LABELS[order.trangThai]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-3 py-2">
                                            <Badge className={REFUND_STATUS_COLOR[order.trangThaiThanhToan]}>
                                                {REFUND_STATUS_LABELS[order.trangThaiThanhToan]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-3 py-2 flex gap-2 flex-wrap">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
                                                aria-label={`Xem chi tiết phiếu ${order.id}`}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            {order.trangThai === TrangThaiPhieuHoan.CHO_DUYET && (
                                                <>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-500 hover:bg-green-400 text-white rounded-lg text-xs font-semibold transition"
                                                        onClick={() => handleApprove(order.id)}
                                                        disabled={duyetMutation.isPending}
                                                        aria-label={`Duyệt phiếu ${order.id}`}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-semibold transition"
                                                        onClick={() => handleReject(order.id)}
                                                        disabled={tuChoiMutation.isPending}
                                                        aria-label={`Từ chối phiếu ${order.id}`}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </>
                                            )}
                                            {order.trangThai === TrangThaiPhieuHoan.DA_DUYET &&
                                                order.trangThaiThanhToan !== TrangThaiThanhToan.DA_HOAN && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
                                                        onClick={() => handleRefund(order.id)}
                                                        disabled={capNhatThanhToanMutation.isPending}
                                                        aria-label={`Hoàn tiền phiếu ${order.id}`}
                                                    >
                                                        Hoàn tiền
                                                    </Button>
                                                )}
                                            {order.trangThaiThanhToan === TrangThaiThanhToan.DA_HOAN && (
                                                <Badge className="bg-gray-500 text-white rounded-lg text-xs font-semibold">
                                                    Đã hoàn xong
                                                </Badge>
                                            )}
                                            {order.trangThai === TrangThaiPhieuHoan.TU_CHOI && (
                                                <Badge className="bg-gray-500 text-white rounded-lg text-xs font-semibold">
                                                    Đã xử lý
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </main>
    );
}

// Card thống kê
type StatCardProps = {
    color: string;
    icon: React.ReactNode;
    label: string;
    value: number | string;
};

function StatCard({ color, icon, label, value }: StatCardProps) {
    return (
        <div
            className={`flex-1 rounded-lg p-4 shadow flex flex-col items-center justify-center relative ${color} min-w-[120px] text-white`}
        >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-semibold text-base">{label}</div>
            <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
    );
}