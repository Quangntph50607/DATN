"use client";
import { AnhSanPhamChiTiet } from "@/components/types/product.type";
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

import { useDanhGia, useAddDanhGia, useUploadDanhGiaImages, useUploadDanhGiaVideo } from "@/hooks/useDanhGia";
import { danhGiaService } from "@/services/danhGiaService";

export default function SanPhaChitiet() {
  const [soLuong, setSoLuong] = useState(1);
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  const { data: sanPhamChiTiet, isLoading, error } = useSanPhamID(sanPhamID);
  const addToCart = useAddToCart(sanPhamID); // Sử dụng userId thay vì hardcode

  const { user } = useUserStore();
  const userId = user?.id || 0;
  const { data: cartData } = useCart(userId);

  const totalQuantity = cartData?.gioHangChiTiets?.reduce((sum: number, item: any) => sum + item.soLuong, 0) || 0;

  const { data: binhLuanData, isLoading: loadingBinhLuan } = useDanhGia(sanPhamID);
  const addBinhLuan = useAddDanhGia(sanPhamID);
  // Nếu muốn kiểm tra đã mua hàng, cần tự định nghĩa hook useUserOrderDetail
  // Hiện tại cho phép user đã đăng nhập đều được đánh giá
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
          // reset form
          setTieuDe(""); setTextDanhGia(""); setSoSao(5); setFiles([]); setVideoFile(null);
          toast.success("Đánh giá thành công!");
        },
        onError: (err: any) => {
          toast.error(err.message || "Lỗi khi gửi đánh giá");
        },
      }
    );
  };

  // Function to load images
  const loadImages = async (anhSps: AnhSanPhamChiTiet[]) => {
    const urls: Record<string, string | null> = {};
    for (const anh of anhSps) {
      if (anh.url) {
        try {
          const imageBlob = await getAnhByFileName(anh.url);
          urls[anh.url] = URL.createObjectURL(imageBlob);
        } catch (error) {
          console.error(`Lỗi tải ảnh cho url ${anh.url}: `, error);
          urls[anh.url] = null;
        }
      } else {
        urls[anh.url] = null;
      }
    }
    setImageUrls(urls);
  };

  // Load images when sanPhamChiTiet is available
  useEffect(() => {
    if (sanPhamChiTiet?.anhSps && sanPhamChiTiet.anhSps.length > 0) {
      loadImages(sanPhamChiTiet.anhSps);
    }
  }, [sanPhamChiTiet]);

  if (isLoading) return <div>Đang tải ....</div>;
  if (error || !sanPhamChiTiet) return <div>Lỗi tải sản phẩm</div>;

  const discountPercent =
    sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia
      ? Math.round(
        ((sanPhamChiTiet.gia - sanPhamChiTiet.giaKhuyenMai) /
          sanPhamChiTiet.gia) *
        100
      )
      : 0;

  // Increase quantity
  const tangSoLuong = () => {
    if (soLuong < sanPhamChiTiet.soLuongTon) {
      setSoLuong(soLuong + 1);
    }
  };

  // Decrease quantity
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
      setSoLuong(Math.min(50, sanPhamChiTiet.soLuongTon));
    } else if (value >= 1 && value <= sanPhamChiTiet.soLuongTon) {
      setSoLuong(value);
    } else {
      setSoLuong(sanPhamChiTiet.soLuongTon);
    }
  };

  // Handle thumbnail click to change main image
  const handleThumbnailClick = (fileName: string) => {
    setImageUrls((prev) => ({ ...prev, main: fileName }));
  };

  // Handle add to cart
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

  // Handle buy now - redirect to cart after adding
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

  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images Gallery */}
        <div className="w-full md:w-1/2 relative">
          {/* Main Image */}
          {imageUrls[sanPhamChiTiet.anhSps?.[0]?.url || ""] ? (
            <Image
              src={imageUrls[sanPhamChiTiet.anhSps?.[0]?.url || ""]!}
              alt={sanPhamChiTiet.tenSanPham}
              width={400}
              height={400}
              className="object-cover w-full h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-[400px] bg-gray-300 flex justify-center items-center rounded-lg shadow-lg">
              Không có ảnh
            </div>
          )}
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white font-bold rounded py-2 px-2 text-sm">
              -{discountPercent}%
            </span>
          )}
          {/* Thumbnails */}
          {sanPhamChiTiet.anhSps && sanPhamChiTiet.anhSps.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {sanPhamChiTiet.anhSps.map((anh, index) => (
                <div
                  key={index}
                  className="cursor-pointer w-20 h-20 relative border rounded-lg overflow-hidden"
                  onClick={() => handleThumbnailClick(anh.url)}
                >
                  {imageUrls[anh.url] ? (
                    <Image
                      src={imageUrls[anh.url]!}
                      alt={`Thumbnail ${index + 1} `}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">Đang tải...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Bình luận sản phẩm dưới ảnh */}
          <section className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6" aria-labelledby="binh-luan-san-pham">
            <h2 className="text-2xl font-bold mb-4 text-gray-900" id="binh-luan-san-pham">
              Bình luận sản phẩm
            </h2>
            {hdct_id ? (
              <form onSubmit={handleAddDanhGia} className="mb-6">
                <input
                  value={tieuDe}
                  onChange={e => setTieuDe(e.target.value)}
                  placeholder="Tiêu đề"
                  required
                  className="w-full border rounded p-2 mb-2"
                />
                <textarea
                  value={textDanhGia}
                  onChange={e => setTextDanhGia(e.target.value)}
                  placeholder="Nội dung đánh giá"
                  required
                  className="w-full border rounded p-2 mb-2"
                />
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={28}
                      className={i <= soSao ? "text-yellow-400 cursor-pointer" : "text-gray-300 cursor-pointer"}
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
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Input
                  type="file"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Gửi đánh giá
                </button>
              </form>
            ) : (
              <div className="text-gray-500 italic mb-6">
                Bạn cần mua sản phẩm này trước khi có thể đánh giá.
              </div>
            )}
            {loadingBinhLuan || loadingDanhGia ? (
              <div className="text-center text-gray-500 py-8">Đang tải bình luận...</div>
            ) : (
              <>
                {binhLuanData && binhLuanData.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {binhLuanData.map((bl) => (
                      <li key={bl.id} className="py-4">
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-blue-700 mr-2">{bl.tenNguoiDung}</span>
                          <span className="text-xs text-gray-400">{new Date(bl.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-800 ml-1">{bl.textDanhGia}</div>
                        {bl.textPhanHoi && (
                          <div className="mt-2 ml-4 p-2 bg-gray-50 border-l-4 border-blue-400 text-sm text-gray-600 rounded">
                            <span className="font-medium text-blue-600">Phản hồi từ shop:</span> {bl.textPhanHoi}
                          </div>
                        )}
                        {bl.images && bl.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {bl.images.map(img => (
                              <img key={img} src={danhGiaService.getImageUrl(img)} alt="Ảnh đánh giá" className="w-20 h-20 object-cover rounded-md" />
                            ))}
                          </div>
                        )}
                        {bl.video && (
                          <div className="mt-2">
                            <video controls width={200} className="rounded-md">
                              <source src={danhGiaService.getImageUrl(bl.video)} />
                            </video>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-400 py-8 italic">
                    Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên bình luận!
                  </div>
                )}
              </>
            )}
          </section>
        </div>
        {/* Product Information */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="font-bold text-3xl text-gray-900">
            {sanPhamChiTiet.tenSanPham}
          </h1>
          <span className="text-gray-600">{sanPhamChiTiet.moTa}</span>
          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-2xl text-red-500">
                {sanPhamChiTiet.gia?.toLocaleString()}đ
              </span>
              {sanPhamChiTiet.giaKhuyenMai && sanPhamChiTiet.gia && (
                <span className="text-gray-400 line-through text-lg">
                  {sanPhamChiTiet.gia.toLocaleString()}đ
                </span>
              )}
            </div>
            <p className="text-sm text-green-600">{sanPhamChiTiet.trangThai}</p>
          </div>
          <div className="flex gap-2">
            <span className="text-yellow-500">
              <Star />
            </span>
            <span className="font-medium text-gray-500">
              {sanPhamChiTiet.danhGiaTrungBinh} /5 ({sanPhamChiTiet.soLuongVote}{" "}
              đánh giá)
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={giamSoLuong}
                className="px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 rounded-l-lg"
                disabled={soLuong <= 1}
              >
                -
              </button>
              <Input
                value={soLuong}
                onChange={handleSoLuongChange}
                min={1}
                max={sanPhamChiTiet.soLuongTon}
                className="w-16 text-center border-none focus-visible:ring-0"
              />
              <button
                onClick={tangSoLuong}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg"
                disabled={soLuong >= sanPhamChiTiet.soLuongTon}
              >
                +
              </button>
            </div>
            <div className="flex gap-4">
              <Button
                className="flex-1 max-w-[200px] bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                className="flex-1 max-w-[200px] bg-red-600 text-white hover:bg-red-700"
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
            </div>
          </div>
          {/* Additional Information */}
          <div className="text-gray-700 space-y-2">
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
