import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartSuccessModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-700 text-white text-center">
        <DialogTitle>Thêm vào giỏ hàng thành công</DialogTitle>
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="text-green-500 w-16 h-16" />
          <p className="text-lg font-semibold">
            Sản phẩm đã được thêm vào Giỏ hàng
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
