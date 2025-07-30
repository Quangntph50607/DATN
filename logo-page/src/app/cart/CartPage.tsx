"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import CartVoucherModal from "./(components)/CartVoucherModal";
import { CartMain } from "./(components)/CartMain";
import { CartSummary } from "./(components)/CartSummary";
import { sanPhamService } from "@/services/sanPhamService";
import { danhMucService } from "@/services/danhMucService";
import { thuongHieuService } from "@/services/thuongHieuService";
import { xuatXuService } from "@/services/xuatXuService";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ConfirmDialog";

export default function CartPage() {
  const router = useRouter();

  // Cart data states
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [productDetails, setProductDetails] = useState<{ [key: number]: any }>(
    {}
  );
  const [categoryNames, setCategoryNames] = useState<{ [key: number]: string }>(
    {}
  );
  const [brandNames, setBrandNames] = useState<{ [key: number]: string }>({});
  const [originNames, setOriginNames] = useState<{ [key: number]: string }>({});

  // Voucher states
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(
    null
  );
  const [voucherInput, setVoucherInput] = useState("");

  const { data: voucherList = [] } = useGetPhieuGiam();

  // Add states for confirmation dialogs
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Load product details by ID
  const loadProductDetails = async (productIds: number[]) => {
    const details: { [key: number]: any } = {};

    for (const id of productIds) {
      if (!productDetails[id]) {
        try {
          const product = await sanPhamService.getSanPhamID(id);
          details[id] = product;
        } catch (error) {
          console.error(`Lỗi lấy thông tin sản phẩm ${id}:`, error);
        }
      }
    }

    if (Object.keys(details).length > 0) {
      setProductDetails((prev) => ({ ...prev, ...details }));

      // Load additional info after getting product details
      const products = Object.values(details);
      loadAdditionalInfo(products);
    }
  };

  // Load category, brand, origin names
  const loadAdditionalInfo = async (products: any[]) => {
    const categoryIds = [
      ...new Set(products.map((p) => p.danhMucId).filter(Boolean)),
    ];
    const brandIds = [
      ...new Set(products.map((p) => p.thuongHieuId).filter(Boolean)),
    ];
    const originIds = [
      ...new Set(products.map((p) => p.xuatXuId).filter(Boolean)),
    ];

    // Load categories
    for (const id of categoryIds) {
      if (!categoryNames[id]) {
        try {
          const category = await danhMucService.getDanhMucId(id);
          setCategoryNames((prev) => ({ ...prev, [id]: category.tenDanhMuc }));
        } catch (error) {
          console.error(`Error loading category ${id}:`, error);
        }
      }
    }

    // Load brands
    for (const id of brandIds) {
      if (!brandNames[id]) {
        try {
          const brands = await thuongHieuService.getAll();
          const brand = brands.find((b) => b.id === id);
          if (brand) {
            setBrandNames((prev) => ({ ...prev, [id]: brand.ten }));
          }
        } catch (error) {
          console.error(`Error loading brand ${id}:`, error);
        }
      }
    }

    // Load origins
    for (const id of originIds) {
      if (!originNames[id]) {
        try {
          const origins = await xuatXuService.getAll();
          const origin = origins.find((o) => o.id === id);
          if (origin) {
            setOriginNames((prev) => ({ ...prev, [id]: origin.ten }));
          }
        } catch (error) {
          console.error(`Error loading origin ${id}:`, error);
        }
      }
    }
  };

  // Load images
  const loadImages = async (products: any[]) => {
    const urls: Record<number, string | null> = {};
    for (const product of products) {
      try {
        const images = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(
          product.id
        );
        if (images && images.length > 0) {
          const mainImg = images.find((img) => img.anhChinh) || images[0];
          if (mainImg?.url) {
            urls[
              product.id
            ] = `http://localhost:8080/api/anhsp/images/${mainImg.url}`;
          }
        }
      } catch (error) {
        console.error(`Lỗi lấy ảnh sản phẩm ${product.id}:`, error);
      }

      if (!urls[product.id]) {
        urls[product.id] = "/images/placeholder-product.png";
      }
    }
    setImageUrls(urls);
  };

  // Initialize cart data
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");

    const fixedCart = cart.map((item: any) => ({
      id: Number(item.id) || 0,
      name: item.name || item.tenSanPham || "Sản phẩm không tên",
      price:
        Number(item.price) ||
        Number(item.gia) ||
        Number(item.giaKhuyenMai) ||
        0,
      quantity: Number(item.quantity) || Number(item.soLuong) || 1,
    }));

    setItems(fixedCart);
    setSelectedIds(fixedCart.map((item: any) => item.id));

    const productIds = fixedCart.map((item) => item.id);
    if (productIds.length > 0) {
      loadProductDetails(productIds);
      loadImages(fixedCart);
    }
  }, []);

  // Cart actions
  const handleQuantityChange = (id: number, delta: number) => {
    setItems((prev: any[]) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemove = (id: number) => {
    setItemToDelete(id);
    setDeleteItemOpen(true);
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev: number[]) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allSelected = items.length > 0 && selectedIds.length === items.length;
    if (allSelected) {
      // Show confirmation for unselect all
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    localStorage.setItem("checkoutDiscount", String(totalAfterDiscount));
    router.push("/cart/checkout");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalAfterDiscount = Math.max(0, subtotal - discount);

  const handleApplyVoucher = () => {
    const voucher = voucherList.find((v) => v.maPhieu === voucherInput);
    if (voucher) {
      const discountAmount =
        voucher.loaiGiam === "PERCENT"
          ? (subtotal * voucher.giaTriGiam) / 100
          : voucher.giaTriGiam;

      setDiscount(
        Math.min(discountAmount, voucher.giamToiDa || discountAmount)
      );
      setSelectedVoucher(voucher);
      setVoucherMessage("Áp dụng voucher thành công!");
    } else {
      setVoucherMessage("Mã voucher không hợp lệ!");
    }
  };

  // Add function to handle delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để xóa!");
      return;
    }
    setDeleteSelectedOpen(true);
  };

  const confirmDeleteSelected = () => {
    selectedIds.forEach((id) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        localStorage.setItem("cartItems", JSON.stringify(updated));
        return updated;
      });
    });
    setSelectedIds([]);
    setDeleteSelectedOpen(false);
    toast.success(`Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng!`);
  };
  const confirmDeleteItem = () => {
    if (itemToDelete) {
      setItems((prev: any[]) => {
        const updated = prev.filter((item) => item.id !== itemToDelete);
        localStorage.setItem("cartItems", JSON.stringify(updated));
        setSelectedIds((prevIds: number[]) =>
          prevIds.filter((sid) => sid !== itemToDelete)
        );
        return updated;
      });
      setDeleteItemOpen(false);
      setItemToDelete(null);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
        </div>

        <div className="flex gap-6">
          <CartMain
            items={items}
            selectedIds={selectedIds}
            imageUrls={imageUrls}
            productDetails={productDetails}
            categoryNames={categoryNames}
            brandNames={brandNames}
            originNames={originNames}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            formatCurrency={formatCurrency}
            onDeleteSelected={handleDeleteSelected}
          />

          <CartSummary
            selectedItems={selectedItems}
            discount={discount}
            selectedVoucher={selectedVoucher}
            voucherInput={voucherInput}
            voucherMessage={voucherMessage}
            onVoucherInputChange={setVoucherInput}
            onApplyVoucher={handleApplyVoucher}
            onShowVoucherModal={() => setShowVoucherModal(true)}
            onCheckout={handleCheckout}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      <CartVoucherModal
        show={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        voucherList={voucherList}
        loadingVouchers={false}
        total={subtotal}
        selectedVoucherCode={selectedVoucher?.maPhieu || ""}
        onSelectVoucherRadio={(code) => {
          const voucher = voucherList.find((v) => v.maPhieu === code);
          if (voucher) {
            setSelectedVoucher(voucher);
            setVoucherInput(code);
          }
        }}
        voucherInput={voucherInput}
        setVoucherInput={setVoucherInput}
        handleApplyVoucher={handleApplyVoucher}
        handleOkVoucher={() => setShowVoucherModal(false)}
      />

      {/* Add AlertDialog for delete confirmation */}

      <ConfirmDialog
        open={deleteSelectedOpen}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setDeleteSelectedOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng? Hành động này không thể hoàn tác.`}
      />
      {/* AlertDialog for delete single item confirmation */}

      <ConfirmDialog
        open={deleteItemOpen}
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
