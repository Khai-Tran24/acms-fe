"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "@/lib/api/authentication/profile.api";
import { useToast } from "@/lib/hooks/use-toast";
import { UserData } from "@/lib/types/user.type";
import { KeyRound, Save, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  DAU_GIA_VIEN: "Đấu giá viên",
  THU_KY: "Thư ký",
  CHUYEN_VIEN: "Chuyên viên",
  NHAN_VIEN_LUU_TRU: "Nhân viên lưu trữ",
};

const messageOf = (error: unknown) => {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  ).response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message;
};

export default function AccountPage() {
  const toast = useToast();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    avatar: "",
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        setProfile(data);
        setForm({
          username: data.username,
          fullName: data.fullName,
          phone: data.phone ?? "",
          avatar: data.avatar ?? "",
        });
      } catch (error) {
        toast.error(messageOf(error) ?? "Không thể tải thông tin tài khoản.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("profile-updated", { detail: updated }),
      );
      toast.success("Đã cập nhật thông tin tài khoản.");
    } catch (error) {
      toast.error(messageOf(error) ?? "Không thể cập nhật tài khoản.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setChangingPassword(true);
    try {
      await changeMyPassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      localStorage.removeItem("refreshToken");
      toast.success(
        "Đổi mật khẩu thành công. Vui lòng đăng nhập lại khi phiên hiện tại kết thúc.",
      );
    } catch (error) {
      toast.error(messageOf(error) ?? "Không thể đổi mật khẩu.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-80" />
      </div>
    );

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý hồ sơ cá nhân và bảo mật tài khoản.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              <AvatarImage src={form.avatar} />
              <AvatarFallback className="text-xl">
                {form.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {profile?.fullName || profile?.username}
              </h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="mt-1 text-xs font-medium text-blue-700">
                {ROLE_LABELS[String(profile?.role)] ?? profile?.role}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound />
                Thông tin hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={saveProfile}>
                <Field label="Email">
                  <Input value={profile?.email ?? ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email không thể thay đổi.
                  </p>
                </Field>
                <Field label="Tên đăng nhập">
                  <Input
                    required
                    maxLength={100}
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </Field>
                <Field label="Họ và tên">
                  <Input
                    required
                    maxLength={255}
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Số điện thoại">
                  <Input
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </Field>
                <Field label="Ảnh đại diện (URL)">
                  <Input
                    type="url"
                    maxLength={2048}
                    value={form.avatar}
                    onChange={(e) =>
                      setForm({ ...form, avatar: e.target.value })
                    }
                  />
                </Field>
                <Button disabled={saving}>
                  <Save />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound />
                Đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={savePassword}>
                <Field label="Mật khẩu hiện tại">
                  <Input
                    required
                    minLength={8}
                    type="password"
                    value={password.currentPassword}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Mật khẩu mới">
                  <Input
                    required
                    minLength={8}
                    type="password"
                    value={password.newPassword}
                    onChange={(e) =>
                      setPassword({ ...password, newPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Ít nhất 8 ký tự.
                  </p>
                </Field>
                <Field label="Xác nhận mật khẩu mới">
                  <Input
                    required
                    minLength={8}
                    type="password"
                    value={password.confirmPassword}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Field>
                <Button disabled={changingPassword}>
                  <KeyRound />
                  {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);
