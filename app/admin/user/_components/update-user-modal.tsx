import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserDetails, updateUser } from "@/lib/api/user/user.api";
import { RoleEnum } from "@/lib/enums/role.enum";
import { useToast } from "@/lib/hooks/use-toast";
import { UserData, UserDetails } from "@/lib/types/user.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const updateUserSchema = yup.object().shape({
  username: yup
    .string()
    .min(2)
    .max(100)
    .trim()
    .required("Tên người dùng là bắt buộc"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .trim()
    .required("Email là bắt buộc"),
  role: yup
    .string()
    .oneOf(Object.values(RoleEnum))
    .required("Vai trò là bắt buộc"),
});

export const UpdateUserModal = ({
  user,
  setOpen,
}: {
  user: UserData;
  setOpen: (open: boolean) => void;
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getUserDetails(user.id);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const resposne = await updateUser(user.id, {
        username: data.username,
        email: data.email,
        role: data?.role,
      });

      if (resposne.status === "success") {
        toast.success("Người dùng đã được cập nhật thành công.");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật người dùng.");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Có lỗi xảy ra khi cập nhật người dùng.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <FieldSet className="space-y-2">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-sm font-medium text-gray-700">
                Email
              </FieldLabel>
              <Input
                {...field}
                type="email"
                placeholder="Nhập email"
                className="mt-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={true}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
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
              <FieldLabel className="text-sm font-medium text-gray-700">
                Tên người dùng
              </FieldLabel>
              <Input
                {...field}
                placeholder="Nhập tên người dùng"
                className="mt-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
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
                onValueChange={(value) => field.onChange(value)}
                defaultValue={field.value}
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
      </FieldSet>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => {
            setOpen(false);
          }}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};
