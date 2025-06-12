import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/context/authStore.store";
import { LogOut, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function UserDropDown() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const route = useRouter();
  const handleLogout = () => {
    clearUser();
    route.push("/");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <User2 />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Xin chào , <span className="font-semibold">{user?.user_name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => route.push("profile")}>
          Tài khoản
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
