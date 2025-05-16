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

const logInSchema = z.object({
  email: z
    .string()
    .nonempty("Email không được trống")
    .email("Email không hợp lệ"),
  matKhau: z.string().min(6, "Mật khẩu tối thiểu 6 kí tự"),
});

type LogInFormType = z.infer<typeof logInSchema>;

//mockLogin
const mockUser = [
  { email: "abc123@gmail.com", matKhau: "123456" },
  { email: "admin@gmail.com", matKhau: "123456" },
];
export default function LoginForm() {
  const [showmatKhau, setShowmatKhau] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<LogInFormType>({
    resolver: zodResolver(logInSchema),
    defaultValues: { email: "", matKhau: "" },
  });

  const onSubmit = async (data: LogInFormType) => {
    setIsLoading(true);
    try {
      const user = mockUser.find(
        (u) => u.email === data.email && u.matKhau === data.matKhau
      );
      if (!user) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }
      console.log("Đăng nhập thành công:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/dashboard");

      console.log(router);
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      // Hiển thị thông báo lỗi cho người dùng
      form.setError("email", { message: "Email hoặc mật khẩu không đúng" });
      form.setError("matKhau", { message: "Email hoặc mật khẩu không đúng" });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>

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
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <LoadingButton
            isLoading={isLoading}
            disabled={!form.formState.isValid}
            className="mt-4 w-full"
          >
            Đăng nhập
          </LoadingButton>
        </form>
      </Form>

      {/* Social Login Divider */}
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-sm text-muted-foreground">
          Hoặc tiếp tục với
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col gap-3">
        <SocialButton icon={FcGoogle} label="Google" variant="google" />
        <SocialButton
          icon={FaFacebookSquare}
          label="Facebook"
          variant="facebook"
        />
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Bạn chưa có tài khoản? </span>
        <Link href="/auth/register" className="text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
