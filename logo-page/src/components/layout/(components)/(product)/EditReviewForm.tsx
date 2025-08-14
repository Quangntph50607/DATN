'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, ImageIcon, Video } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";

interface EditReviewFormProps {
    tieuDe: string;
    setTieuDe: (value: string) => void;
    textDanhGia: string;
    setTextDanhGia: (value: string) => void;
    soSao: number;
    setSoSao: (value: number) => void;
    isSubmitting: boolean;
    onFormSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    anhUrls?: { id: number; url: string }[];
    video?: { id: number; url: string };
    // Props mới cho chức năng update
    newImages?: File[];
    setNewImages?: (files: File[]) => void;
    setNewVideo?: (file: File | null) => void;
    // Props cho ẩn/hiện tạm thời
    hiddenImageIds?: number[];
    setHiddenImageIds?: (ids: number[]) => void;
    hiddenVideoId?: number | null;
    setHiddenVideoId?: (id: number | null) => void;
}

export default function EditReviewForm({
    tieuDe,
    setTieuDe,
    textDanhGia,
    setTextDanhGia,
    soSao,
    setSoSao,
    isSubmitting,
    onFormSubmit,
    onCancel,
    anhUrls = [],
    video,
    newImages = [],
    setNewImages,
    setNewVideo,
    hiddenImageIds = [],
    setHiddenImageIds,
    hiddenVideoId,
    setHiddenVideoId,
}: EditReviewFormProps) {
    // Local states cho preview ảnh/video mới
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [newVideoPreview, setNewVideoPreview] = useState<string | null>(null);

    // Xử lý upload ảnh mới
    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);

            // Tính số ảnh hiện tại (ảnh cũ không bị ẩn + ảnh mới đã chọn)
            const visibleOldImages = anhUrls?.filter(img => !hiddenImageIds.includes(img.id)).length || 0;
            const currentNewImages = newImages.length;
            const totalCurrentImages = visibleOldImages + currentNewImages;
            const availableSlots = Math.max(0, 3 - totalCurrentImages);

            console.log("🔍 Image upload check:", {
                visibleOldImages,
                currentNewImages,
                totalCurrentImages,
                availableSlots,
                newFiles: fileArray.length
            });

            if (availableSlots <= 0) {
                alert("Bạn đã đạt tối đa 3 ảnh. Hãy ẩn bớt ảnh cũ hoặc xóa ảnh mới để thêm mới.");
                return;
            }

            const acceptedFiles = fileArray.slice(0, availableSlots);
            if (acceptedFiles.length < fileArray.length) {
                alert(`Chỉ có thể thêm ${acceptedFiles.length} ảnh để đạt tối đa 3 ảnh.`);
            }

            // Tạo preview URLs
            const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
            
            // Cập nhật state
            if (setNewImages) {
                setNewImages([...newImages, ...acceptedFiles]);
            }
        }
    };

    // Xử lý upload video mới
    const handleNewVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert('Video không được vượt quá 50MB!');
                return;
            }
            
            const previewUrl = URL.createObjectURL(file);
            setNewVideoPreview(previewUrl);
            
            if (setNewVideo) {
                setNewVideo(file);
            }
        }
    };

    // Xóa ảnh mới
    const removeNewImage = (index: number) => {
        if (setNewImages) {
            const updatedImages = newImages.filter((_, i) => i !== index);
            setNewImages(updatedImages);
            
            // Xóa preview
            const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
            setNewImagePreviews(updatedPreviews);
        }
    };

    // Xóa video mới
    const removeNewVideo = () => {
        if (setNewVideo) {
            setNewVideo(null);
            setNewVideoPreview(null);
        }
    };

    // Xử lý ẩn/hiện ảnh hiện tại
    const toggleImageVisibility = (imageId: number) => {
        if (setHiddenImageIds) {
            if (hiddenImageIds.includes(imageId)) {
                setHiddenImageIds(hiddenImageIds.filter(id => id !== imageId));
            } else {
                setHiddenImageIds([...hiddenImageIds, imageId]);
            }
        }
    };

    // Xử lý ẩn/hiện video hiện tại
    const toggleVideoVisibility = () => {
        if (setHiddenVideoId && video) {
            setHiddenVideoId(hiddenVideoId === video.id ? null : video.id);
        }
    };

    // Lọc ảnh hiện tại (loại bỏ những ảnh bị ẩn)
    const visibleImages = anhUrls.filter(img => !hiddenImageIds.includes(img.id));
    const isVideoHidden = video && hiddenVideoId === video.id;

    return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-lg max-w-3xl w-full relative max-h-[70vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Sửa đánh giá của bạn</h2>
            <form onSubmit={onFormSubmit} className="space-y-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-base font-medium">Tiêu đề</Label>
                        <Input
                            className="h-12 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                            value={tieuDe}
                            onChange={e => setTieuDe(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base font-medium">Nội dung</Label>
                        <Textarea
                            className="min-h-[90px] text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                            value={textDanhGia}
                            onChange={e => setTextDanhGia(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-base font-medium block">Đánh giá của bạn</Label>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="p-0 h-auto bg-transparent hover:bg-transparent focus:outline-none"
                                        onClick={() => setSoSao(i)}
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors ${i <= soSao
                                                ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500"
                                                : "text-gray-300 hover:text-gray-400"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-lg font-semibold">
                                {soSao} {soSao > 1 ? "sao" : "sao"}
                            </span>
                        </div>
                    </div>

                    {/* Phần Ảnh */}
                    <div>
                        <Label className="flex items-center gap-2 text-base font-medium text-emerald-700 mb-2">
                            <ImageIcon className="h-5 w-5" />
                            Ảnh đánh giá
                        </Label>
                        
                        {/* Thêm ảnh mới */}
                        <label className="border-2 border-dashed border-emerald-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white hover:bg-emerald-50 transition-colors cursor-pointer w-full mb-4">
                            <Input
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                className="hidden"
                                onChange={handleNewImageUpload}
                            />
                            <ImageIcon className="h-8 w-8 text-emerald-400 mb-2" />
                            <span className="text-gray-500 text-sm text-center">
                                Nhấn để chọn ảnh hoặc kéo thả<br />JPEG, PNG (Tối đa 3 ảnh)
                            </span>
                        </label>

                        {/* Hiển thị ảnh mới */}
                        {newImagePreviews.length > 0 && (
                            <div className="space-y-3 mb-4">
                                <Label className="flex items-center gap-2 text-base font-medium text-emerald-600">
                                    <ImageIcon className="h-5 w-5" />
                                    Ảnh mới ({newImagePreviews.length})
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {newImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={preview}
                                                alt={`Ảnh mới ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-20 object-cover rounded-lg border border-emerald-300 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-100 shadow-md"
                                                title="Xóa ảnh"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-emerald-500 bg-opacity-90 text-white text-xs px-1 rounded">
                                                Mới {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hiển thị ảnh hiện tại */}
                        {visibleImages.length > 0 && (
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-base font-medium text-gray-800">
                                    <ImageIcon className="h-5 w-5 text-emerald-500" />
                                    Ảnh hiện tại ({visibleImages.length})
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {visibleImages.map((anh, index) => (
                                        <div key={anh.id} className="relative group">
                                            <Image
                                                src={anh.url} // Dùng trực tiếp url từ API
                                                alt={`Ảnh ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                            />
                                            {/* Nút X để ẩn ảnh */}
                                            <button
                                                type="button"
                                                onClick={() => toggleImageVisibility(anh.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-orange-600 transition-colors opacity-100 shadow-md"
                                                title="Ẩn ảnh"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hiển thị ảnh bị ẩn - BỎ PHẦN NÀY */}
                        {/* {hiddenImageIds.length > 0 && (
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-base font-medium text-gray-500">
                                    <ImageIcon className="h-5 w-5" />
                                    Ảnh đã ẩn ({hiddenImageIds.length})
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {anhUrls.filter(img => hiddenImageIds.includes(img.id)).map((anh, index) => (
                                        <div key={anh.id} className="relative group">
                                            <Image
                                                src={anh.url}
                                                alt={`Ảnh ẩn ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm opacity-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleImageVisibility(anh.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 transition-colors opacity-100 shadow-md"
                                                title="Hiện ảnh"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-gray-500 bg-opacity-90 text-white text-xs px-1 rounded">
                                                Ẩn {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>

                    {/* Phần Video */}
                    <div>
                        <Label className="flex items-center gap-2 text-base font-medium text-rose-700 mb-2">
                            <Video className="h-5 w-5" />
                            Video đánh giá
                        </Label>
                        
                        {/* Thêm video mới */}
                        <label className="border-2 border-dashed border-rose-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white hover:bg-rose-50 transition-colors cursor-pointer w-full mb-4">
                            <Input
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                                onChange={handleNewVideoUpload}
                            />
                            <Video className="h-8 w-8 text-rose-400 mb-2" />
                            <span className="text-gray-500 text-sm text-center">
                                Nhấn để chọn video hoặc kéo thả<br />MP4 (Tối đa 1 video, 50MB)
                            </span>
                        </label>

                        {/* Hiển thị video mới */}
                        {newVideoPreview && (
                            <div className="space-y-3 mb-4">
                                <Label className="flex items-center gap-2 text-base font-medium text-rose-600">
                                    <Video className="h-5 w-5" />
                                    Video mới
                                </Label>
                                <div className="relative group">
                                    <video
                                        src={newVideoPreview}
                                        controls
                                        className="w-full h-32 object-cover rounded-lg border border-rose-300 shadow-sm"
                                        preload="metadata"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeNewVideo}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-100 shadow-md"
                                        title="Xóa video"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-rose-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                                        Video mới
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hiển thị video hiện tại */}
                        {video && !isVideoHidden && (
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-base font-medium text-gray-800">
                                    <Video className="h-5 w-5 text-rose-500" />
                                    Video hiện tại
                                </Label>
                                <div className="relative group">
                                    <video
                                        src={video.url} // Dùng trực tiếp url từ API
                                        controls
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        preload="metadata"
                                    />
                                    {/* Nút X để ẩn video */}
                                    <button
                                        type="button"
                                        onClick={toggleVideoVisibility}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-orange-600 transition-colors opacity-100 shadow-md"
                                        title="Ẩn video"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        Video
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hiển thị video bị ẩn - BỎ PHẦN NÀY */}
                        {/* {video && isVideoHidden && (
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-base font-medium text-gray-500">
                                    <Video className="h-5 w-5" />
                                    Video đã ẩn
                                </Label>
                                <div className="relative group">
                                    <video
                                        src={video.url}
                                        controls
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm opacity-50"
                                        preload="metadata"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleVideoVisibility}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 transition-colors opacity-100 shadow-md"
                                        title="Hiện video"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-gray-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                                        Video ẩn
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            type="button"
                            variant="default"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
                        >
                            <X className="h-5 w-5 mr-2" /> Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {newVideoPreview ? 'Đang tải video...' : 'Đang lưu...'}
                                </div>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}