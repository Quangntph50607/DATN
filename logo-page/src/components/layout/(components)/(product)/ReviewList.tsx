// ReviewList.tsx
import { DanhGiaResponse } from "@/components/types/danhGia-type";
import Image from "next/image";
import { Calendar, CornerDownRight, Star, MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useQueryClient } from "@tanstack/react-query";
import EditReviewForm from "./EditReviewForm";
import { Button } from "@/components/ui/button";
import QuanLyThongBao from "./QuanLyThongBao";
import { useUpdateDanhGiaWithFiles, useDeleteAnhDanhGia, useDeleteVideoDanhGia } from "@/hooks/useDanhGia";

// Tái sử dụng component UserInfo từ file gốc
const UserInfo = ({
  danhGia,
  soSao,
}: {
  danhGia: DanhGiaResponse;
  soSao?: number;
}) => {
  // Logic lấy tên người dùng với ưu tiên
  let displayName = "Khách";

  if (danhGia.user?.ten && danhGia.user.ten.trim()) {
    displayName = danhGia.user.ten.trim();
  } else if (danhGia.tenNguoiDung && danhGia.tenNguoiDung.trim()) {
    displayName = danhGia.tenNguoiDung.trim();
  } else if (danhGia.tenKH && danhGia.tenKH.trim()) {
    displayName = danhGia.tenKH.trim();
  }

  const avatar = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
        {avatar}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{displayName}</p>
        {soSao && (
          <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < soSao ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ReviewListProps {
  danhGias: DanhGiaResponse[];
  parseDate: (dateInput: string | number[]) => string;
  onMediaClick: (media: { type: "image" | "video"; url: string }) => void;
  selectedFilter: string;
}

export default function ReviewList({
  danhGias,
  parseDate,
  onMediaClick,
  selectedFilter,
}: ReviewListProps) {
  const { user } = useUserStore();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingReview, setEditingReview] = useState<DanhGiaResponse | null>(null);
  const [editTieuDe, setEditTieuDe] = useState("");
  const [editTextDanhGia, setEditTextDanhGia] = useState("");
  const [editSoSao, setEditSoSao] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  
  // States cho chức năng update với files
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [hiddenImageIds, setHiddenImageIds] = useState<number[]>([]);
  const [hiddenVideoId, setHiddenVideoId] = useState<number | null>(null);
  
  const updateReviewMutation = useUpdateDanhGiaWithFiles();
  const deleteAnhMutation = useDeleteAnhDanhGia();
  const deleteVideoMutation = useDeleteVideoDanhGia();

  // Sắp xếp đánh giá mới nhất lên trên
  const sortedDanhGias = [...danhGias].sort((a, b) => {
    const getDate = (d: DanhGiaResponse) => {
      if (Array.isArray(d.ngayDanhGia)) {
        const [y, m, day, h = 0, min = 0, s = 0] = d.ngayDanhGia;
        return new Date(y, m - 1, day, h, min, s).getTime();
      } else {
        return new Date(d.ngayDanhGia).getTime();
      }
    };
    return getDate(b) - getDate(a);
  });

  // Hàm kiểm tra quyền sửa đánh giá
  const canEdit = (danhGia: DanhGiaResponse) => {
    if (!user || user.id !== danhGia.userId) return false;
    if (!danhGia.ngayDanhGia) return false;
    const now = new Date();
    let reviewDate: Date;
    if (Array.isArray(danhGia.ngayDanhGia)) {
      const [y, m, d, h = 0, min = 0, s = 0] = danhGia.ngayDanhGia;
      reviewDate = new Date(y, m - 1, d, h, min, s);
    } else {
      reviewDate = new Date(danhGia.ngayDanhGia);
    }
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };

  // Hàm submit sửa đánh giá
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      // Xóa ảnh/video bị ẩn trước
      await handleDeleteHiddenImages();
      await handleDeleteHiddenVideo();

      // Hiển thị thông báo đang xử lý nếu có video
      if (newVideo) {
        console.log("🔍 Uploading video...", { videoSize: newVideo.size, videoName: newVideo.name });
        // Có thể thêm toast notification ở đây
      }

      // Khách hàng chỉ được sửa tieuDe, textDanhGia, soSao và media
      // Không được sửa textPhanHoi (phản hồi từ admin)
      const result = await updateReviewMutation.mutateAsync({
        idDanhGia: editingReview.id,
        idNv: user!.id,
        soSao: editSoSao,
        tieuDe: editTieuDe,
        textDanhGia: editTextDanhGia,
        textPhanHoi: editingReview.textPhanHoi || "", // Giữ nguyên phản hồi hiện tại
        newImages: newImages.length > 0 ? newImages : undefined,
        newVideo: newVideo || undefined,
      });
      
      // Reset states
      setEditingReview(null);
      setNewImages([]);
      setNewVideo(null);
      setHiddenImageIds([]);
      setHiddenVideoId(null);
      setShowSuccessModal(true);
      
      // Invalidate tất cả queries liên quan đến danhGia
      queryClient.invalidateQueries({ queryKey: ["danhGia"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      
      console.log("✅ Review updated successfully!", result);
    } catch (err: unknown) {
      let msg = "Có lỗi khi cập nhật đánh giá";
      if (err instanceof Error) msg = err.message;
      console.error("❌ Error updating review:", err);
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xóa ảnh bị ẩn khi submit
  const handleDeleteHiddenImages = async () => {
    for (const imageId of hiddenImageIds) {
      try {
        await deleteAnhMutation.mutateAsync({
          idAnh: imageId,
          idNv: user!.id,
        });
      } catch (err) {
        console.error("Lỗi khi xóa ảnh:", err);
      }
    }
  };

  // Hàm xóa video bị ẩn khi submit
  const handleDeleteHiddenVideo = async () => {
    if (hiddenVideoId && editingReview?.video) {
      try {
        await deleteVideoMutation.mutateAsync({
          idVideo: editingReview.video.id,
          idNv: user!.id,
        });
      } catch (err) {
        console.error("Lỗi khi xóa video:", err);
      }
    }
  };

  if (danhGias.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="text-6xl mb-4">😊</div>
        <div className="text-xl text-gray-600 mb-2 font-semibold">
          {selectedFilter === "all"
            ? "Chưa có đánh giá nào"
            : "Không có đánh giá phù hợp"}
        </div>
        <div className="text-gray-500">
          {selectedFilter === "all"
            ? "Hãy là người đầu tiên đánh giá!"
            : "Thử chọn bộ lọc khác!"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDanhGias.map((danhGia) => (
        <div
          key={danhGia.id}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <UserInfo danhGia={danhGia} soSao={danhGia.soSao} />
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                {parseDate(danhGia.ngayDanhGia)}
              </div>
              {/* Menu 3 chấm */}
              {canEdit(danhGia) && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="p-2 rounded-full focus:outline-none shadow-none bg-transparent hover:bg-transparent active:bg-transparent"
                    style={{ boxShadow: 'none' }}
                    onClick={() => setOpenMenuId(openMenuId === danhGia.id ? null : danhGia.id)}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </Button>
                  {openMenuId === danhGia.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <Button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                        onClick={() => {
                          setOpenMenuId(null);
                          setEditingReview(danhGia);
                          setEditTieuDe(danhGia.tieuDe);
                          setEditTextDanhGia(danhGia.textDanhGia);
                          setEditSoSao(danhGia.soSao);
                          // Reset media states
                          setNewImages([]);
                          setNewVideo(null);
                          setHiddenImageIds([]);
                          setHiddenVideoId(null);
                        }}
                      >
                        Sửa đánh giá
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {danhGia.tieuDe}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {danhGia.textDanhGia}
            </p>
          </div>

          {(danhGia.anhUrls?.length || danhGia.video) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {danhGia.anhUrls?.map((anh, index) => (
                <Image
                  key={anh.id}
                  src={
                    anh.url.startsWith("http")
                      ? anh.url
                      : `https://res.cloudinary.com/durppqsk4/image/upload/${anh.url}`
                  }
                  alt={`Ảnh ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-md"
                  onClick={() =>
                    onMediaClick({
                      type: "image",
                      url: anh.url.startsWith("http")
                        ? anh.url
                        : `https://res.cloudinary.com/durppqsk4/image/upload/${anh.url}`,
                    })
                  }
                />
              ))}
              {danhGia.video && (
                <div
                  className="w-20 h-20 bg-gray-900 rounded-xl cursor-pointer relative overflow-hidden hover:scale-105 transition-transform shadow-md"
                  onClick={() =>
                    onMediaClick({
                      type: "video",
                      url: danhGia.video?.url.startsWith("http")
                        ? danhGia.video.url
                        : `https://res.cloudinary.com/durppqsk4/video/upload/${danhGia.video?.url}`,
                    })
                  }
                >
                  <video
                    src={
                      danhGia.video.url.startsWith("http")
                        ? danhGia.video.url
                        : `https://res.cloudinary.com/durppqsk4/video/upload/${danhGia.video.url}`
                    }
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-800 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {danhGia.textPhanHoi && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-400">
              <div className="flex items-start gap-2">
                <CornerDownRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-blue-800">Phản hồi từ Lego MyKingDom</span>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    {danhGia.textPhanHoi}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* Modal sửa đánh giá */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
          <EditReviewForm
            tieuDe={editTieuDe}
            setTieuDe={setEditTieuDe}
            textDanhGia={editTextDanhGia}
            setTextDanhGia={setEditTextDanhGia}
            soSao={editSoSao}
            setSoSao={setEditSoSao}
            isSubmitting={isSubmitting}
            onFormSubmit={handleUpdateReview}
            onCancel={() => {
              setEditingReview(null);
              // Reset media states khi cancel
              setNewImages([]);
              setNewVideo(null);
              setHiddenImageIds([]);
              setHiddenVideoId(null);
            }}
            anhUrls={editingReview.anhUrls}
            video={editingReview.video}
            newImages={newImages}
            setNewImages={setNewImages}
            setNewVideo={setNewVideo}
            hiddenImageIds={hiddenImageIds}
            setHiddenImageIds={setHiddenImageIds}
            hiddenVideoId={hiddenVideoId}
            setHiddenVideoId={setHiddenVideoId}
          />
        </div>
      )}
      {/* Modal thông báo thành công/lỗi */}
      <QuanLyThongBao
        showSuccessModal={showSuccessModal}
        showErrorModal={showErrorModal}
        errorMessage={errorMessage}
        onCloseSuccess={() => setShowSuccessModal(false)}
        onCloseError={() => setShowErrorModal(false)}
      />
    </div>
  );
}
