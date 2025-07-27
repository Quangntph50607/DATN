import { Input } from "@/components/ui/input";

interface XuatXuSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export default function XuatXuSearch({ searchTerm, setSearchTerm }: XuatXuSearchProps) {
    return (
        <Input
            type="text"
            placeholder="Tìm kiếm tên xuất xứ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
    );
} 