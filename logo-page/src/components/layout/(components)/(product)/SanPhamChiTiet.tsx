"use client";
import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { SanPham } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSanPhamID } from "@/hooks/useSanPham";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import { Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAddToCart } from "@/hooks/useCart";
import { useUserStore } from "@/context/authStore.store";
import { useCart } from "@/hooks/useCart";

import {
  useDanhGia,
  useAddDanhGia,
  useUploadDanhGiaImages,
  useUploadDanhGiaVideo,
} from "@/hooks/useDanhGia";
import { danhGiaService } from "@/services/danhGiaService";

// Thêm type mở rộng cho sản phẩm chi tiết để có anhUrls
interface SanPhamChiTietWithAnhUrls {
  id?: number;
  tenSanPham?: string;
  moTa?: string;
  gia?: number;
  giaKhuyenMai?: number;
  soLuongTon?: number;
  maSanPham?: string;
  doTuoi?: number;
  soLuongManhGhep?: number;
  trangThai?: string;
  danhGiaTrungBinh?: number;
  soLuongVote?: number;
  anhUrls: { url: string; anhChinh?: boolean }[];
}

export default function SanPhamChitiet() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  // Nếu id không hợp lệ, return luôn (KHÔNG gọi bất kỳ hook nào khác)
  if (isNaN(sanPhamID) || sanPhamID <= 0) return <div>Đang tải ...</div>;

  // Tất cả các hook phải gọi ở đây, không có return phía trên nữa!
  const [soLuong, setSoLuong] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const { data: sanPhamChiTietRaw, isLoading, error } = useSanPhamID(sanPhamID);
  const sanPhamChiTiet = sanPhamChiTietRaw as SanPhamChiTietWithAnhUrls;
  const addToCart = useAddToCart(sanPhamID);
  const { user } = useUserStore();
  const userId = user?.id || 0;
  const { data: cartData } = useCart(userId);
  const totalQuantity = cartData?.gioHangChiTiets?.reduce((sum: number, item: any) => sum + item.soLuong, 0) || 0;
  const { data: binhLuanData, isLoading: loadingBinhLuan } = useDanhGia(sanPhamID);
  const addBinhLuan = useAddDanhGia(sanPhamID);
  const hdct_id = user ? 1 : undefined;
  const { data: danhGias, isLoading: loadingDanhGia } = useDanhGia(sanPhamID);
  const addDanhGia = useAddDanhGia(sanPhamID);
  const uploadImages = useUploadDanhGiaImages(sanPhamID);
  const uploadVideo = useUploadDanhGiaVideo(sanPhamID);
  const [tieuDe, setTieuDe] = useState("");
  const [textDanhGia, setTextDanhGia] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showDanhGiaForm, setShowDanhGiaForm] = useState(false);

  const handleAddBinhLuan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn cần đăng nhập để đánh giá!");
      return;
    }
    if (!hdct_id) {
      toast.error("Bạn cần mua sản phẩm này trước khi đánh giá!");
      return;
    }
    addBinhLuan.mutate(
      {
        tieuDe,
        textDanhGia,
        soSao,
        user_id: user.id,
        sp_id: sanPhamID,
        hdct_id,
      },
      {
        onSuccess: () => {
          setTieuDe("");
          setTextDanhGia("");
          setSoSao(5);
          toast.success("Đánh giá thành công!");
        },
        onError: (err: any) => {
          toast.error(err.message || "Lỗi khi gửi đánh giá");
        },
      }
    );
  };

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
          // Nếu có file ảnh/video thì upload tiếp
          if (files.length > 0) {
            uploadImages.mutate({ danhGiaId: res.id, files });
          }
          if (videoFile) {
            uploadVideo.mutate({ danhGiaId: res.id, file: videoFile });
          }
          setTieuDe("");
          setTextDanhGia("");
          setSoSao(5);
          setFiles([]);
          setVideoFile(null);
          toast.success("Đánh giá thành công!");
        },
        onError: (err: any) => {
          toast.error(err.message || "Lỗi khi gửi đánh giá");
        },
      }
    );
  };
  // XÓA useState imageUrls
  // XÓA hàm loadImages
  // XÓA mọi setImageUrls
  // XÓA mọi gọi loadImages
  const loadMainImage = async (url: string | undefined) => {
    if (!url) {
      setMainImageUrl(null);
      return;
    }
    try {
      const imageBlob = await getAnhByFileName(url);
      setMainImageUrl(URL.createObjectURL(imageBlob));
    } catch (error) {
      setMainImageUrl(null);
    }
  };

  useEffect(() => {
    if (sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0) {
      setMainImageIndex(0);
      loadMainImage(sanPhamChiTiet.anhUrls[0].url ?? "");
    }
  }, [sanPhamChiTiet]);

  // Sau khi gọi hết hook, mới return loading/error nếu cần
  if (isLoading) return <div>Đang tải ...</div>;
  if (error || !sanPhamChiTiet) return <div>Lỗi tải sản phẩm</div>;

  const discountPercent =
    sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia
      ? Math.round(
        ((sanPhamChiTiet.gia - sanPhamChiTiet.giaKhuyenMai) /
          sanPhamChiTiet.gia) *
        100
      )
      : 0;
  const tangSoLuong = () => {
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
    loadMainImage(sanPhamChiTiet.anhUrls[idx].url);
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
  const handleAddToCart = () => {
    addToCart.mutate(
      { sanPhamId: sanPhamID, soLuong },
      {
        onSuccess: () => {
          toast.success("Thêm vào giỏ hàng thành công!", {
            action: {
              label: "Xem giỏ hàng",
              onClick: () => router.push("/cart"),
            },
          });
        },
        onError: (error) => {
          toast.error(`Lỗi: ${error.message || "Vui lòng thử lại"} `);
        },
      }
    );
  };
  const handleBuyNow = () => {
    addToCart.mutate(
      { sanPhamId: sanPhamID, soLuong },
      {
        onSuccess: () => {
          toast.success("Đã thêm vào giỏ hàng!");
          router.push("/cart");
        },
        onError: (error) => {
          toast.error(`Lỗi: ${error.message || "Vui lòng thử lại"} `);
        },
      }
    );
  };

  const addToCartLocal = () => {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    // Giới hạn tối đa 10 loại sản phẩm
    const index = cart.findIndex((item: any) => item.id === sanPhamChiTiet.id);
    if (index === -1 && cart.length >= 10) {
      toast.error("Giỏ hàng chỉ tối đa 10 loại sản phẩm!");
      return;
    }

    // Thêm confirm ở đây
    const isConfirmed = window.confirm(
      "Bạn có chắc muốn thêm sản phẩm này vào giỏ hàng?"
    );
    if (!isConfirmed) return;

    if (index !== -1) {
      cart[index].quantity += soLuong;
    } else {
      cart.push({
        id: sanPhamChiTiet.id,
        name: sanPhamChiTiet.tenSanPham,
        image: sanPhamChiTiet.anhUrls?.[0]?.url || "",
        price: sanPhamChiTiet.gia,
        quantity: soLuong,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
  };

  if (isLoading) return <div>Đang tải ...</div>;
  if (error || !sanPhamChiTiet) return <div>Lỗi tải sản phẩm</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-black bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Images Gallery */}
        <div className="w-full md:w-1/2 relative">
          {/* Main Image */}
          <div className="relative">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl ?? ""}
                alt={sanPhamChiTiet?.tenSanPham || ""}
                width={400}
                height={400}
                className="object-cover w-full h-[400px] rounded-2xl shadow-lg border border-gray-100 bg-white"
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
                  />
                </div>
              ))}
            </div>
          )}
          <section
            className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            aria-labelledby="binh-luan-san-pham"
          >
            <h2
              className="text-2xl font-bold mb-4 text-gray-900"
              id="binh-luan-san-pham"
            >
              Bình luận sản phẩm
            </h2>
            {/* Nút mở form đánh giá */}
            {hdct_id && !showDanhGiaForm && (
              <button
                type="button"
                className="px-5 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-400 shadow transition font-semibold text-base"
                onClick={() => setShowDanhGiaForm(true)}
              >
                Đánh giá sản phẩm
              </button>
            )}
            {/* Form đánh giá chỉ hiện khi showDanhGiaForm=true và hdct_id hợp lệ */}
            {hdct_id && showDanhGiaForm ? (
              <form onSubmit={handleAddDanhGia} className="mb-6">
                <input
                  value={tieuDe}
                  onChange={(e) => setTieuDe(e.target.value)}
                  placeholder="Tiêu đề"
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50 focus:ring-2 focus:ring-blue-200"
                />
                <textarea
                  value={textDanhGia}
                  onChange={(e) => setTextDanhGia(e.target.value)}
                  placeholder="Nội dung đánh giá"
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50 focus:ring-2 focus:ring-blue-200"
                />
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={28}
                      className={
                        i <= soSao
                          ? "text-yellow-400 cursor-pointer"
                          : "text-gray-300 cursor-pointer"
                      }
                      fill={i <= soSao ? "#facc15" : "none"}
                      onClick={() => setSoSao(i)}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">{soSao} sao</span>
                </div>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Input
                  type="file"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  type="submit"
                  className="px-5 py-2 mt-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 shadow transition"
                >
                  Gửi đánh giá
                </button>
                <button
                  type="button"
                  className="ml-2 px-5 py-2 mt-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 shadow transition"
                  onClick={() => setShowDanhGiaForm(false)}
                >
                  Hủy
                </button>
              </form>
            ) : null}
            {loadingBinhLuan || loadingDanhGia ? (
              <div className="text-center text-gray-500 py-8">
                Đang tải bình luận...
              </div>
            ) : (
              <>
                {binhLuanData && binhLuanData.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {binhLuanData.map((bl) => (
                      <li key={bl.id} className="py-4">
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-blue-700 mr-2">
                            {bl.tenNguoiDung}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(bl.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-gray-800 ml-1">
                          {bl.textDanhGia}
                        </div>
                        {bl.textPhanHoi && (
                          <div className="mt-2 ml-4 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm text-gray-600 rounded-lg">
                            <span className="font-medium text-blue-600">
                              Phản hồi từ shop:
                            </span>{" "}
                            {bl.textPhanHoi}
                          </div>
                        )}
                        {bl.images && bl.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {bl.images.map((img) => (
                              <img
                                key={img}
                                src={danhGiaService.getImageUrl(img)}
                                alt="Ảnh đánh giá"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                              />
                            ))}
                          </div>
                        )}
                        {bl.video && (
                          <div className="mt-2">
                            <video
                              controls
                              width={200}
                              className="rounded-lg border border-gray-100"
                            >
                              <source
                                src={danhGiaService.getImageUrl(bl.video)}
                              />
                            </video>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-400 py-8 italic">
                    Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu
                    tiên bình luận!
                  </div>
                )}
              </>
            )}
          </section>
        </div>
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="font-bold text-4xl text-gray-900 mb-2">
            {sanPhamChiTiet.tenSanPham}
          </h1>
          <span className="text-gray-700 text-lg block mb-2">
            {sanPhamChiTiet.moTa}
          </span>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-3xl text-red-500">
                {sanPhamChiTiet.gia?.toLocaleString()}đ
              </span>
              {sanPhamChiTiet.gia && sanPhamChiTiet.gia && (
                <span className="text-gray-400 line-through text-xl">
                  {sanPhamChiTiet.gia.toLocaleString()}đ
                </span>
              )}
            </div>
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
                  toast.success("Thêm vào giỏ hàng thành công!");
                }}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                className="flex-1 max-w-[200px] bg-red-600 text-white hover:bg-red-500 rounded-xl font-semibold text-base shadow-lg transition"
                onClick={handleBuyNow}
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
              <strong>Độ tuổi:</strong> {sanPhamChiTiet.doTuoi}+
            </p>
            <p>
              <strong>Số mảnh ghép:</strong> {sanPhamChiTiet.soLuongManhGhep}
            </p>
            <p>
              <strong>Số lượng tồn:</strong> {sanPhamChiTiet.soLuongTon}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
