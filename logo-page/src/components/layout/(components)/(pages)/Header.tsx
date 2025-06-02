"use client";
import Link from "next/link";
import { SearchIcon, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/context/useSearch.store";

export default function Header() {
  const { keyword, setKeyword } = useSearchStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    if (pathname !== "/product") {
      router.push("/product");
    }
  };

  return (
    <header className="bg-orange-300">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <div className="relative h-12 w-32">
          <Link href="/">
            <Image
              src="/images/logoM.jpg"
              alt="MyKingDom Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {/* Thanh tìm kiếm */}
          <div className="relative flex gap-2 lego-search-container">
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="lego-search-input italic text-black"
            />
            <Button
              onClick={handleSearch}
              className="lego-search-button"
              size="icon"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>

          <Button className="lego-login-button">
            <ShoppingCart />
          </Button>
          <Button className="lego-login-button">
            <Link href="/auth/login" className="lego-button-text">
              Đăng nhập
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
