import { Input } from "@/components/ui/input";

interface ThuongHieuSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export default function ThuongHieuSearch({ searchTerm, setSearchTerm }: ThuongHieuSearchProps) {
    return (
        <Input
            type="text"
            placeholder="Tìm kiếm tên thương hiệu"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
    );
} 