import { ReactNode } from "react";
import Image from "next/image";
import AuthImage from "@/public/images/banner-ttdg.jpg";
import Logo from "@/assets/logo.png";
import { Files, Gavel, Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="grid min-h-svh bg-background lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-[#214e56] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src={AuthImage} alt="Trung tâm Dịch vụ Đấu giá Tài sản" fill sizes="50vw" className="object-cover opacity-15" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#163f47] via-[#214e56]/70 to-[#214e56]/30" />
        <div className="relative flex items-center gap-3">
          <span className="rounded-2xl bg-white p-2"><Image src={Logo} alt="" className="size-11 object-contain" /></span>
          <div className="text-sm leading-relaxed"><p className="font-semibold">Trung tâm Dịch vụ Đấu giá Tài sản</p><p className="text-white/70">Thành phố Hồ Chí Minh</p></div>
        </div>
        <div className="relative my-16 max-w-md">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#bedcd9]">Không gian làm việc tập trung</p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Quản lý hồ sơ.<br /><span className="text-[#b9d8d2]">Kết nối công việc.</span></h2>
          <p className="mt-6 text-sm leading-7 text-white/75">Theo dõi hợp đồng, quản lý quy chế và cập nhật kết quả đấu giá trong cùng một hệ thống.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[{ icon: Files, label: "Hợp đồng" }, { icon: Layers, label: "Quy chế" }, { icon: Gavel, label: "Kết quả đấu giá" }].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/85"><Icon className="size-3.5" />{label}</span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/60">Hệ thống quản lý hồ sơ đấu giá</p>
      </aside>
      <div className="flex min-w-0 flex-col items-center justify-center px-5 py-10 sm:px-10 lg:py-12">
        <div className="mb-7 flex items-center gap-3 lg:hidden">
          <Image src={Logo} alt="Trung tâm Dịch vụ Đấu giá Tài sản" className="size-11 object-contain" />
          <span className="text-sm font-semibold text-primary">Hệ thống quản lý hồ sơ đấu giá</span>
        </div>
        <div className="w-full max-w-md space-y-7 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </section>
  );
}
