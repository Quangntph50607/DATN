'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWishList } from '@/hooks/useWishList';
import { toast } from 'sonner';

interface WishListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    editWishList?: {
        id: number;
        ten: string;
    } | null;
    onSuccess?: (message: string) => void;
}

export function WishListModal({ isOpen, onClose, userId, editWishList, onSuccess }: WishListModalProps) {
    const [name, setName] = useState(editWishList?.ten || '');
    const { useCreateWishList, useUpdateWishList } = useWishList();

    const createWishList = useCreateWishList();
    const updateWishList = useUpdateWishList();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Vui lòng nhập tên wish list');
            return;
        }

        try {
            if (editWishList) {
                await updateWishList.mutateAsync({ id: editWishList.id, ten: name });
                onClose();
                setName('');
                onSuccess?.('Cập nhật wish list thành công!');
            } else {
                await createWishList.mutateAsync({ ten: name, userId });
                onClose();
                setName('');
                onSuccess?.('Tạo wish list thành công!');
            }
        } catch (error) {
            console.error('Error in WishListModal:', error);
            toast.error('Có lỗi xảy ra khi tạo/cập nhật wish list');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">
                        {editWishList ? 'Chỉnh sửa yêu thích' : 'Tạo yêu thích mới'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Tên yêu thích</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên yêu thích..."
                            disabled={createWishList.isPending || updateWishList.isPending}
                            className="border border-gray-300 text-gray-700"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={createWishList.isPending || updateWishList.isPending}
                            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-transparent hover:text-gray-700"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={createWishList.isPending || updateWishList.isPending}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {createWishList.isPending || updateWishList.isPending ? 'Đang xử lý...' :
                                editWishList ? 'Cập nhật' : 'Tạo'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 