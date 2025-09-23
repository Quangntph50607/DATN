"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BoSuuTap } from "@/components/types/product.type";
import { CalendarDays, Palette, PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  collectionToEdit: BoSuuTap | null;
  onSubmit: (data: BoSuuTap) => void;
  onClearEdit: () => void;
}

const LegoCollectionForm: React.FC<Props> = ({
  collectionToEdit,
  onSubmit,
  onClearEdit,
}) => {
  const [tenBoSuuTap, setTenBoSuuTap] = useState("");
  const [moTa, setMoTa] = useState("");
  const [namPhatHanh, setNamPhatHanh] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    if (collectionToEdit) {
      setTenBoSuuTap(collectionToEdit.tenBoSuuTap);
      setMoTa(collectionToEdit.moTa);
      setNamPhatHanh(collectionToEdit.namPhatHanh);
    } else {
      setTenBoSuuTap("");
      setMoTa("");
      setNamPhatHanh(new Date().getFullYear());
    }
  }, [collectionToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenBoSuuTap.trim()) {
      alert("Tên bộ sưu tập không được để trống");
      return;
    }

    const data: BoSuuTap = {
      id: collectionToEdit ? collectionToEdit.id : 0,
      tenBoSuuTap: tenBoSuuTap.trim(),
      moTa: moTa.trim(),
      namPhatHanh,
      ngayTao: collectionToEdit
        ? collectionToEdit.ngayTao
        : new Date().toISOString(),
    };

    onSubmit(data);
    setTenBoSuuTap("");
    setMoTa("");
    setNamPhatHanh(new Date().getFullYear());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        {collectionToEdit
          ? "Chỉnh sửa bộ sưu tập"
          : "Thêm bộ sưu tập mới"}
      </h2>

      <div>
        <Label
          htmlFor="tenBoSuuTap"
          className="text-sm text-gray-300 flex items-center mb-1"
        >
          <CalendarDays className="w-4 h-4 mr-2 text-primary" />
          Tên bộ sưu tập*
        </Label>
        <Input
          id="tenBoSuuTap"
          value={tenBoSuuTap}
          onChange={(e) => setTenBoSuuTap(e.target.value)}
          placeholder="Tên bộ sưu tập LEGO"
          className="bg-background/70 border border-white/30 text-white"
        />
      </div>

      <div>
        <Label
          htmlFor="moTa"
          className="text-sm text-gray-300 flex items-center mb-1"
        >
          <Palette className="w-4 h-4 mr-2 text-primary" />
          Mô tả
        </Label>
        <Textarea
          id="moTa"
          rows={3}
          value={moTa}
          onChange={(e) => setMoTa(e.target.value)}
          placeholder="Mô tả chi tiết về bộ sưu tập..."
          className="w-full h-30   p-2 text-sm "
        />
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClearEdit}
          className="border-white/30 text-white hover:bg-white/10"
        >
          Hủy
        </Button>
        <Button type="submit" variant="default" className="shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          {collectionToEdit ? "Lưu thay đổi" : "Thêm bộ sưu tập"}
        </Button>
      </div>
    </form>
  );
};

export default LegoCollectionForm;
