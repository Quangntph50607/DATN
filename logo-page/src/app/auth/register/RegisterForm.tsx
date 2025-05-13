"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { LockKeyhole, Mail, User } from "lucide-react";
import { InputWithIcon } from "@/shared/InputWithIcon";
import { FormFieldWrapper } from "@/shared/FormFieldWrapper";
import { PasswordToggle } from "@/shared/PasswordToggle";
import Link from "next/link";
import { LoadingButton } from "@/shared/LoadingButton";
import { motion } from "framer-motion";

const registerSchema = z
  .object({
    user_name: z
      .string()
      .nonempty("Không để trống")
      .min(3, "Tên tối thiểu 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khảu phải tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordCofirm] = useState<boolean>(false);
  const form = useForm<RegisterForm>({
    mode: "onTouched",
    defaultValues: {
      user_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerSchema),
  });
  const onSubmit = async (data: RegisterForm) => {
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
      <h1 className="text-2xl font-bold text-center">Đăng ký</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="user_name"
            render={({ field }) => (
              <FormFieldWrapper label="Tên người dùng">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <InputWithIcon
                    icon={User}
                    id="user_name"
                    type="text"
                    placeholder="User name..."
                    className=" text-white italic pl-10"
                    {...field}
                  />
                </motion.div>
              </FormFieldWrapper>
            )}
          />
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormFieldWrapper label="Mật khẩu xác nhận">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <InputWithIcon
                      id="confirmPassword"
                      icon={LockKeyhole}
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="..."
                      {...field}
                    />
                  </motion.div>

                  <PasswordToggle
                    showPassword={showPasswordConfirm}
                    toggleShowPassword={() =>
                      setShowPasswordCofirm((prev) => !prev)
                    }
                  />
                </div>
              </FormFieldWrapper>
            )}
          />

          <LoadingButton
            isLoading={isLoading}
            disabled={!form.formState.isValid}
            className="mt-4 w-full"
          >
            Đăng ký
          </LoadingButton>

          {/* Sign In Link */}
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Bạn đã có tài khoản? </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
