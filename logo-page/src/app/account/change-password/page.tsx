"use client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Shield, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/context/authStore.store";
import { accountService } from "@/services/accountService";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const changePasswordSchema = z.object({
    newPassword: z
        .string()
        .nonempty("Mật khẩu mới không được để trống")
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z
        .string()
        .nonempty("Xác nhận mật khẩu không được để trống"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<ChangePasswordForm | null>(null);

    // Lấy thông tin user từ store
    const { user } = useUserStore();

    const form = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Password strength calculator
    const passwordStrength = useMemo(() => {
        const password = form.watch("newPassword");
        if (!password) return { level: 0, text: "", color: "", bgColor: "" };

        let level = 0;
        if (password.length >= 6) level++;
        if (password.length >= 8) level++;
        if (/[A-Z]/.test(password)) level++;
        if (/[0-9]/.test(password)) level++;
        if (/[^A-Za-z0-9]/.test(password)) level++;

        const strength = {
            1: { text: "Rất yếu", color: "text-red-600", bgColor: "bg-red-500" },
            2: { text: "Yếu", color: "text-orange-600", bgColor: "bg-orange-500" },
            3: { text: "Trung bình", color: "text-yellow-600", bgColor: "bg-yellow-500" },
            4: { text: "Mạnh", color: "text-blue-600", bgColor: "bg-blue-500" },
            5: { text: "Rất mạnh", color: "text-green-600", bgColor: "bg-green-500" },
        };

        return { level, ...strength[level as keyof typeof strength] || strength[1] };
    }, [form.watch("newPassword")]);

    const handleChangePassword = async (data: ChangePasswordForm) => {
        // Bỏ event?.preventDefault() ở đây vì nó block navigation

        // Hiển thị dialog xác nhận
        setPendingFormData(data);
        setShowConfirmDialog(true);
    };

    const handleConfirmChange = async () => {
        if (!pendingFormData || !user?.id) {
            toast.error("Không tìm thấy thông tin người dùng");
            return;
        }

        setIsLoading(true);
        setShowConfirmDialog(false);

        try {
            // Gọi API đổi mật khẩu
            await accountService.changePassword(user.id, pendingFormData.newPassword);

            toast.success("🎉 Đổi mật khẩu thành công!", {
                description: "Mật khẩu của bạn đã được cập nhật.",
                duration: 4000,
            });

            // Reset form và pending data
            form.reset();
            setPendingFormData(null);

        } catch (err: any) {
            console.error("Change password error:", err);
            toast.error("❌ Đổi mật khẩu thất bại", {
                description: err.message || "Vui lòng thử lại sau.",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelChange = () => {
        setShowConfirmDialog(false);
        setPendingFormData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <Shield className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Đổi Mật Khẩu
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Cập nhật mật khẩu để bảo mật tài khoản
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-6">
                            {/* Email Display */}
                            <div>
                                <label className="text-gray-800 font-medium block mb-2">
                                    Email tài khoản
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        value={user?.email || ""}
                                        disabled
                                        className="pl-10 bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Mật khẩu sẽ được thay đổi cho email này
                                </p>
                            </div>

                            {/* New Password */}
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 font-medium">
                                            Mật khẩu mới
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <Input
                                                    {...field}
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Nhập mật khẩu mới"
                                                    autoComplete="new-password"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    spellCheck="false"
                                                    className="pl-10 pr-12 bg-white border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>

                                        {/* Password Strength Indicator */}
                                        {form.watch("newPassword") && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-gray-600">Độ mạnh mật khẩu</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Mức độ:</span>
                                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                                        {passwordStrength.text}
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                                                        style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 font-medium">
                                            Xác nhận mật khẩu mới
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <Input
                                                    {...field}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    autoComplete="new-password"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    spellCheck="false"
                                                    className="pl-10 pr-12 bg-white border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg"
                                >
                                    {isLoading ? "🔄 Đang xử lý..." : "🔐 Đổi mật khẩu"}
                                </Button>

                                {/* Button điều hướng - KHÔNG submit form */}
                                <Button
                                    type="button"  // Quan trọng: type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.preventDefault(); // Ngăn submit
                                        e.stopPropagation(); // Ngăn bubble
                                        window.location.href = "/account/info"; // Hoặc router.push
                                    }}
                                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    📝 Thông tin tài khoản
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Security Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-gray-50 backdrop-blur-sm rounded-lg border border-gray-200 p-4"
                >
                    <h3 className="text-gray-800 font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Mẹo bảo mật
                    </h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Sử dụng mật khẩu duy nhất cho mỗi tài khoản</li>
                        <li>• Không chia sẻ mật khẩu với ai khác</li>
                        <li>• Thay đổi mật khẩu định kỳ</li>
                        <li>• Sử dụng trình quản lý mật khẩu</li>
                    </ul>
                </motion.div>
            </motion.div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-white border border-gray-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-black flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Xác nhận đổi mật khẩu
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-gray-600">
                                <p className="mb-3">
                                    Bạn có chắc chắn muốn thay đổi mật khẩu cho tài khoản này?
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <div><strong>Email:</strong> {user?.email}</div>
                                    <div><strong>Mật khẩu mới:</strong> ••••••••</div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancelChange}
                            className="bg-white border-gray-300 text-black hover:bg-gray-50"
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmChange}
                            disabled={isLoading}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang cập nhật...
                                </div>
                            ) : (
                                "Xác nhận đổi"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
