"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const navigation = useRouter();
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="text-sm text-gray-500">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="text" placeholder="Email" />
        </Field>
        <Button className="w-full" variant={"default"}>
          Gửi liên kết đặt lại mật khẩu
        </Button>
      </FieldGroup>
      <p className="text-sm text-muted-foreground text-center">
        Quay lại trang đăng nhập?{" "}
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

export default ForgotPasswordPage;
