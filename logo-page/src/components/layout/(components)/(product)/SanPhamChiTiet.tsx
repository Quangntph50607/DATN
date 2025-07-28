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
  useAddDanhGia,
  useUploadDanhGiaImages,
  useUploadDanhGiaVideo,
} from "@/hooks/useDanhGia";
import { danhGiaService } from "@/services/danhGiaService";

// Thêm type mở rộng cho sản phẩm chi tiết để có anhUrls
type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

// Type cho cart item
interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

// Type cho error
interface ApiError {
  message?: string;
}

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
  const hdct_id = user ? 1 : undefined;
  const { data: danhGias } = useDanhGia(sanPhamID);
  const addDanhGia = useAddDanhGia(sanPhamID);
  const uploadImages = useUploadDanhGiaImages(sanPhamID);
  const uploadVideo = useUploadDanhGiaVideo(sanPhamID);
  const [tieuDe, setTieuDe] = useState("");
  const [textDanhGia, setTextDanhGia] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showDanhGiaForm, setShowDanhGiaForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'hasComment' | 'hasMedia'>('all');
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);


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

  // Tính toán thống kê đánh giá một lần
  const reviewStats = useMemo(() => {
    if (!danhGias) return { total: 0, byStar: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, hasComment: 0, hasMedia: 0 };

    return {
      total: danhGias.length,
      byStar: {
        1: danhGias.filter(d => d.soSao === 1).length,
        2: danhGias.filter(d => d.soSao === 2).length,
        3: danhGias.filter(d => d.soSao === 3).length,
        4: danhGias.filter(d => d.soSao === 4).length,
        5: danhGias.filter(d => d.soSao === 5).length,
      },
      hasComment: danhGias.filter(d => d.textDanhGia && d.textDanhGia.length > 0).length,
      hasMedia: danhGias.filter(d => (d.images && d.images.length > 0) || d.video).length,
    };
  }, [danhGias]);

  // Lọc danh sách đánh giá theo bộ lọc được chọn
  const filteredDanhGias = useMemo(() => {
    if (!danhGias) return [];

    switch (selectedFilter) {
      case 'all':
        return danhGias;
      case '5':
        return danhGias.filter(danhGia => danhGia.soSao === 5);
      case '4':
        return danhGias.filter(danhGia => danhGia.soSao === 4);
      case '3':
        return danhGias.filter(danhGia => danhGia.soSao === 3);
      case '2':
        return danhGias.filter(danhGia => danhGia.soSao === 2);
      case '1':
        return danhGias.filter(danhGia => danhGia.soSao === 1);
      case 'hasComment':
        return danhGias.filter(danhGia => danhGia.textDanhGia && danhGia.textDanhGia.length > 0);
      case 'hasMedia':
        return danhGias.filter(danhGia => (danhGia.images && danhGia.images.length > 0) || danhGia.video);
      default:
        return danhGias;
    }
  }, [danhGias, selectedFilter]);

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

  const handleAddDanhGia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn cần đăng nhập để đánh giá!");
      return;
    }
    if (!hdct_id) {
      toast.error("Bạn cần mua sản phẩm này trước khi đánh giá!");
      return;
    }

    // Reset form state
    const resetForm = () => {
      setTieuDe("");
      setTextDanhGia("");
      setSoSao(5);
      setFiles([]);
      setVideoFile(null);
      setShowDanhGiaForm(false);
    };

    addDanhGia.mutate(
      {
        tieuDe,
        textDanhGia,
        soSao,
        user_id: user.id,
        sp_id: sanPhamID,
        hdct_id,
      },
      {
        onSuccess: (res) => {
          // Upload media files if any
          const uploadPromises = [];
          if (files.length > 0) {
            uploadPromises.push(uploadImages.mutateAsync({ danhGiaId: res.id, files }));
          }
          if (videoFile) {
            uploadPromises.push(uploadVideo.mutateAsync({ danhGiaId: res.id, file: videoFile }));
          }

          // Wait for all uploads to complete
          Promise.all(uploadPromises)
            .then(() => {
              resetForm();
              toast.success("Đánh giá thành công!");
            })
            .catch((error: unknown) => {
              console.error("Lỗi upload media:", error);
              resetForm();
              toast.success("Đánh giá đã được gửi nhưng có lỗi khi upload media!");
            });
        },
        onError: (err: ApiError) => {
          toast.error(err.message || "Lỗi khi gửi đánh giá");
        },
      }
    );
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
    let cart: CartItem[] = [];
    try {
      const cartData = localStorage.getItem("cartItems");
      cart = cartData ? JSON.parse(cartData) : [];
    } catch (error: unknown) {
      console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
      cart = [];
    }
    // Giới hạn tối đa 10 loại sản phẩm
    const index = cart.findIndex((item: CartItem) => item.id === sanPhamChiTiet.id);
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
                    5 Sao ({reviewStats.byStar[5]})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('4')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '4'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    4 Sao ({reviewStats.byStar[4]})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('3')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '3'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    3 Sao ({reviewStats.byStar[3]})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('2')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '2'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    2 Sao ({reviewStats.byStar[2]})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('1')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === '1'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    1 Sao ({reviewStats.byStar[1]})
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

            {/* Nút đánh giá */}
            {hdct_id && !showDanhGiaForm && (
              <button
                type="button"
                className="px-6 py-3 mb-6 bg-blue-500 text-white rounded-lg hover:bg-blue-400 shadow transition font-semibold text-base"
                onClick={() => setShowDanhGiaForm(true)}
              >
                Đánh giá sản phẩm
              </button>
            )}

            {/* Form đánh giá */}
            {hdct_id && showDanhGiaForm ? (
              <form onSubmit={handleAddDanhGia} className="mb-8 p-6 bg-gray-50 rounded-xl">
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
                <div className="space-y-3 mb-4">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Input
                    type="file"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 shadow transition"
                  >
                    Gửi đánh giá
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDanhGiaForm(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-400 shadow transition"
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
                  <div
                    key={danhGia.id}
                    className="border-b border-gray-200 pb-8 mb-8 last:border-b-0 last:mb-0"
                  >
                    {/* Thông tin người đánh giá */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-lg">
                          {(danhGia.user?.ten || danhGia.tenNguoiDung || "K")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {danhGia.user?.ten || danhGia.tenNguoiDung || "Khách"}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i <= danhGia.soSao
                                    ? "text-red-500"
                                    : "text-gray-300"
                                }
                                fill={i <= danhGia.soSao ? "#ef4444" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {danhGia.ngayDanhGia
                            ? new Date(danhGia.ngayDanhGia[0], danhGia.ngayDanhGia[1] - 1, danhGia.ngayDanhGia[2]).toLocaleDateString("vi-VN")
                            : danhGia.ngayTao
                              ? new Date(danhGia.ngayTao).toLocaleDateString("vi-VN")
                              : new Date(danhGia.createdAt).toLocaleDateString("vi-VN")
                          }
                        </div>
                      </div>
                    </div>

                    {/* Nội dung đánh giá */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{danhGia.tieuDe}</h4>
                      <p className="text-gray-700 leading-relaxed">{danhGia.textDanhGia}</p>
                    </div>

                    {/* Hình ảnh/Video nếu có */}
                    {(danhGia.images && danhGia.images.length > 0) || danhGia.video ? (
                      <div className="flex gap-2 mb-4 overflow-x-auto">
                        {danhGia.video && (
                          <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">▶</span>
                            </div>
                            <span className="absolute bottom-1 right-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
                              0:32
                            </span>
                          </div>
                        )}
                        {danhGia.images?.map((img: string, idx: number) => (
                          <div key={idx} className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                            <Image
                              src={danhGiaService.getImageUrl(img)}
                              alt={`Ảnh đánh giá ${idx + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/avatar-admin.png';
                                console.error(`Lỗi tải ảnh đánh giá: ${img}`);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Tương tác */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition">
                          <span>👍</span>
                          <span className="text-sm">0</span>
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        ⋯
                      </button>
                    </div>
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
    </>
  );
}
