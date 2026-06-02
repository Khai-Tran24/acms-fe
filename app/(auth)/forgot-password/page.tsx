/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { forgotPassword } from "@/lib/api/authentication/authentication.api";
import { useToast } from "@/lib/hooks/use-toast";

const schema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await forgotPassword(data.email);
      if (response.status === "success") {
        toast.success(
          "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.",
        );
      }

      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err: unknown) {
      console.error("Error in forgot password:", err);
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
          "Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="text-sm text-gray-500">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </Field>

          <Button
            className="w-full"
            variant={"default"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Quay lại trang đăng nhập?{" "}
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={() => !isLoading && router.push("/sign-in")}
        >
          Đăng nhập
        </span>
      </p>
    </>
  );
};

export default ForgotPasswordPage;
