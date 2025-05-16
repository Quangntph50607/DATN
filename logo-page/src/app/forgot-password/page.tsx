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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email không được để trống")
    .email("Email không hợp lệ"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage("Email khôi phục mật khẩu đã được gửi (giả lập)");
      console.log("" + data);
    } catch (err) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại sau.");
      console.log("" + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h1>

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
            className="w-full"
          >
            Gửi email khôi phục
          </LoadingButton>
        </form>
      </Form>

      {message && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {message}
        </div>
      )}
    </div>
  );
}
