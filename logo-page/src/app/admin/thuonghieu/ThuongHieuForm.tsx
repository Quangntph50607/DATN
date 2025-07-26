import { ThuongHieu } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";

interface ThuongHieuFormProps {
    onSubmit: (data: { ten: string; moTa?: string }) => void;
    thuongHieuToEdit: ThuongHieu | null;
    onClearEdit: () => void;
}

export function ThuongHieuForm({ onSubmit, thuongHieuToEdit, onClearEdit }: ThuongHieuFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ ten: string; moTa?: string }>();

    useEffect(() => {
        if (thuongHieuToEdit) {
            reset({
                ten: thuongHieuToEdit.ten,
                moTa: thuongHieuToEdit.moTa || "",
            });
        } else {
            reset({
                ten: "",
                moTa: "",
            });
        }
    }, [thuongHieuToEdit, reset]);

    const onSubmitForm = (data: { ten: string; moTa?: string }) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {thuongHieuToEdit ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
                </h2>
                <p className="text-gray-400">
                    {thuongHieuToEdit ? "Cập nhật thông tin thương hiệu" : "Nhập thông tin thương hiệu mới"}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="ten" className="text-white">
                        Tên thương hiệu *
                    </Label>
                    <Input
                        id="ten"
                        {...register("ten", { required: "Tên thương hiệu là bắt buộc" })}
                        placeholder="Nhập tên thương hiệu"
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
                    {thuongHieuToEdit ? "Lưu thay đổi" : "Thêm thương hiệu"}
                </Button>
            </div>
        </form>
    );
} 