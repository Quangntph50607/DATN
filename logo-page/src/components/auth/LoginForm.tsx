"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { LockKeyhole, Mail } from "lucide-react";
import { InputWithIcon } from "@/shared/InputWithIcon";
import { FormFieldWrapper } from "@/shared/FormFieldWrapper";
import { PasswordToggle } from "@/shared/PasswordToggle";
import { LoadingButton } from "@/shared/LoadingButton";
import SocialButton from "@/shared/SocialButton";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { authenService } from "@/services/authService";
import { useUserStore } from "@/context/authStore.store";

const logInSchema = z.object({
  email: z
    .string()
    .nonempty("Email không được trống")
    .email("Email không hợp lệ"),
  matKhau: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 kí tự")
    .max(15, "Mật khẩu không vượt quá 15 ký tự"),
});

type LogInFormType = z.infer<typeof logInSchema>;

export default function LoginForm() {
  const [showmatKhau, setShowmatKhau] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const form = useForm<LogInFormType>({
    resolver: zodResolver(logInSchema),
    mode: "onTouched",
    defaultValues: { email: "", matKhau: "" },
  });
  const onSubmit = async (data: LogInFormType) => {
    setIsLoading(true);
    try {
      const res = await authenService.login(data.email, data.matKhau);
      // lấy thông tin người dùng bao gồm roleId và token
      const { id, ten, email, roleId, message, token } = res;
      setUser({ id, ten, email, roleId, message, token });
      if (token) {
        localStorage.setItem("access_token", token);
      }
      // Phân quyền dựa trên roleId
      if (roleId === 1 || roleId === 2) {
        router.push("/admin");
      } else if (roleId === 3) {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      console.error("Lỗi:", error);
      if (error instanceof Error) {
        form.setError("email", { message: error.message });
        form.setError("matKhau", { message: error.message });
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        form.setError("email", {
          message: (error as { message: string }).message,
        });
        form.setError("matKhau", {
          message: (error as { message: string }).message,
        });
      } else {
        form.setError("email", { message: "Đã xảy ra lỗi không xác định" });
        form.setError("matKhau", { message: "Đã xảy ra lỗi không xác định" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (loginType: "google" | "facebook") => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/lego-store/user/auth/social-login?login-type=${loginType}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const url = await res.text();
      if (url && url.startsWith("http")) {
        window.location.href = url; // chuyển hướng tới Google/Facebook
      } else {
        throw new Error("Không nhận được URL đăng nhập hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi khi gọi social-login:", err);
      form.setError("email", {
        message: `Lỗi khi đăng nhập ${
          loginType === "google" ? "Google" : "Facebook"
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center text-black">Đăng nhập</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormFieldWrapper label="Email">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <InputWithIcon
                    id="email"
                    icon={Mail}
                    type="email"
                    placeholder="Nhập email..."
                    {...field}
                  />
                </motion.div>
              </FormFieldWrapper>
            )}
          />

          {/* matKhau Field */}
          <FormField
            control={form.control}
            name="matKhau"
            render={({ field }) => (
              <FormFieldWrapper label="Mật khẩu">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <InputWithIcon
                      id="matKhau"
                      icon={LockKeyhole}
                      type={showmatKhau ? "text" : "password"}
                      placeholder="Nhập mật khẩu..."
                      autoComplete="off"
                      {...field}
                    />
                  </motion.div>
                  <PasswordToggle
                    showPassword={showmatKhau}
                    toggleShowPassword={() => setShowmatKhau((prev) => !prev)}
                  />
                </div>
              </FormFieldWrapper>
            )}
          />

          {/* Forgot matKhau */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-gray-800 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <LoadingButton
            isLoading={isLoading}
            disabled={!form.formState.isValid}
            className="w-full bg-black  text-white font-semibol shadow-md  hover:bg-black/80"
          >
            Đăng nhập
          </LoadingButton>
        </form>
      </Form>

      {/* Social Login Divider */}
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-sm text-gray-600">Hoặc tiếp tục với</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col gap-3">
        <SocialButton
          icon={FcGoogle}
          label={isLoading ? "Đang xử lý..." : "Google"}
          variant="default"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        />

        <SocialButton
          icon={FaFacebookSquare}
          label={isLoading ? "Đang xử lý..." : "Facebook"}
          variant="facebook"
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading}
        />
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm mt-4">
        <span className="text-gray-700">Bạn chưa có tài khoản? </span>
        <Link href="/auth/register" className="text-black hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
