/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const navigation = useRouter();

  const onSubmit = (data: any) => {
    // Handle form submission, e.g., call an API to register the user
    console.log(data);
    // On successful registration, navigate to the sign-in page
    navigation.push("/sign-in");
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Đăng ký</h1>
        <p className="text-sm text-gray-500">
          Đăng ký để sử dụng hệ thống quản lý hồ sơ đấu giá.
        </p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="text" placeholder="Email" />
        </Field>
        <Field>
          <FieldLabel>Tên đăng nhập</FieldLabel>
          <Input type="text" placeholder="Tên đăng nhập" />
        </Field>
        <Field>
          <FieldLabel>Mật khẩu</FieldLabel>
          <Input type="password" placeholder="Mật khẩu" />
        </Field>
        <Field>
          <FieldLabel>Xác nhận Mật khẩu</FieldLabel>
          <Input type="password" placeholder="Xác nhận Mật khẩu" />
        </Field>
        <Button className="w-full" variant={"default"}>
          Đăng ký
        </Button>
      </FieldGroup>
      <p className="text-sm text-muted-foreground text-center">
        Đã có tài khoản?{" "}
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={() => navigation.push("/sign-in")}
        >
          Đăng nhập
        </span>
      </p>
    </>
  );
};

export default SignUpPage;
