'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Package, DollarSign, Layers, ImageOff, PlusCircle,
  ToyBrick as Brick, Palette, Users as AgeIcon, ChevronsUpDown, Star
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

interface SanPhamFormData {
  id: number | string;
  tenSanPham: string;
  danhMucId: number | string;
  gia: number | string;
  soLuong: number | string;
  soLuongManhGhep: number | string;
  doTuoi: number | string;
  trangThai: string;
  danhGiaTrungBinh: number | string;
  anhDaiDien: string | null;
  moTa: string;
}

interface LegoProductFormProps {
  onSubmit: (data: SanPhamFormData) => void;
  productToEdit?: SanPhamFormData | null;
  onClearEdit: () => void;
}

const defaultFormData: SanPhamFormData = {
  id: '',
  tenSanPham: '',
  danhMucId: '',
  gia: '',
  soLuong: '',
  soLuongManhGhep: '',
  doTuoi: '',
  trangThai: '',
  danhGiaTrungBinh: '',
  anhDaiDien: null,
  moTa: '',
};

const danhMucOptions = [
  { id: 1, tenDanhMuc: "City" },
  { id: 2, tenDanhMuc: "Technic" },
  { id: 3, tenDanhMuc: "Creator" },
  { id: 4, tenDanhMuc: "Star Wars" },
  { id: 5, tenDanhMuc: "Harry Potter" },
  { id: 6, tenDanhMuc: "Friends" },
  { id: 7, tenDanhMuc: "Ninjago" },
  { id: 8, tenDanhMuc: "Duplo" },
  { id: 9, tenDanhMuc: "Architecture" },
  { id: 10, tenDanhMuc: "Speed Champions" },
];

const trangThaiOptions = ["Còn hàng", "Hết hàng", "Ngừng kinh doanh"];

const LegoProductForm: React.FC<LegoProductFormProps> = ({ onSubmit, productToEdit, onClearEdit }) => {
  const [formData, setFormData] = useState<SanPhamFormData>(defaultFormData);
  const { toast } = useToast();

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        gia: productToEdit.gia.toString(),
        soLuong: productToEdit.soLuong.toString(),
        soLuongManhGhep: productToEdit.soLuongManhGhep.toString(),
        doTuoi: productToEdit.doTuoi.toString(),
        danhGiaTrungBinh: productToEdit.danhGiaTrungBinh.toString(),
        danhMucId: productToEdit.danhMucId.toString(),
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [productToEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof SanPhamFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields: (keyof SanPhamFormData)[] = ['tenSanPham', 'danhMucId', 'gia', 'soLuong', 'soLuongManhGhep', 'moTa'];
    const hasEmptyRequired = requiredFields.some(field => !formData[field] || formData[field].toString().trim() === '');

    if (hasEmptyRequired) {
      toast({
        message: "Vui lòng điền đầy đủ các trường bắt buộc (*).",
        type: "error"
      });
      return;
    }

    const processedData: SanPhamFormData = {
      ...formData,
      id: typeof formData.id === 'string' && formData.id === '' ? 0 : Number(formData.id),
      gia: parseFloat(formData.gia.toString()),
      soLuong: parseInt(formData.soLuong.toString()),
      soLuongManhGhep: parseInt(formData.soLuongManhGhep.toString()),
      doTuoi: parseInt(formData.doTuoi.toString()) || 0,
      danhGiaTrungBinh: parseFloat(formData.danhGiaTrungBinh.toString()) || 0,
      danhMucId: Number(formData.danhMucId),
      anhDaiDien: formData.anhDaiDien || null,
    };

    onSubmit(processedData);
    setFormData(defaultFormData);
    if (productToEdit) onClearEdit();
  };

  const fields = [
    { id: 'tenSanPham', label: 'Tên sản phẩm*', placeholder: 'Bộ lắp ráp Tàu vũ trụ', icon: Package },
    { id: 'danhMucId', label: 'Danh mục*', type: 'select', options: danhMucOptions.map(d => ({ value: d.id.toString(), label: d.tenDanhMuc })), icon: Layers },
    { id: 'gia', label: 'Giá (VND)*', type: 'number', placeholder: '500000', icon: DollarSign },
    { id: 'soLuong', label: 'Tồn kho*', type: 'number', placeholder: '50', icon: Package },
    { id: 'soLuongManhGhep', label: 'Số mảnh*', type: 'number', placeholder: '300', icon: Brick },
    { id: 'doTuoi', label: 'Độ tuổi', type: 'number', placeholder: '6-12', icon: AgeIcon },
    { id: 'trangThai', label: 'Trạng thái', type: 'select', options: trangThaiOptions.map(o => ({ value: o, label: o })), icon: ChevronsUpDown },
    { id: 'danhGiaTrungBinh', label: 'Đánh giá (1-5)', type: 'select', options: ['1', '2', '3', '4', '5'].map(o => ({ value: o, label: o })), icon: Star },
    { id: 'anhDaiDien', label: 'URL Hình ảnh', placeholder: 'https://...', icon: ImageOff }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <h2 className="text-2xl font-bold mb-6 text-white pos-gradient-text">
        {productToEdit ? 'Chỉnh sửa sản phẩm LEGO' : 'Thêm sản phẩm LEGO mới'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(field => (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-300 flex items-center">
                {field.icon && <field.icon className="w-4 h-4 mr-2 text-primary" />}
                {field.label}
              </Label>
              {field.type === 'select' ? (
                <Select
                  value={String(formData[field.id as keyof SanPhamFormData] ?? '')}
                  onValueChange={value => handleSelectChange(field.id as keyof SanPhamFormData, value)}
                >
                  <SelectTrigger className="w-full bg-background/70 border border-white/30 text-white rounded-md">
                    <SelectValue placeholder={`Chọn ${field.label.toLowerCase().replace('*', '')}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20 text-white rounded-md">
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  value={String(formData[field.id as keyof SanPhamFormData] ?? '')}
                  onChange={handleChange}
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  className="bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md"
                />
              )}
            </div>
          ))}

          <div className="space-y-1 md:col-span-2 lg:col-span-3">
            <Label htmlFor="moTa" className="text-sm font-medium text-gray-300 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-primary" /> Mô tả sản phẩm*
            </Label>
            <textarea
              id="moTa"
              value={formData.moTa}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về bộ LEGO..."
              rows={3}
              className="w-full bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md p-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {productToEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={onClearEdit}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Hủy sửa
            </Button>
          )}
          <Button type="submit" variant="default" className="shadow-lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            {productToEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default LegoProductForm;
