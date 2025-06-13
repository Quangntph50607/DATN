"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BoSuuTap, DanhMuc, SanPham } from '@/components/types/product.type';

interface Props {
  initialData: SanPham | null;
  onSubmit: (SanPham: SanPham) => void;
  onCancel: () => void;
  categories: DanhMuc[];
  BoSuuTaps: BoSuuTap[];
}

const SanPhamFormFields: React.FC<Props> = ({
  initialData,
  onSubmit,
  onCancel,
  categories,
  BoSuuTaps,
}) => {
  const [SanPham, setSanPham] = useState<SanPham>(
    initialData ?? {
      id: 0,
      tenBoSuuTap: '',
      danhMucId: '',
      boSuuTapId: '',
      gia: 0,
      stock: 0,
      pieces: 0,
      imagePreview: '',
      DanhMuc: undefined,
      BoSuuTap: undefined,
      status: 'Còn hàng',
    }
  );

  useEffect(() => {
    if (initialData) {
      setSanPham(initialData);
    }
  }, [initialData]);

  const handleChange = (key: keyof SanPham, value: any) => {
    setSanPham(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(SanPham);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" value={SanPham.name} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={SanPham.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Giá</Label>
          <Input
            id="price"
            type="number"
            value={SanPham.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Số lượng</Label>
          <Input
            id="stock"
            type="number"
            value={SanPham.stock}
            onChange={(e) => handleChange('stock', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pieces">Số lượng mảnh ghép</Label>
          <Input
            id="pieces"
            type="number"
            value={SanPham.pieces}
            onChange={(e) => handleChange('pieces', Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="status">Trạng thái</Label>
          <Select value={SanPham.status} onValueChange={(val) => handleChange('status', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Còn hàng">Còn hàng</SelectItem>
              <SelectItem value="Hết hàng">Hết hàng</SelectItem>
              <SelectItem value="Hết hàng">Ngừng kinh doanh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="imagePreview">URL hình ảnh</Label>
        <Input
          id="imagePreview"
          value={SanPham.imagePreview}
          onChange={(e) => handleChange('imagePreview', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <Select
            value={SanPham.DanhMuc?.toString() ?? ''}
            onValueChange={(val) => handleChange('DanhMuc', Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Bộ sưu tập</Label>
          <Select
            value={SanPham.BoSuuTap?.toString() ?? ''}
            onValueChange={(val) => handleChange('BoSuuTap', Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn bộ sưu tập" />
            </SelectTrigger>
            <SelectContent>
              {BoSuuTaps.map((col) => (
                <SelectItem key={col.id} value={col.id.toString()}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="gradient">
          {initialData ? 'Cập nhật' : 'Thêm sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default SanPhamFormFields;
