'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { KhuyenMaiTheoSanPham } from '@/components/types/khuyenmai-type';
import Image from 'next/image';

interface Props {
  products: KhuyenMaiTheoSanPham[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onAddToCart: (product: KhuyenMaiTheoSanPham) => void;
  cart: { id: number; quantity: number }[];
  pendingOrders: { items: { id: number; quantity: number }[] }[];
}

const ProductList: React.FC<Props> = ({ products, searchTerm, onSearch, onAddToCart, cart, pendingOrders }) => {
  console.log('products', products);

  // const getValidImageName = (filenameOrObj: string | { url: string }) => {
  //   let filename = '';
  //   if (typeof filenameOrObj === 'string') {
  //     filename = filenameOrObj;
  //   } else if (filenameOrObj && typeof filenameOrObj === 'object' && 'url' in filenameOrObj) {
  //     filename = filenameOrObj.url;
  //   }
  //   filename = filename.replace(/^anh_/, '');

  //   const lastUnderscore = filename.lastIndexOf('_');
  //   if (lastUnderscore !== -1) {
  //     filename = filename.substring(lastUnderscore + 1);
  //   }

  //   filename = filename.replace(/(.jpg)+$/, '.jpg');
  //   return filename;
  // };

  function getAvailableStock(
    productId: number,
    products: KhuyenMaiTheoSanPham[],
    cart: { id: number; quantity: number }[],
    pendingOrders: { items: { id: number; quantity: number }[] }[]
  ): number {
    const inCart = cart.find((item) => item.id === productId)?.quantity || 0;
    const inPending = pendingOrders
      .flatMap((order) => order.items)
      .filter((item) => item.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);

    const product = products.find((p) => p.id === productId);
    return (product?.soLuongTon || 0) - inCart - inPending;
  }

  return (
    <div className="w-3/5 flex flex-col">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 bg-background/70 border-white/20 text-white placeholder:text-gray-400 text-lg py-6 rounded-xl"
        />
      </div>
      <ScrollArea className="flex-grow pr-4" style={{ height: '520px', minHeight: '320px', maxHeight: '600px' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-3">
          {products.map((product: KhuyenMaiTheoSanPham) => {
            type AnhUrl = { url: string; anhChinh: boolean };
            const getMainImageUrl = (anhUrls: AnhUrl[]) => {
              if (!anhUrls || anhUrls.length === 0) return '/no-image.png';
              const mainImg = anhUrls.find((img) => img.anhChinh);
              const imgToUse = mainImg || anhUrls[0];
              if (imgToUse && imgToUse.url) {
                return `http://localhost:8080/api/anhsp/images/${imgToUse.url}`;
              }
              return '/no-image.png';
            };
            const image = getMainImageUrl(product.anhUrls);
            console.log('image path:', image);
            const isOutOfStock = getAvailableStock(product.id, products, cart, pendingOrders) <= 0;
            return (
              <motion.div key={product.id} whileHover={{ y: -6, scale: 1.03 }} transition={{ duration: 0.15 }}>
                <Card
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                  className={`h-full flex flex-col justify-between cursor-pointer rounded-xl shadow-md border-2 border-transparent hover:border-primary/70 transition-all bg-gradient-to-br from-slate-800 to-slate-700 ${isOutOfStock ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl'}`}
                >
                  <CardContent className="flex flex-col items-center text-center flex-1 justify-between p-2">
                    <div className="w-20 h-20 rounded-lg overflow-hidden mb-2 bg-white/10 relative border border-primary/20">
                      <Image
                        src={image}
                        alt={product.tenSanPham}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      {isOutOfStock && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">Hết hàng</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{product.tenSanPham}</h3>
                    <p className="text-xs text-primary font-bold mb-1">
                      {product.giaKhuyenMai != null && product.giaKhuyenMai > 0 ? (
                        <>
                          <span className="text-sm text-yellow-400 font-extrabold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.giaKhuyenMai)}
                          </span>
                          <span className="ml-1 text-gray-400 line-through text-[10px]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                        </span>
                      )}
                    </p>
                    <p className={`text-xs ${isOutOfStock ? 'text-red-400' : 'text-gray-400'} font-medium`}>Kho: {getAvailableStock(product.id, products, cart, pendingOrders)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {products.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-10">Không tìm thấy sản phẩm nào.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProductList;
