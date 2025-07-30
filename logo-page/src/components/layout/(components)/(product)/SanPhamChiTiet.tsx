"use client";

import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import { Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/context/authStore.store";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import {
  useDanhGia,
  useAddDanhGiaWithImages,
} from "@/hooks/useDanhGia";
import { danhGiaService } from "@/services/danhGiaService";
import { CreateDanhGiaDTO, DanhGiaResponse } from "@/components/types/danhGia-type";

// Thêm type mở rộng cho sản phẩm chi tiết để có anhUrls
type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

export default function SanPhamChitiet() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  const [soLuong, setSoLuong] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const { data: sanPhamList = [], isLoading, error } = useListKhuyenMaiTheoSanPham();
  const { data: xuatXuList = [] } = useXuatXu();
  const { data: thuongHieuList = [] } = useThuongHieu();
  const { data: danhMucList = [] } = useDanhMuc();
  const { user } = useUserStore();
  const { data: danhGias = [] } = useDanhGia(sanPhamID);

  const addDanhGiaWithImages = useAddDanhGiaWithImages();
  const [tieuDe, setTieuDe] = useState("");
  const [textDanhGia, setTextDanhGia] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showDanhGiaForm, setShowDanhGiaForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'hasComment' | 'hasMedia'>('all');
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewedProduct, setHasReviewedProduct] = useState(false);

  // Kiểm tra đánh giá
  useEffect(() => {
    if (user && danhGias) {
      const hasReviewed = danhGias.some(danhGia => danhGia.userId === user.id);
      setHasReviewedProduct(hasReviewed);
    } else {
      setHasReviewedProduct(false);
    }
  }, [user, danhGias]);

  const productInfo = useMemo(() => {
    const sanPhamChiTietRaw = sanPhamList.find(sp => sp.id === sanPhamID);
    const sanPhamChiTiet = sanPhamChiTietRaw as SanPhamChiTietWithAnhUrls;

    if (!sanPhamChiTiet) return null;

    return {
      xuatXu: xuatXuList.find(xx => xx.id === sanPhamChiTiet.xuatXuId),
      thuongHieu: thuongHieuList.find(th => th.id === sanPhamChiTiet.thuongHieuId),
      danhMuc: danhMucList.find(dm => dm.id === sanPhamChiTiet.danhMucId),
    };
  }, [sanPhamID, sanPhamList, xuatXuList, thuongHieuList, danhMucList]);

  // Tính toán thống kê đánh giá
  const reviewStats = useMemo(() => {
    if (!danhGias) return { average: 0, total: 0, distribution: {} };

    const total = danhGias.length;
    const sum = danhGias.reduce((acc, d) => acc + d.soSao, 0);
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    const distribution = danhGias.reduce((acc, d) => {
      acc[d.soSao] = (acc[d.soSao] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Tính số đánh giá có bình luận
    const hasComment = danhGias.filter(d => d.textDanhGia && d.textDanhGia.trim().length > 0).length;

    // Tính số đánh giá có media
    const hasMedia = danhGias.filter(d =>
      (d.anhUrls && d.anhUrls.length > 0) || d.video
    ).length;

    return {
      average,
      total,
      distribution,
      hasComment,
      hasMedia
    };
  }, [danhGias]);

  // Lọc đánh giá theo sao
  const filteredDanhGias = useMemo(() => {
    if (!danhGias) return [];
    if (selectedFilter === 'all') return danhGias;
    if (selectedFilter === '5') return danhGias.filter(d => d.soSao === 5);
    if (selectedFilter === '4') return danhGias.filter(d => d.soSao === 4);
    if (selectedFilter === '3') return danhGias.filter(d => d.soSao === 3);
    if (selectedFilter === '2') return danhGias.filter(d => d.soSao === 2);
    if (selectedFilter === '1') return danhGias.filter(d => d.soSao === 1);
    if (selectedFilter === 'hasComment') return danhGias.filter(d => d.textDanhGia && d.textDanhGia.trim().length > 0);
    if (selectedFilter === 'hasMedia') return danhGias.filter(d => (d.anhUrls && d.anhUrls.length > 0) || d.video);
    return danhGias;
  }, [danhGias, selectedFilter]);

  // Helper function để parse date
  const parseDate = (dateInput: string | number[]): string => {
    console.log("📅 Parsing date:", dateInput, "Type:", typeof dateInput);

    if (!dateInput) {
      console.log("❌ No date input provided");
      return "Chưa có ngày";
    }

    try {
      let date: Date;

      // Kiểm tra nếu là array (Java LocalDateTime format)
      if (Array.isArray(dateInput)) {
        console.log("📅 Processing Java LocalDateTime array:", dateInput);

        // Format: [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;

        // Java month is 0-based, JavaScript month is 0-based, nhưng Java trả về 1-12
        // Nên cần trừ 1 để chuyển về JavaScript format
        date = new Date(year, month - 1, day, hour, minute, second);

        console.log("📅 Created Date from array:", date);
      }
      // Kiểm tra nếu là string
      else if (typeof dateInput === 'string') {
        console.log("📅 Processing string date:", dateInput);

        if (dateInput === "null" || dateInput === "undefined") {
          console.log("❌ Null/undefined string");
          return "Chưa có ngày";
        }

        // Thử parse với các format khác nhau
        if (dateInput.includes('T') || dateInput.includes('Z')) {
          date = new Date(dateInput);
        }
        // Kiểm tra nếu là format Java LocalDateTime (yyyy-MM-dd HH:mm:ss)
        else if (dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
          date = new Date(dateInput.replace(' ', 'T'));
        }
        // Kiểm tra nếu là format Java LocalDate (yyyy-MM-dd)
        else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateInput + 'T00:00:00');
        }
        // Thử parse bình thường
        else {
          date = new Date(dateInput);
        }
      }
      // Kiểm tra nếu là number (timestamp)
      else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      }
      else {
        console.log("❌ Unsupported date format:", dateInput);
        return "Chưa có ngày";
      }

      if (isNaN(date.getTime())) {
        console.log("❌ Invalid date:", dateInput);
        return "Chưa có ngày";
      }

      const formattedDate = date.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log("✅ Parsed date successfully:", formattedDate);
      return formattedDate;
    } catch (error) {
      console.log("❌ Error parsing date:", error, "Input:", dateInput);
      return "Chưa có ngày";
    }
  };

  const sanPhamChiTietRaw = sanPhamList.find(sp => sp.id === sanPhamID);
  const sanPhamChiTiet = sanPhamChiTietRaw as SanPhamChiTietWithAnhUrls;

  const loadMainImage = useCallback(async (url: string | undefined) => {
    if (!url) {
      setMainImageUrl(null);
      return;
    }
    try {
      const imageBlob: Blob = await getAnhByFileName(url);
      if (imageBlob && imageBlob instanceof Blob) {
        setMainImageUrl(URL.createObjectURL(imageBlob));
      } else {
        setMainImageUrl(null);
      }
    } catch {
      setMainImageUrl(null);
    }
  }, []);

  useEffect(() => {
    if (sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0) {
      setMainImageIndex(0);
      const firstImageUrl = sanPhamChiTiet.anhUrls[0]?.url;
      if (firstImageUrl) {
        loadMainImage(firstImageUrl);
      }
    }
  }, [sanPhamChiTiet, loadMainImage]);

  if (isNaN(sanPhamID) || sanPhamID <= 0) return <div>Đang tải ...</div>;

  const handleAddDanhGia = async () => {
    if (!user) {
      setErrorMessage("Vui lòng đăng nhập để đánh giá");
      setShowErrorModal(true);
      return;
    }

    if (!tieuDe.trim() || !textDanhGia.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const hasReviewed = danhGias?.some(danhGia => danhGia.userId === user.id);

    if (hasReviewed) {
      setErrorMessage("Bạn đã đánh giá sản phẩm này rồi!");
      setShowErrorModal(true);
      return;
    }

    setIsSubmittingReview(true);

    try {
      const reviewData: CreateDanhGiaDTO = {
        user_id: user.id,
        sp_id: Number(id),
        tieuDe: tieuDe.trim(),
        textDanhGia: textDanhGia.trim(),
        soSao: soSao,
      };

      setShowLoadingModal(true);

      const imagesToSend = files.length > 0 ? files : [];
      const videoToSend = videoFile || undefined;

      await addDanhGiaWithImages.mutateAsync({
        data: reviewData,
        images: imagesToSend,
        video: videoToSend,
      });

      setShowLoadingModal(false);

      // Reset form
      setTieuDe("");
      setTextDanhGia("");
      setSoSao(5);
      setFiles([]);
      setVideoFile(null);
      setShowDanhGiaForm(false);
      setIsSubmittingReview(false);

      // Hiển thị modal thành công
      setTimeout(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 8000);
      }, 500);

      setShowSuccessModal(true);
    } catch (error) {
      setShowLoadingModal(false);
      setIsSubmittingReview(false);

      if (error instanceof Error) {
        if (error.message.includes("đã đánh giá")) {
          setErrorMessage("Bạn đã đánh giá sản phẩm này rồi!");
        } else if (error.message.includes("chưa mua")) {
          setErrorMessage("Bạn chưa mua sản phẩm này nên không thể đánh giá.");
        } else if (error.message.includes("đơn hàng")) {
          setErrorMessage("Đơn hàng của bạn chưa đủ điều kiện để đánh giá.");
        } else {
          setErrorMessage(`Lỗi: ${error.message}`);
        }
      } else {
        setErrorMessage("Có lỗi xảy ra khi đánh giá");
      }
      setShowErrorModal(true);
    }
  };

  if (isLoading) return <div>Đang tải ...</div>;
  if (error as unknown || !sanPhamChiTiet) return <div>Lỗi tải sản phẩm</div>;

  const tangSoLuong = () => {
    if (!sanPhamChiTiet) return;
    if (soLuong < (sanPhamChiTiet.soLuongTon ?? 1)) {
      setSoLuong(soLuong + 1);
    }
  };

  const giamSoLuong = () => {
    if (soLuong > 1) {
      setSoLuong(soLuong - 1);
    }
  };

  const handleSoLuongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sanPhamChiTiet) return;
    const value = parseInt(e.target.value) || 0;
    if (value === 0) {
      setSoLuong(0);
    } else if (value > 50) {
      toast.message("Cảnh báo!", {
        description: "Số lượng không vượt quá 50!",
        duration: 2000,
      });
      setSoLuong(Math.min(50, sanPhamChiTiet.soLuongTon ?? 50));
    } else if (value >= 1 && value <= (sanPhamChiTiet.soLuongTon ?? 1)) {
      setSoLuong(value);
    } else {
      setSoLuong(sanPhamChiTiet.soLuongTon ?? 1);
    }
  };

  const handleThumbnailClick = (idx: number) => {
    setMainImageIndex(idx);
    if (sanPhamChiTiet?.anhUrls) {
      loadMainImage(sanPhamChiTiet.anhUrls[idx].url);
    }
  };

  const handleNextImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const nextIdx = (mainImageIndex + 1) % sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(nextIdx);
    loadMainImage(sanPhamChiTiet.anhUrls[nextIdx].url);
  };

  const handlePrevImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const prevIdx = (mainImageIndex - 1 + sanPhamChiTiet.anhUrls.length) % sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(prevIdx);
    loadMainImage(sanPhamChiTiet.anhUrls[prevIdx].url);
  };

  const addToCartLocal = () => {
    let cart: Array<{
      id: number;
      name: string;
      image: string;
      price: number;
      originalPrice: number;
      quantity: number;
    }> = [];
    try {
      const cartData = localStorage.getItem("cartItems");
      cart = cartData ? JSON.parse(cartData) : [];
    } catch (error: unknown) {
      console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
      cart = [];
    }
    // Giới hạn tối đa 10 loại sản phẩm
    const index = cart.findIndex((item) => item.id === sanPhamChiTiet.id);
    if (index === -1 && cart.length >= 10) {
      toast.error("Giỏ hàng chỉ tối đa 10 loại sản phẩm!");
      return;
    }

    if (index !== -1) {
      cart[index].quantity += soLuong;
    } else {
      cart.push({
        id: sanPhamChiTiet.id,
        name: sanPhamChiTiet.tenSanPham,
        image: sanPhamChiTiet.anhUrls?.[0]?.url || "",
        price: sanPhamChiTiet.giaKhuyenMai || sanPhamChiTiet.gia,
        originalPrice: sanPhamChiTiet.gia,
        quantity: soLuong,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    // Trigger custom event để Header cập nhật ngay lập tức
    window.dispatchEvent(new Event("cartUpdated"));
    // Hiển thị thông báo thành công
    setShowAddToCartSuccess(true);
    setTimeout(() => {
      setShowAddToCartSuccess(false);
    }, 3000);
  };

  // Component để hiển thị thông tin user đơn giản
  const UserInfo = ({ danhGia, soSao }: { danhGia: DanhGiaResponse; soSao?: number }) => {
    // Lấy tên user từ dữ liệu đánh giá
    const displayName = danhGia.user?.ten || danhGia.tenNguoiDung || "Khách";
    const avatar = displayName.charAt(0).toUpperCase();

    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {avatar}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {displayName}
          </p>
          {soSao && (
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < soSao ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="w-full">
        <div className="bg-gray-100 shadow-sm border-b border-gray-100 p-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Trang Chủ
              </Link>
              <span className="text-gray-400">{'>'}</span>
              <span className="text-gray-900 font-medium truncate">
                {sanPhamChiTiet?.tenSanPham || "Sản phẩm"}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="w-full text-black bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Product Images Gallery */}
            <div className="w-full md:w-1/2 relative">
              {/* Main Image */}
              <div className="relative">
                {mainImageUrl ? (
                  <Image
                    src={mainImageUrl}
                    alt={sanPhamChiTiet?.tenSanPham || ""}
                    width={400}
                    height={400}
                    className="object-cover w-full h-[400px] rounded-2xl shadow-lg border border-gray-100 bg-white"
                    onError={() => {
                      setMainImageUrl(null);
                    }}
                    unoptimized={mainImageUrl.startsWith('blob:')}
                  />
                ) : (
                  <div className="w-full h-[400px] bg-gray-100 flex justify-center items-center rounded-2xl shadow-lg border border-gray-100 text-gray-400 text-xl">
                    Không có ảnh
                  </div>
                )}
                {/* Nút chuyển ảnh */}
                {sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/90 hover:bg-blue-100 rounded-full p-2 shadow border border-gray-200 transition"
                      onClick={handlePrevImage}
                      type="button"
                    >
                      <span className="sr-only">Ảnh trước</span>
                      &#8592;
                    </button>
                    <button
                      className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/90 hover:bg-blue-100 rounded-full p-2 shadow border border-gray-200 transition"
                      onClick={handleNextImage}
                      type="button"
                    >
                      <span className="sr-only">Ảnh sau</span>
                      &#8594;
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0 && (
                <div className="flex gap-3 mt-5 overflow-x-auto">
                  {sanPhamChiTiet.anhUrls.map((anh, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer w-20 h-20 relative border border-gray-200 rounded-xl overflow-hidden transition hover:ring-2 hover:ring-blue-400 hover:scale-105 ${mainImageIndex === idx ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => handleThumbnailClick(idx)}
                    >
                      <Image
                        src={`http://localhost:8080/api/anhsp/images/${anh.url}`}
                        alt={`Thumbnail ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/avatar-admin.png';
                          console.error(`Lỗi tải thumbnail: ${anh.url}`);
                        }}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="font-bold text-4xl text-gray-900 mb-2">
                {sanPhamChiTiet.tenSanPham}
              </h1>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  {/* Hiển thị giá khuyến mãi nếu có, không thì hiển thị giá gốc */}
                  <span className="font-semibold text-3xl text-red-500">
                    {sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia && sanPhamChiTiet.giaKhuyenMai < sanPhamChiTiet.gia
                      ? sanPhamChiTiet.giaKhuyenMai.toLocaleString()
                      : sanPhamChiTiet.gia?.toLocaleString()}đ
                  </span>
                  {/* Hiển thị giá gốc gạch ngang chỉ khi có khuyến mãi */}
                  {sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia && sanPhamChiTiet.giaKhuyenMai < sanPhamChiTiet.gia && (
                    <span className="text-gray-400 line-through text-xl">
                      {sanPhamChiTiet.gia.toLocaleString()}đ
                    </span>
                  )}
                </div>
                {/* Hiển thị badge giảm giá chỉ khi có khuyến mãi */}
                {sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia && sanPhamChiTiet.giaKhuyenMai < sanPhamChiTiet.gia && (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                      -{sanPhamChiTiet.phanTramKhuyenMai || Math.round(((sanPhamChiTiet.gia - sanPhamChiTiet.giaKhuyenMai) / sanPhamChiTiet.gia) * 100)}%
                    </span>
                    <span className="text-sm text-red-500 font-medium">Giảm giá</span>
                  </div>
                )}
                <p className="text-base text-green-600 font-medium">
                  {sanPhamChiTiet.trangThai}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-yellow-500">
                  <Star />
                </span>
                <span className="font-medium text-gray-600 text-lg">
                  {sanPhamChiTiet.danhGiaTrungBinh} /5 ({sanPhamChiTiet.soLuongVote}{" "}
                  đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={giamSoLuong}
                    className="px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-100 rounded-l-xl text-xl font-bold"
                    disabled={soLuong <= 1}
                  >
                    -
                  </button>
                  <Input
                    value={soLuong}
                    onChange={handleSoLuongChange}
                    min={1}
                    max={sanPhamChiTiet.soLuongTon ?? 1}
                    className="w-16 text-center border-none focus-visible:ring-0 bg-transparent text-lg font-semibold"
                  />
                  <button
                    onClick={tangSoLuong}
                    className="px-4 py-2 bg-white hover:bg-gray-100 rounded-r-xl text-xl font-bold"
                    disabled={soLuong >= (sanPhamChiTiet.soLuongTon ?? 1)}
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 max-w-[200px] bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-semibold text-base shadow-lg transition"
                    onClick={() => {
                      addToCartLocal();
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    className="flex-1 max-w-[200px] bg-red-600 text-white hover:bg-red-500 rounded-xl font-semibold text-base shadow-lg transition"
                    onClick={() => {
                      addToCartLocal();
                      router.push("/cart");
                    }}
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>

              <div className="text-gray-700 space-y-2 text-base bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p>
                  <strong>Mã sản phẩm:</strong> {sanPhamChiTiet.maSanPham}
                </p>
                <p>
                  <strong>Chủ đề:</strong> {productInfo?.danhMuc?.tenDanhMuc || 'N/A'}
                </p>
                <p>
                  <strong>Độ tuổi:</strong> {sanPhamChiTiet.doTuoi}+
                </p>
                <p>
                  <strong>Số mảnh ghép:</strong> {sanPhamChiTiet.soLuongManhGhep}
                </p>
                <p>
                  <strong>Số lượng tồn:</strong> {sanPhamChiTiet.soLuongTon}
                </p>
                <p>
                  <strong>Xuất xứ:</strong> {productInfo?.xuatXu?.ten || 'N/A'}
                </p>
                <p>
                  <strong>Thương hiệu:</strong> {productInfo?.thuongHieu?.ten || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Mô tả sản phẩm - Kéo dài toàn bộ chiều rộng */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
            <div className="text-gray-700 text-lg leading-relaxed">
              {sanPhamChiTiet.moTa}
            </div>
          </div>

          {/* Phần đánh giá sản phẩm */}
          <section
            className="mt-10 pt-8 border-t border-gray-200"
            aria-labelledby="binh-luan-san-pham"
          >
            <h2
              className="text-2xl font-bold mb-6 text-gray-900"
              id="binh-luan-san-pham"
            >
              ĐÁNH GIÁ SẢN PHẨM
            </h2>

            {/* Tổng quan đánh giá */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Điểm đánh giá tổng quan */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">
                    {sanPhamChiTiet.danhGiaTrungBinh || 0}
                  </div>
                  <div className="text-gray-600 mb-2">trên 5</div>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={24}
                        className={
                          i <= (sanPhamChiTiet.danhGiaTrungBinh || 0)
                            ? "text-red-500"
                            : "text-gray-300"
                        }
                        fill={i <= (sanPhamChiTiet.danhGiaTrungBinh || 0) ? "#ef4444" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bộ lọc đánh giá */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Tất Cả ({reviewStats.total})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('5')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '5'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    5 Sao ({(reviewStats.distribution as Record<number, number>)[5] || 0})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('4')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '4'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    4 Sao ({(reviewStats.distribution as Record<number, number>)[4] || 0})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('3')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '3'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    3 Sao ({(reviewStats.distribution as Record<number, number>)[3] || 0})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('2')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '2'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    2 Sao ({(reviewStats.distribution as Record<number, number>)[2] || 0})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('1')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '1'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    1 Sao ({(reviewStats.distribution as Record<number, number>)[1] || 0})
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFilter('hasComment')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === 'hasComment'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Có Bình Luận ({reviewStats.hasComment})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('hasMedia')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === 'hasMedia'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Có Hình Ảnh / Video ({reviewStats.hasMedia})
                  </button>
                </div>
              </div>
            </div>

            {/* Nút đánh giá - hiển thị cho user đã đăng nhập và chưa đánh giá */}
            {user && !hasReviewedProduct && !showDanhGiaForm && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 shadow transition font-semibold text-base"
                  onClick={() => setShowDanhGiaForm(true)}
                >
                  Đánh giá sản phẩm
                </button>
              </div>
            )}

            {/* Thông báo cho user đã đánh giá */}
            {user && hasReviewedProduct && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 font-medium">
                    Bạn đã đánh giá sản phẩm này rồi
                  </p>
                </div>
              </div>
            )}

            {/* Form đánh giá */}
            {user && showDanhGiaForm ? (
              <form
                onSubmit={(e) => {
                  console.log("📝 Form submitted!");
                  e.preventDefault();
                  handleAddDanhGia();
                }}
                className="mb-8 p-6 bg-gray-50 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Viết đánh giá của bạn</h3>
                <input
                  value={tieuDe}
                  onChange={(e) => setTieuDe(e.target.value)}
                  placeholder="Tiêu đề đánh giá"
                  required
                  className="w-full border border-gray-200 rounded-lg p-3 mb-3 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <textarea
                  value={textDanhGia}
                  onChange={(e) => setTextDanhGia(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  required
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg p-3 mb-3 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 mr-3">Đánh giá:</span>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={28}
                      className={
                        i <= soSao
                          ? "text-yellow-400 cursor-pointer hover:text-yellow-500"
                          : "text-gray-300 cursor-pointer hover:text-gray-400"
                      }
                      fill={i <= soSao ? "#facc15" : "none"}
                      onClick={() => setSoSao(i)}
                    />
                  ))}
                  <span className="ml-3 text-gray-600 font-medium">{soSao} sao</span>
                </div>
                <div className="space-y-4 mb-4">
                  {/* Input chọn ảnh */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Thêm ảnh (có thể chọn nhiều ảnh)
                    </label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                      className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500">Hỗ trợ: JPG, PNG, GIF (tối đa 3 ảnh)</p>
                  </div>

                  {/* Input chọn video */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Thêm video (chỉ 1 video)
                    </label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    <p className="text-xs text-gray-500">Hỗ trợ: MP4, AVI, MOV (tối đa 50MB)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`px-6 py-2 rounded-lg font-semibold shadow transition ${isSubmittingReview
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                  >
                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => setShowDanhGiaForm(false)}
                    className={`px-6 py-2 rounded-lg font-semibold shadow transition ${isSubmittingReview
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-400'
                      }`}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : null}

            {/* Danh sách đánh giá */}
            {filteredDanhGias && filteredDanhGias.length > 0 ? (
              <div className="space-y-6">
                {filteredDanhGias.map((danhGia) => (
                  <div key={danhGia.id} className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-start justify-between">
                      <UserInfo danhGia={danhGia} soSao={danhGia.soSao} />
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {parseDate(danhGia.ngayDanhGia)}
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="font-medium text-gray-900 mb-1">{danhGia.tieuDe}</h4>
                      <p className="text-gray-600">{danhGia.textDanhGia}</p>
                    </div>

                    {/* Hiển thị ảnh và video */}
                    {(danhGia.anhUrls && danhGia.anhUrls.length > 0) || danhGia.video ? (
                      <div className="mt-3 flex space-x-2">
                        {/* Hiển thị ảnh */}
                        {danhGia.anhUrls && danhGia.anhUrls.length > 0 &&
                          danhGia.anhUrls.map((anh) => (
                            <Image
                              key={anh.id}
                              src={danhGiaService.getImageUrl(anh.url)}
                              alt="Review image"
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                              onClick={() => {
                                setSelectedMedia({ type: 'image', url: danhGiaService.getImageUrl(anh.url) });
                                setShowMediaModal(true);
                              }}
                            />
                          ))
                        }

                        {/* Hiển thị video */}
                        {danhGia.video && (
                          <div
                            className="w-16 h-16 bg-gray-200 rounded cursor-pointer relative overflow-hidden"
                            onClick={() => {
                              setSelectedMedia({ type: 'video', url: danhGiaService.getVideoUrl(danhGia.video!.url) });
                              setShowMediaModal(true);
                            }}
                          >
                            <video
                              src={danhGiaService.getVideoUrl(danhGia.video.url)}
                              className="w-full h-full object-cover"
                              muted
                              onError={(e) => {
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Phản hồi từ nhân viên */}
                    {danhGia.textPhanHoi && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phản hồi từ nhân viên:</span> {danhGia.textPhanHoi}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  {selectedFilter === 'all'
                    ? "Chưa có đánh giá nào"
                    : "Không có đánh giá phù hợp với bộ lọc"
                  }
                </div>
                <div className="text-gray-500">
                  {selectedFilter === 'all'
                    ? "Hãy là người đầu tiên đánh giá sản phẩm này!"
                    : "Thử chọn bộ lọc khác hoặc đánh giá sản phẩm này!"
                  }
                </div>
              </div>
            )}
          </section>


        </div>
      </div>

      {/* Thông báo thêm giỏ hàng thành công */}
      {showAddToCartSuccess && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white text-center leading-tight">
              Sản phẩm đã được thêm vào Giỏ hàng
            </p>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 animate-spin">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-15.356-2m15.356 2H20v-5m0 0l2.5-2.5M4 20v-5h-.582m15.356-2A8.001 8.001 0 0020 11a8 8 0 00-15.356 2m15.356-2H20v5m0 0l2.5 2.5" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white text-center leading-tight">
              Đang xử lý đánh giá...
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-5"
          style={{ backdropFilter: 'blur(4px)' }}

        >
          <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white text-center leading-tight">
              Đánh giá của bạn đã được gửi thành công.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Refresh data thay vì reload page
                  window.location.reload();
                }}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Xem đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-5">
          <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white text-center leading-tight">
              Có lỗi xảy ra
            </p>
            <p className="text-sm text-gray-300 text-center mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            >
              ✕
            </button>
            {selectedMedia.type === 'image' ? (
              <Image
                src={selectedMedia.url}
                alt="Review image"
                width={800}
                height={600}
                className="max-w-full max-h-[90vh] object-contain rounded"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-[90vh] rounded"
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
