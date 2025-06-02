"use client";
import { Button } from "@/components/ui/button";
import { useSanPhamID } from "@/hooks/useSanPham";
import { Star } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";

export default function SanPhaChitiet() {
  const [soLuong, setSoLuong] = useState(1);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  const { data: sanPhamChiTiet, isLoading, error } = useSanPhamID(sanPhamID);
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

  // tăng
  const tangSoLuong = () => {
    if (soLuong < sanPhamChiTiet.soLuongTon) {
      setSoLuong(soLuong + 1);
    }
  };
  //   giảm
  const giamSoLuong = () => {
    if (soLuong < sanPhamChiTiet.soLuongTon) {
      setSoLuong(soLuong - 1);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-black  ">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh sản phẩm */}
        <div className="w-full md:w-1/2 relative">
          {sanPhamChiTiet.anhDaiDien ? (
            <Image
              src={sanPhamChiTiet.anhDaiDien}
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
              {" "}
              -{discountPercent}%
            </span>
          )}
        </div>
        {/* Thông tin sản phẩm  */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="font-bold text-3xl text-gray-900">
            {sanPhamChiTiet.tenSanPham}
          </h1>
          <span className="text-gray-600">{sanPhamChiTiet.moTa}</span>
          {/* Giá */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-2xl text-red-500">
                {sanPhamChiTiet.giaKhuyenMai?.toLocaleString()}đ
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
            <span className="font-medium  text-gray-500">
              {sanPhamChiTiet.danhGiaTrungBinh} /5 ({sanPhamChiTiet.soLuongVote}
              đánh giá )
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={giamSoLuong}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={soLuong <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{soLuong}</span>
              <button
                onClick={tangSoLuong}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg"
                disabled={soLuong >= sanPhamChiTiet.soLuongTon}
              >
                +
              </button>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1 max-w-[200px] bg-blue-600 text-white hover:bg-blue-700">
                Thêm vào giỏ hàng
              </Button>
              <Button className="flex-1 max-w-[200px] bg-red-600 text-white hover:bg-red-700">
                Mua ngay
              </Button>
            </div>
          </div>

          {/* Thông tin bổ sung */}
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
