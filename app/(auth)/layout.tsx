import React from "react";
import Image from "next/image";
import AuthImage from "@/public/images/banner-ttdg.jpg";

const authLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="grid md:grid-cols-2 gap-5 h-screen w-full">
      <div>
        <Image
          src={AuthImage}
          alt="auth banner"
          className="h-screen w-full object-cover hidden md:block"
          loading="eager"
        />
      </div>
      <div className="flex flex-col gap-4 items-center justify-center h-screen w-full">
        <div className="w-[70%] space-y-8">{children}</div>
      </div>
    </section>
  );
};

export default authLayout;
