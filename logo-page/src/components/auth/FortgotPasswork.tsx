// app/forgot-password/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputWithIcon } from "@/shared/InputWithIcon";
import { FormFieldWrapper } from "@/shared/FormFieldWrapper";
import { Form, FormField } from "@/components/ui/form";
import { Mail } from "lucide-react";
import { LoadingButton } from "@/shared/LoadingButton";
import { motion } from "framer-motion";
import { useState } from "react";
import { authenService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email không được để trống")
    .email("Email không hợp lệ"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await authenService.forgotPassword(data.email);
      setMessage(res.message || "OTP đã được gửi qua email");
      setStep(2);
    } catch {
      setMessage("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        Quên mật khẩu
      </h1>

      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormFieldWrapper label="Email">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <InputWithIcon
                        id="email"
                        icon={Mail}
                        placeholder="Nhập email của bạn"
                        type="email"
                        {...field}
                      />
                    </motion.div>
                  </div>
                </FormFieldWrapper>
              )}
            />

            <LoadingButton
              isLoading={isLoading}
              disabled={!form.formState.isValid}
              className="w-full bg-black  text-white font-semibol shadow-md  hover:bg-black/80"
            >
              Gửi email khôi phục
            </LoadingButton>
          </form>
        </Form>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <label className="text-black font-bold text-xl">Nhập mã OTP gửi về email</label>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            className="bg-white text-black border border-black/60"
          />
          <Button
            disabled={isLoading}
            onClick={async () => {
              const email = form.getValues("email");
              if (!email || !otp) return;
              setIsLoading(true);
              try {
                await authenService.verifyOtp(email, otp);
                setStep(3);
                toast({ message: "OTP hợp lệ, hãy nhập mật khẩu mới", type: "success" });
              } catch {
                toast({ message: "OTP không hợp lệ", type: "error" });
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full bg-black text-white font-semibol shadow-md hover:bg-black/80"
          >
            Xác nhận OTP
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <label className="text-black font-bold text-xl">Mật khẩu mới</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="bg-white text-black border border-black/60 pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center text-black/70 hover:text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button
            disabled={isLoading}
            onClick={async () => {
              const email = form.getValues("email");
              if (!email || !newPassword) return;
              setIsLoading(true);
              try {
                await authenService.resetPassword(email, newPassword);
                toast({ message: "Đổi mật khẩu thành công", type: "success" });
                setMessage("Bạn có thể đăng nhập với mật khẩu mới.");
                setTimeout(() => router.push("/auth/login"), 800);
              } catch {
                toast({ message: "Đổi mật khẩu thất bại", type: "error" });
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full bg-black text-white font-semibol shadow-md hover:bg-black/80"
          >
            Đặt lại mật khẩu
          </Button>
        </div>
      )}

      {message && (
        <div className="mt-4 text-center text-sm text-black">
          {message}
        </div>
      )}
    </div>
  );
}
