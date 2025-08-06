"use client";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import {
  CircleAlert,
  Minus,
  Plus,
  Star,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import ThongTinSanPham from "./ThongTinSanPham";
import { AddToCartSuccessModal } from "./AddToCartSuccessModal";
import { getCartItemQuantity, updateCartItem } from "@/context/cartLocal";
import { CartItemType } from "@/components/types/cart";
import { AddToWishListButton } from "../(wishlist)/AddToWishListButton";

type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

export default function SanPhamHanhDong() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);
  const { data: sanPhamList = [] } = useListKhuyenMaiTheoSanPham();
  const router = useRouter();

  const sanPhamChiTiet = useMemo(
    () =>
      sanPhamList.find(
        (sp) => sp.id === sanPhamID
      ) as SanPhamChiTietWithAnhUrls,
    [sanPhamID, sanPhamList]
  );

  const [soLuong, setSoLuong] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const [cartQuantity, setCartQuantity] = useState(0); // Số lượng sản phẩm trong giỏ hàng

  // Lấy số lượng sản phẩm hiện tại trong giỏ hàng
  useEffect(() => {
    if (sanPhamChiTiet?.id) {
      setCartQuantity(getCartItemQuantity(sanPhamChiTiet.id));
    }
  }, [sanPhamChiTiet?.id]);

  if (!sanPhamChiTiet) {
    return (
      <div className="text-center py-8 text-gray-500">Đang tải sản phẩm...</div>
    );
  }

  const getMaxSoLuong = () => {
    // Tối đa 20 số lượng cho mỗi sản phẩm, hoặc số lượng tồn kho nếu ít hơn 20
    return sanPhamChiTiet.soLuongTon >= 20 ? 20 : sanPhamChiTiet.soLuongTon;
  };

  const tangSoLuong = () => {
    if (soLuong < getMaxSoLuong()) {
      setSoLuong((prev) => prev + 1);
    }
  };

  const giamSoLuong = () => {
    if (soLuong > 1) {
      setSoLuong((prev) => prev - 1);
    }
  };

  const handleSoLuongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value || "0");

    if (value < 1) {
      setSoLuong(0); // Cho phép nhập 0
      return;
    }

    const max = getMaxSoLuong();

    if (value > max) {
      toast.message(`Số lượng tối đa cho phép là ${max}`, { duration: 2000 });
      setSoLuong(max);
    } else {
      setSoLuong(value);
    }
  };

  const addToCartLocal = () => {
    if (soLuong <= 0) {
      toast.error("Vui lòng chọn số lượng hợp lệ!");
      return;
    }

    const item: CartItemType = {
      id: sanPhamChiTiet.id,
      name: sanPhamChiTiet.tenSanPham,
      image: sanPhamChiTiet.anhUrls?.[0]?.url || "",
      price: sanPhamChiTiet.gia || sanPhamChiTiet.giaKhuyenMai || 0,
      quantity: soLuong,
      maxQuantity: getMaxSoLuong(),
    };

    const result = updateCartItem(item, getMaxSoLuong());
    if (!result.success) {
      toast.error(result.message || "Lỗi không xác định");
      return;
    }

    setCartQuantity((prev) => prev + soLuong);
    setIsModalOpen(true);
    setTimeout(() => setIsModalOpen(false), 1000);
  };

  return (
    <div className="w-full md:w-1/2 space-y-8 p-6 bg-white rounded-xl shadow-sm">
      <h1 className="font-bold text-3xl text-gray-900 leading-tight">
        {sanPhamChiTiet.tenSanPham}
      </h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          <span className="ml-1 font-medium text-gray-800">
            {sanPhamChiTiet.danhGiaTrungBinh}
          </span>
          <span className="mx-1 text-gray-400">|</span>
          <span className="text-gray-600 text-sm">
            {sanPhamChiTiet.soLuongVote} đánh giá
          </span>
        </div>

        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
          {sanPhamChiTiet.trangThai}
        </span>
      </div>

      <div className="space-y-2 py-4 border-t border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-3xl text-red-600">
            {(
              sanPhamChiTiet.giaKhuyenMai || sanPhamChiTiet.gia
            )?.toLocaleString()}{" "}
            đ
          </span>
          {sanPhamChiTiet.giaKhuyenMai &&
            sanPhamChiTiet.gia &&
            sanPhamChiTiet.giaKhuyenMai < sanPhamChiTiet.gia && (
              <span className="text-gray-500 line-through text-xl">
                {sanPhamChiTiet.gia.toLocaleString()}đ
              </span>
            )}
        </div>

        {sanPhamChiTiet.giaKhuyenMai &&
          sanPhamChiTiet.gia &&
          sanPhamChiTiet.giaKhuyenMai < sanPhamChiTiet.gia && (
            <div className="flex items-center gap-3">
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                Giảm
                {Math.round(
                  ((sanPhamChiTiet.gia - sanPhamChiTiet.giaKhuyenMai) /
                    sanPhamChiTiet.gia) *
                  100
                )}
                %
              </span>
              <span className="text-sm text-gray-600">
                Tiết kiệm
                {(
                  sanPhamChiTiet.gia - sanPhamChiTiet.giaKhuyenMai
                ).toLocaleString()}{" "}
                đ
              </span>
            </div>
          )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Số lượng</span>
          <span className="text-sm text-gray-500">
            Còn lại: {sanPhamChiTiet.soLuongTon} sản phẩm
          </span>
        </div>

        {cartQuantity > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-600 font-medium">
              Đã có trong giỏ hàng:
            </span>
            <span className="text-sm text-blue-600 font-semibold">
              {cartQuantity} sản phẩm
            </span>
          </div>
        )}

        <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-gray-50 overflow-hidden">
          <Button
            variant="ghost"
            onClick={giamSoLuong}
            disabled={soLuong <= 1}
            className="px-3 hover:bg-gray-100 text-gray-700"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Input
            value={soLuong}
            onChange={handleSoLuongChange}
            min={1}
            max={sanPhamChiTiet.soLuongTon ?? 1}
            className="w-16 text-center border-x-0 border-t-0 border-b-0 rounded-none focus-visible:ring-0 bg-transparent text-lg font-semibold"
          />

          <Button
            variant="ghost"
            onClick={tangSoLuong}
            disabled={soLuong >= (sanPhamChiTiet.soLuongTon ?? 1)}
            className="px-3 hover:bg-gray-100 text-gray-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full gap-3 pt-2">
        <Button
          className="h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
          onClick={addToCartLocal}
          disabled={
            cartQuantity + soLuong > getMaxSoLuong() ||
            sanPhamChiTiet.soLuongTon === 0
          }
        >
          <ShoppingCart className="w-5 h-5 mr-2" /> Thêm vào giỏ hàng
        </Button>

        <Button
          className="h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
          onClick={() => {
            addToCartLocal();
            router.push("/cart");
          }}
          disabled={
            cartQuantity + soLuong > getMaxSoLuong() ||
            sanPhamChiTiet.soLuongTon === 0
          }
        >
          <Zap className="w-5 h-5 mr-2" /> Mua ngay
        </Button>

        <AddToWishListButton
          productId={sanPhamChiTiet.id}
          className="h-12 w-12 border border-gray-200 hover:border-red-300"
          size="lg"
        />
      </div>

      {sanPhamChiTiet.soLuongTon < 5 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg mt-2">
          <CircleAlert className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />

          <p className="text-sm text-yellow-800">
            {sanPhamChiTiet.soLuongTon === 0
              ? "Sản phẩm đã hết hàng!"
              : `Sản phẩm sắp hết hàng! Chỉ còn ${sanPhamChiTiet.soLuongTon} sản phẩm trong kho.`}
          </p>
        </div>
      )}
      <ThongTinSanPham />
      {/* Add the new modal component here */}
      <AddToCartSuccessModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
