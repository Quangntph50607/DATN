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

const logInSchema = z.object({
  email: z
    .string()
    .nonempty("Email không được trống")
    .email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 kí tự"),
});

type LogInFormType = z.infer<typeof logInSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<LogInFormType>({
    resolver: zodResolver(logInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LogInFormType) => {
    setIsLoading(true);
    try {
      console.log("Đăng kí với:" + data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Đăng kí thất bại", error);
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

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormFieldWrapper label="Mật khẩu">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <InputWithIcon
                      id="password"
                      icon={LockKeyhole}
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu..."
                      {...field}
                    />
                  </motion.div>
                  <PasswordToggle
                    showPassword={showPassword}
                    toggleShowPassword={() => setShowPassword((prev) => !prev)}
                  />
                </div>
              </FormFieldWrapper>
            )}
          />

          {/* Forgot Password */}
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
            Đăng ký
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
