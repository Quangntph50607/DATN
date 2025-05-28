import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Mở Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận hành động</DialogTitle>
          <DialogDescription>
            Bạn có muốn thêm sản phẩm này vào giỏ hàng hoặc mua ngay?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between">
          <Button variant="ghost">X</Button>
          <div className="space-x-2">
            <Button>Thêm vào giỏ hàng</Button>
            <Button variant="default">Mua ngay</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
