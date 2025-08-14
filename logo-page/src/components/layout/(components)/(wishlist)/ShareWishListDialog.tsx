import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareWishListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    wishlistName: string;
    wishlistId: number;
}

export function ShareWishListDialog({
    isOpen,
    onClose,
    wishlistName,
    wishlistId,
}: ShareWishListDialogProps) {
    const [copied, setCopied] = useState(false);
    const [shareUrl] = useState(`${window.location.origin}/wishlist/${wishlistId}`);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Đã sao chép liên kết!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error removing from wishListShareLink:', error);
            toast.error('Không thể sao chép liên kết');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-blue-700 font-semibold">
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ Yêu Thích</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-800 text-base">
                        Chia sẻ wish list <strong>{wishlistName}</strong> với bạn bè và gia đình
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Link Input */}
                    <div className="space-y-2">
                        <Label htmlFor="share-link" className="text-sm font-medium text-gray-700">
                            Liên kết chia sẻ
                        </Label>
                        <div className="flex space-x-2">
                            <Input
                                id="share-link"
                                value={shareUrl}
                                readOnly
                                className="flex-1 text-gray-700 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <Button
                                onClick={handleCopyLink}
                                size="sm"
                                className="flex items-center space-x-1 text-white bg-orange-500 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>Đã sao</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Sao chép</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Share Options */}
                    {/* <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Chia sẻ qua
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleShareViaEmail}
                                className="flex items-center space-x-2 h-12 border-blue-300 text-white hover:bg-blue-500 hover:border-blue-500 bg-blue-600"
                            >
                                <Mail className="w-4 h-4" />
                                <span className="font-medium">Email</span>
                            </Button>
                            <Button
                                onClick={handleShareViaSMS}
                                className="flex items-center space-x-2 h-12 border-blue-300 text-white hover:bg-blue-500 hover:border-blue-500 bg-blue-600"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium">SMS</span>
                            </Button>
                        </div>
                    </div> */}
                </div>

                <DialogFooter className="flex space-x-3">
                    <Button
                        variant="default"
                        onClick={onClose}
                        className="border-gray-400 text-gray-700"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 