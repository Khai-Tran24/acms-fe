/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/lib/context/auth-context";
import { RoleEnum } from "@/lib/enums/role.enum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OtpModal } from "@/components/custom/modal/otp-modal";
import { useState } from "react";
import { verifyOtp } from "@/lib/api/authentication/authentication.api";
import { useToast } from "@/lib/hooks/use-toast";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .trim()
    .required("Email là bắt buộc"),
  username: yup
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .trim()
    .required("Tên đăng nhập là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .trim()
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .trim()
    .required("Xác nhận mật khẩu là bắt buộc"),
  role: yup
    .string()
    .oneOf(Object.values(RoleEnum), "Vai trò không hợp lệ")
    .trim()
    .required("Vai trò là bắt buộc"),
});

interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: RoleEnum;
}

const SignUpPage = () => {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "" as RoleEnum,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    await registerUser(data, setOpen);
  };

  const onOtpVerify = async (otp: string) => {
    setIsOtpLoading(true);
    const email = getValues("email");
    try {
      const result = await verifyOtp({ email, otp: Number(otp) });

      if (result.status === "success") {
        toast.success(
          "Xác thực OTP thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.",
        );
        setTimeout(() => {
          setIsOtpLoading(false);
          setOpen(false);
          router.push("/sign-in");
        }, 1000);
      } else {
        toast.error(result.message || "Xác thực OTP thất bại");
        setIsOtpLoading(false);
      }
    } catch (err: any) {
      console.error("Error during OTP verification:", err);
      toast.error(err.message || "Đã xảy ra lỗi khi xác thực OTP");
      setIsOtpLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Đăng ký</h1>
        <p className="text-sm text-gray-500">
          Đăng ký để sử dụng hệ thống quản lý hồ sơ đấu giá.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="Nhập email"
                  disabled={isLoading}
                  {...field}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Tên đăng nhập</FieldLabel>
                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  {...field}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Mật khẩu</FieldLabel>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  {...field}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Xác nhận mật khẩu</FieldLabel>
                <Input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  disabled={isLoading}
                  {...field}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Vai trò</FieldLabel>
                <Select
                  {...field}
                  disabled={isLoading}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RoleEnum).map((role) => {
                      if (role === RoleEnum.ADMIN) return null;
                      return (
                        <SelectItem key={role} value={role}>
                          {role === RoleEnum.AUCTIONEER
                            ? "Đấu giá viên"
                            : role === RoleEnum.SECRETARY
                              ? "Thư ký"
                              : role}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.role.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Button
            className="w-full"
            variant={"default"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Đã có tài khoản?{" "}
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={() => !isLoading && router.push("/sign-in")}
        >
          Đăng nhập
        </span>
      </p>

      <OtpModal
        open={open}
        onVerify={onOtpVerify}
        isVerificationLoading={isOtpLoading}
        setOpen={setOpen}
      />
    </>
  );
};

export default SignUpPage;
