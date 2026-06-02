/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { LoginRequest } from "@/lib/types/authentication.type";

const schema = yup.object().shape({
  loginIdentify: yup
    .string()
    .trim()
    .required("Tên đăng nhập/Email là bắt buộc"),
  password: yup.string().trim().required("Mật khẩu là bắt buộc"),
});

const SignInPage = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      loginIdentify: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    await login(data);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-sm text-gray-500">
          Đăng nhập để sử dụng hệ thống quản lý hồ sơ đấu giá.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="loginIdentify"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="loginIdentify">
                  Tên đăng nhập/Email
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập hoặc email"
                  id="loginIdentify"
                  autoComplete="off"
                  disabled={isLoading}
                  {...field}
                />
                {errors.loginIdentify && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.loginIdentify.message}
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
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  id="password"
                  autoComplete="off"
                  {...field}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
                <div className="flex items-center justify-end text-sm text-muted-foreground w-full mt-1">
                  <p
                    className="hover:underline cursor-pointer"
                    onClick={() =>
                      !isLoading && router.push("/forgot-password")
                    }
                  >
                    Quên mật khẩu?
                  </p>
                </div>
              </Field>
            )}
          />

          <Button
            className="w-full"
            variant={"default"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Chưa có tài khoản?{" "}
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={() => !isLoading && router.push("/sign-up")}
        >
          Đăng ký
        </span>
      </p>
    </>
  );
};

export default SignInPage;
