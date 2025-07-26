import { XuatXu } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";

interface XuatXuFormProps {
    onSubmit: (data: { ten: string; moTa?: string }) => void;
    xuatXuToEdit: XuatXu | null;
    onClearEdit: () => void;
}

export function XuatXuForm({ onSubmit, xuatXuToEdit, onClearEdit }: XuatXuFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ ten: string; moTa?: string }>();

    useEffect(() => {
        if (xuatXuToEdit) {
            reset({
                ten: xuatXuToEdit.ten,
                moTa: xuatXuToEdit.moTa || "",
            });
        } else {
            reset({
                ten: "",
                moTa: "",
            });
        }
    }, [xuatXuToEdit, reset]);

    const onSubmitForm = (data: { ten: string; moTa?: string }) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {xuatXuToEdit ? "Cập nhật xuất xứ" : "Thêm xuất xứ mới"}
                </h2>
                <p className="text-gray-400">
                    {xuatXuToEdit ? "Cập nhật thông tin xuất xứ" : "Nhập thông tin xuất xứ mới"}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="ten" className="text-white">
                        Tên xuất xứ *
                    </Label>
                    <Input
                        id="ten"
                        {...register("ten", { required: "Tên xuất xứ là bắt buộc" })}
                        placeholder="Nhập tên xuất xứ"
                        className="mt-1"
                    />
                    {errors.ten && (
                        <p className="text-red-500 text-sm mt-1">{errors.ten.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="moTa" className="text-white">
                        Mô tả
                    </Label>
                    <Textarea
                        id="moTa"
                        {...register("moTa")}
                        placeholder="Nhập mô tả (tùy chọn)"
                        className="mt-1"
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClearEdit}>
                    Hủy
                </Button>

                <Button type="submit" variant="default" className="shadow-lg">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    {xuatXuToEdit ? "Lưu thay đổi" : "Thêm xuất xứ"}
                </Button>
            </div>
        </form>
    );
} 