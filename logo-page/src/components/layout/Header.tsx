import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Home, SearchIcon, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-orange-300 ">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <div className="relative h-12 w-32 ">
          <Image
            src="/images/logoM.jpg"
            alt="MyKingDom Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="lego-nav-link">
            <Button className="font-bold flex gap-1 lego-login-button">
              <Home /> Home
            </Button>
          </Link>

          {/* Search Bar với hiệu ứng LEGO */}
          <div className="relative flex gap-2 lego-search-container">
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm...  "
              className="lego-search-input italic text-black"
            />
            <Button className="lego-search-button" size="icon">
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
