import { DanhMuc } from "@/components/types/product.type";
import React from "react";
interface CaytegoryListProps {
  categories: DanhMuc[];
}
export default function ProductList({ categories }: CaytegoryListProps) {
  return (
    <div className="">
      {categories.map((category) => (
        <div key={category.id} className="">
          <h2>{category.tenDanhMuc}</h2>
        </div>
      ))}
    </div>
  );
}
