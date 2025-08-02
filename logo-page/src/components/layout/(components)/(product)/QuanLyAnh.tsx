import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};
export default function QuanLyAnh() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);
  const { data: sanPhamList = [] } = useListKhuyenMaiTheoSanPham();
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const sanPhamChiTietRaw = sanPhamList.find((sp) => sp.id === sanPhamID);
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
  const handlePrevImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const prevIdx =
      (mainImageIndex - 1 + sanPhamChiTiet.anhUrls.length) %
      sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(prevIdx);
    loadMainImage(sanPhamChiTiet.anhUrls[prevIdx].url);
  };

  const handleNextImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const nextIdx = (mainImageIndex + 1) % sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(nextIdx);
    loadMainImage(sanPhamChiTiet.anhUrls[nextIdx].url);
  };
  const handleThumbnailClick = (idx: number) => {
    setMainImageIndex(idx);
    if (sanPhamChiTiet?.anhUrls) {
      loadMainImage(sanPhamChiTiet.anhUrls[idx].url);
    }
  };
  useEffect(() => {
    if (sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0) {
      setMainImageIndex(0);
      const firstImageUrl = sanPhamChiTiet.anhUrls[0]?.url;
      if (firstImageUrl) {
        loadMainImage(firstImageUrl);
      }
    }
  }, [sanPhamChiTiet, loadMainImage]);
  return (
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
            unoptimized={mainImageUrl.startsWith("blob:")}
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
              <span className="sr-only">Ảnh trước</span> &#8592;
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
              className={`cursor-pointer w-20 h-20 relative border border-gray-200 rounded-xl overflow-hidden transition hover:ring-2 hover:ring-blue-400 hover:scale-105 ${
                mainImageIndex === idx ? "ring-2 ring-blue-500" : ""
              }`}
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
                  target.src = "/images/avatar-admin.png";
                  console.error(`Lỗi tải thumbnail: ${anh.url}`);
                }}
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
