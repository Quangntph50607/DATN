'use client';

import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-6 w-full">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-10 h-5" />
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm LEGO (Tên, Danh mục...)"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-12 bg-background/70 border border-white/20 text-white placeholder:text-gray-400 text-lg py-3 rounded-xl h-12 w-full"
      />
    </div>
  );
};

export default SearchInput;
