/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage = () => {
  const navigation = useRouter();
  const {} = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    // Handle form submission, e.g., call an API to authenticate the user
    console.log(data);
    // On successful authentication, navigate to the dashboard or home page
    navigation.push("/dashboard");
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-sm text-gray-500">
          Đăng nhập để sử dụng hệ thống quản lý hồ sơ đấu giá.
        </p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel>Email\Tên đăng nhập</FieldLabel>
          <Input type="text" placeholder="Email hoặc tên đăng nhập" />
        </Field>
        <Field>
          <FieldLabel>Mật khẩu</FieldLabel>
          <Input type="password" placeholder="Mật khẩu" />
          <div className="flex items-center justify-end text-sm text-muted-foreground w-full">
            <p
              className="hover:underline cursor-pointer"
              onClick={() => navigation.push("/forgot-password")}
            >
              Quên mật khẩu?
            </p>
          </div>
        </Field>
        <Button className="w-full" variant={"default"}>
          Đăng nhập
        </Button>
      </FieldGroup>
      <p className="text-sm text-muted-foreground text-center">
        Chưa có tài khoản?{" "}
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={() => navigation.push("/sign-up")}
        >
          Đăng ký
        </span>
      </p>
    </>
  );
};

export default SignInPage;
