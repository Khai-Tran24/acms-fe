"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { resetPassword } from "@/lib/api/authentication/authentication.api";
import { useToast } from "@/lib/hooks/use-toast";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

export const ResetPasswordForm = ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const router = useRouter();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await resetPassword(
        email,
        parseInt(token),
        data.password,
      );

      if (response.status === "success") {
        toast.success("Mật khẩu của bạn đã được đặt lại thành công.");
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } else {
        toast.error(
          response.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      console.error("Reset password error:", err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-500">Nhập mật khẩu mới của bạn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel>Mật khẩu mới</FieldLabel>
            <Input
              type="password"
              placeholder="Nhập mật khẩu mới"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Xác nhận mật khẩu</FieldLabel>
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </Field>

          <Button
            className="w-full"
            variant={"default"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
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
