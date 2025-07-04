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
}

const ProductList: React.FC<Props> = ({ products, searchTerm, onSearch, onAddToCart }) => {
  console.log('products', products);

  const getValidImageName = (filenameOrObj: string | { url: string }) => {
    let filename = '';
    if (typeof filenameOrObj === 'string') {
      filename = filenameOrObj;
    } else if (filenameOrObj && typeof filenameOrObj === 'object' && 'url' in filenameOrObj) {
      filename = filenameOrObj.url;
    }
    filename = filename.replace(/^anh_/, '');

    const lastUnderscore = filename.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      filename = filename.substring(lastUnderscore + 1);
    }

    filename = filename.replace(/(.jpg)+$/, '.jpg');
    return filename;
  };

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
      <ScrollArea className="flex-grow pr-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: KhuyenMaiTheoSanPham) => {
            const image = product.anhUrls && product.anhUrls.length > 0
              ? `/images/${getValidImageName(product.anhUrls[0])}`
              : '/no-image.png';
            console.log('image path:', image);
            return (
              <motion.div key={product.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card onClick={() => onAddToCart(product)} className="glass-card cursor-pointer hover:border-primary/50 transition-all">
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-md overflow-hidden mb-2 bg-white/10 relative">
                      <Image
                        src={image}
                        alt={product.tenSanPham}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{product.tenSanPham}</h3>
                    <p className="text-xs text-primary font-bold">
                      {product.giaKhuyenMai != null && product.giaKhuyenMai > 0 ? (
                        <>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.giaKhuyenMai)}
                          <span className="ml-2 text-gray-400 line-through text-xs">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                          </span>
                        </>
                      ) : (
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)
                      )}
                    </p>
                    <p className={`text-xs ${product.soLuongTon > 0 ? 'text-gray-400' : 'text-red-400'}`}>Kho: {product.soLuongTon}</p>
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
