"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import XuatXuSearch from "./XuatXuSearch";
import XuatXuTable from "./XuatXuTable";
import { useState } from "react";
import { XuatXu } from "@/components/types/product.type";
import {
    useXuatXu,
    useAddXuatXu,
    useEditXuatXu,
    useXoaXuatXu,
} from "@/hooks/useXuatXu";
import { XuatXuForm } from "./XuatXuForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

export default function XuatXuPage() {
    const { data: xuatXus = [], isLoading } = useXuatXu();
    const [xuatXuToEdit, setXuatXuToEdit] = useState<XuatXu | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const addMutation = useAddXuatXu();
    const editMutation = useEditXuatXu();
    const deleteMutation = useXoaXuatXu();

    const handleSubmit = (data: { ten: string; moTa?: string }) => {
        if (xuatXuToEdit) {
            editMutation.mutate(
                { id: xuatXuToEdit.id, data },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật thành công!");
                        setXuatXuToEdit(null);
                        setShowForm(false);
                    },
                    onError: () => toast.error("Cập nhật thất bại!"),
                }
            );
        } else {
            addMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Thêm thành công!");
                    setShowForm(false);
                },
                onError: () => toast.error("Thêm thất bại!"),
            });
        }
    };

    const handleEdit = (xuatXu: XuatXu) => {
        setXuatXuToEdit(xuatXu);
        setShowForm(true);
    };

    const handleDelete = (id: number, ten: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa "${ten}"?`)) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Xóa thành công!"),
                onError: () => toast.error("Xóa thất bại!"),
            });
        }
    };

    const handleClearEdit = () => {
        setXuatXuToEdit(null);
        setShowForm(false);
    };

    const handleOpenForm = () => {
        setXuatXuToEdit(null);
        setShowForm(true);
    };

    const filteredXuatXus = xuatXus.filter(
        (xx) =>
            xx.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (xx.moTa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    // Phân trang
    const itemPerPage = 10;
    const totalPages = Math.ceil(filteredXuatXus.length / itemPerPage);
    const paginatedData = filteredXuatXus.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    return (
        <ToastProvider>
            <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-white">
                        Quản Lý Xuất Xứ
                    </h1>
                </motion.div>

                {/* Nút thêm xuất xứ */}
                <div className="items-center flex gap-4">
                    <XuatXuSearch
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="shadow-lg" onClick={handleOpenForm}>
                            <PlusIcon />
                            Thêm xuất xứ
                        </Button>
                    </motion.div>
                </div>

                {isLoading ? (
                    <p className="text-white">Đang tải xuất xứ...</p>
                ) : (
                    <>
                        <h2 className="text-lg font-bold">Danh sách xuất xứ</h2>
                        <XuatXuTable
                            xuatXus={paginatedData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </>
                )}

                {/* Form popup */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
                        onClick={handleClearEdit}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-[#191a32] rounded-lg p-8 w-full max-w-3xl relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClearEdit}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold transition-colors"
                                title="Đóng"
                            >
                                &times;
                            </motion.button>
                            <XuatXuForm
                                onSubmit={handleSubmit}
                                xuatXuToEdit={xuatXuToEdit}
                                onClearEdit={handleClearEdit}
                            />
                        </motion.div>
                    </motion.div>
                )}

                <div className="flex flex-wrap gap-2 justify-center items-center">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Trang trước
                    </Button>
                    <span className="text-sm font-medium">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Trang sau
                    </Button>
                </div>
            </Card>
        </ToastProvider>
    );
} 