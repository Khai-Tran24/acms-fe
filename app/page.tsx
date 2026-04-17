"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/public/images/logo-ttdg.jpg";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <main className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">
            Chào mừng đến với hệ thống quản lý hồ sơ đấu giá
          </h1>
          <p className="text-lg text-gray-600">
            Vui lòng đăng nhập để tiếp tục
          </p>
          <Button
            onClick={() => router.push("/sign-in")}
            className="rounded px-4 py-2"
          >
            Đăng nhập
          </Button>
        </div>
      </main>
    </>
  );
}
