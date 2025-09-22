"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { sanPhamService } from "@/services/sanPhamService";
import { palette } from "../../palette";
import { CreditCard, Wallet, Info } from "lucide-react"; // Thêm icon cho toast
import { toast } from "sonner";
import { useTaoPhieuHoanHangWithFile } from "@/hooks/useHoanHang";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ReturnForm() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returnType, setReturnType] = useState<"partial" | "full">("partial");
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | undefined>(
    undefined
  );
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | undefined>(
    undefined
  );
  const [refundMethod, setRefundMethod] = useState<"bank" | "store">("bank");
  const [bankOwner, setBankOwner] = useState<string>("");
  const [bankNumber, setBankNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [errors, setErrors] = useState<{
    items?: string;
    itemQty?: Record<number, string>;
    reason?: string;
    video?: string;
    bankOwner?: string;
    bankNumber?: string;
    bankName?: string;
  }>({ itemQty: {} });

  const [openDialog, setOpenDialog] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  type SelectableItem = {
    productId: number;
    name: string;
    unitPrice: number;
    maxQuantity: number;
    selected: boolean;
    quantity: number;
  };
  const [items, setItems] = useState<SelectableItem[]>([]);
  const taoPhieuHoan = useTaoPhieuHoanHangWithFile();

  // Function format ngày tháng
  const formatDate = (dateInput: any) => {
    try {
      if (!dateInput) return "Không xác định";

      let date: Date;

      // Xử lý trường hợp ngayTao là array [year, month, day, hour, minute, second, nanoseconds]
      if (Array.isArray(dateInput) && dateInput.length >= 6) {
        console.log("Xử lý array date:", dateInput);
        // Array format: [year, month, day, hour, minute, second, nanoseconds]
        const [year, month, day, hour, minute, second, nanoseconds] = dateInput;

        // Chuyển nanoseconds thành milliseconds (chia cho 1,000,000)
        const milliseconds = nanoseconds
          ? Math.floor(nanoseconds / 1000000)
          : 0;

        // Tạo Date object (month trong array là 0-based, nên cần -1)
        date = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          second,
          milliseconds
        );

        console.log("Date created from array:", date);
      } else if (
        typeof dateInput === "string" ||
        typeof dateInput === "number"
      ) {
        // Xử lý string hoặc timestamp
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        console.log("Unknown date format:", typeof dateInput, dateInput);
        return "Định dạng ngày không hỗ trợ";
      }

      if (isNaN(date.getTime())) {
        console.log("Invalid date:", date);
        return "Ngày không hợp lệ";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Lỗi format ngày:", error, "Input:", dateInput);
      return "Lỗi hiển thị ngày";
    }
  };

  // Function xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);

      // Tạo preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  // Function xử lý chọn video
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);

      // Tạo preview URL
      const preview = URL.createObjectURL(file);
      setPreviewVideo(preview);
    }
  };

  // Function xóa ảnh
  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewImages(newPreviews);

    // Revoke URL để tránh memory leak
    URL.revokeObjectURL(previewImages[index]);
  };

  // Function xóa video
  const removeVideo = () => {
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    setSelectedVideo(undefined);
    setPreviewVideo(undefined);
  };

  // Cleanup URLs khi component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      if (previewVideo) {
        URL.revokeObjectURL(previewVideo);
      }
    };
  }, [previewImages, previewVideo]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Debug: Kiểm tra token và user info
        const token = localStorage.getItem("access_token");
        const numericId = Number(id);
        const orderData = await HoaDonService.getHoaDonById(numericId);
        const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(
          numericId
        );
        const enriched = {
          ...orderData,
          chiTietSanPham: (chiTiet || []).map((ct: any) => ({
            sanPham: ct.spId,
            soLuong: ct.soLuong,
          })),
        };

        // Đảm bảo có thông tin user
        if (!enriched.user && enriched.userId) {
          enriched.user = { id: enriched.userId };
        }

        // Debug: Kiểm tra dữ liệu ngày
        console.log("Order data keys:", Object.keys(enriched));
        console.log("Ngày đặt (ngayTao):", enriched.ngayTao);
        console.log("Ngày đặt type:", typeof enriched.ngayTao);
        console.log("Ngày đặt formatted:", formatDate(enriched.ngayTao));

        setOrder(enriched);
        let productMap: Record<number, any> = {};
        try {
          const allProducts = await sanPhamService.getSanPhams();
          productMap = Object.fromEntries(
            (allProducts || []).map((p: any) => [p.id, p])
          );
        } catch {
          productMap = {};
        }
        const selectable: SelectableItem[] = (chiTiet || []).map((ct: any) => {
          const pid =
            typeof ct.spId === "object" ? ct.spId.id : Number(ct.spId);
          const product =
            typeof ct.spId === "object" ? ct.spId : productMap[pid];
          return {
            productId: pid,
            name: product?.tenSanPham || `Sản phẩm #${pid}`,
            unitPrice: Number(product?.gia ?? ct.gia ?? 0),
            maxQuantity: Number(ct.soLuong || 1),
            selected: true,
            quantity: Number(ct.soLuong || 1),
          } as SelectableItem;
        });
        setItems(selectable);
      } catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Validate và mở dialog xác nhận
  const handleRequest = () => {
    const newErrors: typeof errors = { itemQty: {} };
    const chosenItems =
      returnType === "full"
        ? items.map((it) => ({
            productId: it.productId,
            quantity: it.maxQuantity,
          }))
        : items
            .filter((it) => it.selected)
            .map((it) => ({ productId: it.productId, quantity: it.quantity }));

    if (chosenItems.length === 0) {
      newErrors.items = "Vui lòng chọn ít nhất 1 sản phẩm.";
    }

    if (returnType !== "full") {
      items.forEach((it) => {
        if (it.selected && (it.quantity < 1 || it.quantity > it.maxQuantity)) {
          if (!newErrors.itemQty) newErrors.itemQty = {};
          newErrors.itemQty[
            it.productId
          ] = `Số lượng phải từ 1 đến ${it.maxQuantity}.`;
        }
      });
    }

    if (!reason || (reason === "Lý do khác" && !otherReason.trim())) {
      newErrors.reason = "Vui lòng chọn lý do hoặc nhập mô tả chi tiết.";
    }

    // Kiểm tra video bắt buộc
    if (!selectedVideo) {
      newErrors.video = "Vui lòng chọn video minh chứng.";
    }

    if (refundMethod === "bank") {
      if (!bankOwner.trim())
        newErrors.bankOwner = "Vui lòng nhập chủ tài khoản.";
      if (!bankNumber.trim())
        newErrors.bankNumber = "Vui lòng nhập số tài khoản.";
      if (!bankName.trim()) newErrors.bankName = "Vui lòng nhập tên ngân hàng.";
    }

    if (
      newErrors.items ||
      newErrors.reason ||
      newErrors.video ||
      newErrors.bankOwner ||
      newErrors.bankNumber ||
      newErrors.bankName ||
      (newErrors.itemQty && Object.keys(newErrors.itemQty).length > 0)
    ) {
      setErrors(newErrors);
      toast(
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 rounded-full p-2">
            <Info className="w-6 h-6 text-blue-500" />
          </span>
          <div>
            <div className="font-semibold text-base mb-1">Thông báo</div>
            <div className="text-sm text-gray-700">
              Vui lòng kiểm tra lại thông tin đã nhập.
            </div>
          </div>
        </div>,
        { duration: 4000, position: "top-right" }
      );
      return;
    }

    setErrors({ itemQty: {} });
    setOpenDialog(true); // Mở dialog xác nhận
  };

  // Gửi API khi xác nhận ở dialog, hiện toast, chuyển trạng thái
  const handleConfirm = () => {
    setOpenDialog(false);
    setBackendMessage(null);
    setBackendError(null);

    try {
      const chosenItems =
        returnType === "full"
          ? items.map((it) => ({
              productId: it.productId,
              quantity: it.maxQuantity,
            }))
          : items
              .filter((it) => it.selected)
              .map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
              }));

      // Validate dữ liệu trước khi gửi
      if (!order?.id) {
        throw new Error("Không tìm thấy thông tin đơn hàng");
      }

      if (chosenItems.length === 0) {
        throw new Error("Vui lòng chọn ít nhất 1 sản phẩm để hoàn hàng");
      }
      // Lấy user ID từ token nếu order.user.id undefined
      let userId = order.user?.id;
      if (!userId) {
        try {
          const token = localStorage.getItem("access_token");
          if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userId = payload.userId || payload.sub || payload.id;
          }
        } catch (error) {
          console.error("Lỗi khi parse token:", error);
        }
      }
      // Kiểm tra quyền: user phải là chủ đơn hàng
      if (userId && order.userId && Number(userId) !== Number(order.userId)) {
        throw new Error(
          "Bạn không có quyền tạo phiếu hoàn hàng cho đơn hàng này"
        );
      }

      const dto: any = {
        idHoaDon: Number(order.id),
        loaiHoan: returnType === "full" ? "HOAN_TOAN_BO" : "HOAN_MOT_PHAN",
        lyDo: reason === "Lý do khác" ? otherReason.trim() : reason,
        phuongThucHoan:
          refundMethod === "bank" ? "Chuyển khoản" : "Ví cửa hàng",
        chiTietHoanHangs: chosenItems.map((it) => ({
          idSanPham: Number(it.productId),
          soLuongHoan: Number(it.quantity),
        })),
      };

      // Thêm user ID vào DTO nếu có
      if (userId) {
        dto.userId = Number(userId);
      }

      // Thêm thông tin ngân hàng nếu chọn chuyển khoản
      if (refundMethod === "bank") {
        dto.tenNganHang = bankName.trim();
        dto.soTaiKhoan = bankNumber.trim();
        dto.chuTaiKhoan = bankOwner.trim();
      }

      taoPhieuHoan.mutate(
        {
          dto,
          fileAnh: selectedFiles,
          fileVid: selectedVideo,
        },
        {
          onSuccess: (data) => {
            console.log("Response từ server:", data); // Debug log
            setBackendMessage("Bạn đã tạo phiếu hoàn thành công");
            setHasRequested(true);
            toast.success(
              <div className="flex items-center gap-3">
                <span className="bg-green-100 rounded-full p-2">
                  <Info className="w-6 h-6 text-green-600" />
                </span>
                <div>
                  <div className="font-semibold text-base mb-1 text-green-700">
                    Thành công
                  </div>
                  <div className="text-sm text-gray-700">
                    Bạn đã tạo phiếu hoàn thành công
                  </div>
                </div>
              </div>,
              { duration: 4000, position: "top-right" }
            );
          },
          onError: (err: any) => {
            console.error("Lỗi khi tạo phiếu hoàn hàng:", err); // Debug log
            let msg = "Gửi yêu cầu hoàn hàng thất bại. Vui lòng thử lại sau.";

            if (err?.message) {
              msg = err.message;
            } else if (err?.response?.data?.message) {
              msg = err.response.data.message;
            } else if (typeof err === "string") {
              msg = err;
            }

            setBackendError(msg);
            setHasRequested(true);
            toast.error(
              <div className="flex items-center gap-3">
                <span className="bg-red-100 rounded-full p-2">
                  <Info className="w-6 h-6 text-red-600" />
                </span>
                <div>
                  <div className="font-semibold text-base mb-1 text-red-700">
                    Thất bại
                  </div>
                  <div className="text-sm text-gray-700">{msg}</div>
                </div>
              </div>,
              { duration: 5000, position: "top-right" }
            );
          },
        }
      );
    } catch (error: any) {
      console.error("Lỗi validation:", error);
      toast.error(
        <div className="flex items-center gap-3">
          <span className="bg-red-100 rounded-full p-2">
            <Info className="w-6 h-6 text-red-600" />
          </span>
          <div>
            <div className="font-semibold text-base mb-1 text-red-700">Lỗi</div>
            <div className="text-sm text-gray-700">{error.message}</div>
          </div>
        </div>,
        { duration: 4000, position: "top-right" }
      );
    }
  };

  if (loading) return <p className="p-4">Đang tải...</p>;
  if (!order)
    return <p className="p-4 text-red-500">Không tìm thấy đơn hàng</p>;

  // Ẩn button nếu phiếu hoàn hàng của hóa đơn này đang CHO_DUYET hoặc đã có phiếu hoàn
  const isPhieuHoanChoDuyet = order?.phieuHoanHang?.trangThai === "CHO_DUYET";
  const hasExistingReturn =
    order?.phieuHoanHang && order.phieuHoanHang.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`p-6 max-w-3xl mx-auto ${palette.pageBg} text-black min-h-screen`}
      >
        <h1 className="text-xl font-bold mb-1 text-center"> Phiếu Hoàn hàng</h1>

        {/* Thông tin đơn hàng */}
        <div className="bg-white rounded-xl p-4 mb-6 border">
          <h2 className="font-semibold mb-3 text-gray-800">
            Thông tin đơn hàng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-gray-600">Mã đơn hàng:</span>
              <p className="font-medium">{order.maHD}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Ngày đặt:</span>
              <p className="font-medium">{formatDate(order.ngayTao)}</p>
            </div>
          </div>
        </div>

        {/* Loại hoàn hàng */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <label
            className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer bg-white transition-all duration-200 ease-out hover:shadow-md ${
              returnType === "partial" ? "ring-2 ring-yellow-300" : ""
            }`}
          >
            <input
              type="radio"
              name="returnType"
              className="mt-1"
              checked={returnType === "partial"}
              onChange={() => setReturnType("partial")}
            />
            <div>
              <div className="font-medium">Hoàn một phần</div>
              <div className="text-sm text-gray-500">
                Chỉ hoàn một số sản phẩm
              </div>
            </div>
          </label>
          <label
            className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer bg-white transition-all duration-200 ease-out hover:shadow-md ${
              returnType === "full" ? "ring-2 ring-yellow-300" : ""
            }`}
          >
            <input
              type="radio"
              name="returnType"
              className="mt-1"
              checked={returnType === "full"}
              onChange={() => setReturnType("full")}
            />
            <div>
              <div className="font-medium">Hoàn toàn bộ</div>
              <div className="text-sm text-gray-500">Hoàn tất cả sản phẩm</div>
            </div>
          </label>
        </div>

        {/* Sản phẩm trong đơn */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Chi tiết sản phẩm</h2>
          {errors.items && (
            <div className="text-xs text-red-600 mb-2">{errors.items}</div>
          )}
          <div className="space-y-3">
            {items.map((it, idx) => (
              <motion.div
                key={it.productId}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl bg-white border p-3 flex items-center gap-3 transition-all duration-200 ease-out hover:border-yellow-300 hover:shadow-sm"
              >
                <Checkbox
                  checked={returnType === "full" ? true : it.selected}
                  disabled={returnType === "full"}
                  onCheckedChange={(v) => {
                    const checked = Boolean(v);
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, selected: checked } : p
                      )
                    );
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">
                    ₫{Number(it.unitPrice).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`qty-${it.productId}`}
                    className="text-xs text-gray-500"
                  >
                    SL
                  </Label>
                  <Input
                    id={`qty-${it.productId}`}
                    type="number"
                    min={1}
                    max={it.maxQuantity}
                    value={returnType === "full" ? it.maxQuantity : it.quantity}
                    className={`w-20 h-9 transition-all duration-200 ease-out focus:ring-2 ${
                      errors.itemQty && errors.itemQty[it.productId]
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-yellow-300"
                    }`}
                    disabled={returnType === "full" || !it.selected}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(it.maxQuantity, Number(e.target.value || 1))
                      );
                      setItems((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, quantity: val } : p
                        )
                      );
                    }}
                  />
                  <div className="font-semibold text-[#E3000B]">
                    ₫
                    {Number(
                      it.unitPrice *
                        (returnType === "full" ? it.maxQuantity : it.quantity)
                    ).toLocaleString()}
                  </div>
                </div>
                {errors.itemQty && errors.itemQty[it.productId] && (
                  <div className="text-xs text-red-600 ml-auto">
                    {errors.itemQty[it.productId]}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lý do hoàn hàng */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Lý do hoàn hàng</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Sản phẩm bị lỗi/hỏng",
              "Giao sai sản phẩm",
              "Không hài lòng",
              "Lý do khác",
            ].map((label) => (
              <label
                key={label}
                className={`border rounded-xl p-3 bg-white cursor-pointer flex items-center gap-2 transition-all duration-200 ease-out hover:shadow-md ${
                  reason === label ? "ring-2 ring-yellow-300" : ""
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  checked={reason === label}
                  onChange={() => setReason(label)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {errors.reason && (
            <div className="text-xs text-red-600 mt-2">{errors.reason}</div>
          )}
          {reason === "Lý do khác" && (
            <div className="mt-3">
              <Label htmlFor="other-reason">Mô tả chi tiết</Label>
              <Textarea
                id="other-reason"
                placeholder="Vui lòng mô tả lý do hoàn hàng..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="mt-1 transition-all duration-200 ease-out focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          )}
        </div>

        {/* Ảnh minh chứng */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Hình ảnh minh chứng</h2>
          <div className="bg-white border rounded-xl p-4">
            {previewImages.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Ảnh chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <label className="block text-center">
                  <span className="text-[#006DB7] font-medium cursor-pointer hover:underline">
                    Thêm ảnh khác
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500 transition-colors duration-200 ease-out hover:border-yellow-300">
                Kéo thả ảnh vào đây hoặc
                <label className="text-[#006DB7] font-medium cursor-pointer ml-1">
                  chọn từ máy tính
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Video minh chứng (bắt buộc) */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">
            Video minh chứng <span className="text-red-500">*</span>
          </h2>
          {errors.video && (
            <div className="text-xs text-red-600 mb-2">{errors.video}</div>
          )}
          <div className="bg-white border rounded-xl p-4">
            {previewVideo ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    src={previewVideo}
                    controls
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>File:</strong> {selectedVideo?.name}
                </div>
                <label className="block text-center">
                  <span className="text-[#006DB7] font-medium cursor-pointer hover:underline">
                    Chọn video khác
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500 transition-colors duration-200 ease-out hover:border-yellow-300">
                <div className="mb-2">📹</div>
                <div>Kéo thả video vào đây hoặc</div>
                <label className="text-[#006DB7] font-medium cursor-pointer ml-1">
                  chọn từ máy tính
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </label>
                <div className="text-xs text-red-500 mt-2">
                  * Video là bắt buộc để xác minh
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phương thức hoàn tiền */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Phương thức hoàn tiền</h2>
          <div className="bg-white rounded-2xl border p-4 md:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <label
                className={`rounded-xl p-3 cursor-pointer flex items-center gap-3 border transition-all duration-200 ease-out hover:shadow-md ${
                  refundMethod === "bank"
                    ? "ring-2 ring-yellow-300 border-yellow-300"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="refund"
                  className="sr-only"
                  checked={refundMethod === "bank"}
                  onChange={() => setRefundMethod("bank")}
                />
                <span className="w-9 h-9 rounded-lg bg-[#FFF3CC] border border-yellow-300 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#E3000B]" />
                </span>
                <div>
                  <div className="font-medium">Chuyển khoản</div>
                  <div className="text-xs text-slate-500">
                    Hoàn trực tiếp về tài khoản ngân hàng
                  </div>
                </div>
              </label>
            </div>

            <motion.div
              initial={false}
              animate={{
                height: refundMethod === "bank" ? "auto" : 0,
                opacity: refundMethod === "bank" ? 1 : 0,
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded-xl p-4">
                <div>
                  <Label htmlFor="bankOwner">Chủ tài khoản</Label>
                  <Input
                    id="bankOwner"
                    placeholder="Nguyễn Văn A"
                    value={bankOwner}
                    onChange={(e) => setBankOwner(e.target.value)}
                    className={`transition-all duration-200 ease-out focus:ring-2 ${
                      errors.bankOwner
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-yellow-300"
                    }`}
                  />
                  {errors.bankOwner && (
                    <div className="text-xs text-red-600 mt-1">
                      {errors.bankOwner}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="bankNumber">Số tài khoản</Label>
                  <Input
                    id="bankNumber"
                    placeholder="0123 4567 890"
                    value={bankNumber}
                    onChange={(e) => setBankNumber(e.target.value)}
                    className={`transition-all duration-200 ease-out focus:ring-2 ${
                      errors.bankNumber
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-yellow-300"
                    }`}
                  />
                  {errors.bankNumber && (
                    <div className="text-xs text-red-600 mt-1">
                      {errors.bankNumber}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="bankName">Ngân hàng</Label>
                  <Input
                    id="bankName"
                    placeholder="Vietcombank, Techcombank..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={`transition-all duration-200 ease-out focus:ring-2 ${
                      errors.bankName
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-yellow-300"
                    }`}
                  />
                  {errors.bankName && (
                    <div className="text-xs text-red-600 mt-1">
                      {errors.bankName}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {refundMethod === "store" && (
              <div className="mt-2 text-xs text-slate-600">
                Tiền hoàn sẽ được cộng vào ví cửa hàng của bạn ngay khi yêu cầu
                được duyệt.
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-4 bg-transparent pt-2">
          {hasRequested ? (
            <div className="w-full text-center py-8">
              <div className="text-lg font-semibold text-yellow-600 mb-2">
                {backendMessage || "Đang chờ duyệt hoàn hàng"}
              </div>
              <div className="text-gray-500">
                Yêu cầu hoàn hàng của bạn đã được gửi. Vui lòng chờ nhân viên
                xác nhận!
              </div>
            </div>
          ) : hasExistingReturn ? (
            <div className="w-full text-center py-8">
              <div className="text-lg font-semibold text-blue-600 mb-2">
                Đã có phiếu hoàn hàng
              </div>
              <div className="text-gray-500">
                Đơn hàng này đã có phiếu hoàn hàng. Vui lòng kiểm tra trạng thái
                trong lịch sử đơn hàng.
              </div>
            </div>
          ) : (
            !isPhieuHoanChoDuyet && (
              <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full md:w-auto px-6 py-6 rounded-full bg-[#FFD400] hover:bg-[#FFE066] text-black font-semibold border border-yellow-300 shadow-lg transition-all duration-200 ease-out hover:shadow-xl"
                    onClick={handleRequest}
                    disabled={taoPhieuHoan.isPending || hasRequested}
                  >
                    {taoPhieuHoan.isPending
                      ? "Đang gửi..."
                      : "Gửi Yêu Cầu Hoàn Hàng"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Xác nhận gửi yêu cầu hoàn hàng?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn gửi yêu cầu hoàn hàng cho đơn này
                      không?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (!taoPhieuHoan.isPending && !hasRequested) {
                          handleConfirm();
                        }
                      }}
                      disabled={taoPhieuHoan.isPending || hasRequested}
                    >
                      Xác nhận
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          )}
        </div>
      </motion.div>
    </>
  );
}
