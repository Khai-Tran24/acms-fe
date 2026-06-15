"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllUsers } from "@/lib/api/user/user.api";
import { ContractStatusEnum } from "@/lib/enums/contract.enum";
import { RoleEnum } from "@/lib/enums/role.enum";
import { ContractData, ContractPayload } from "@/lib/types/contract.type";
import { UserData } from "@/lib/types/user.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CONTRACT_STATUS_LABELS, getContractDefaults } from "./contract-utils";
import { TextInput } from "@/components/custom/input/text-input";
import { PriceInput } from "@/components/custom/input/price-input";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { Separator } from "@/components/ui/separator";

interface ContractFormValues {
  regulationNumber: string;
  title: string;
  description: string;
  startingPrice: number;
  applicationFee: number;
  deposit: number;
  registerStartDate: string;
  registerExpiredDate: string;
  auctionDate: string;
  auctionTime: number;
  status: ContractStatusEnum;
  fileUrl: string;
  auctioneer: string;
  secretary: string;
}

const contractSchema: yup.ObjectSchema<ContractFormValues> = yup.object({
  regulationNumber: yup.string().trim().required("Số quy chế là bắt buộc"),
  title: yup.string().trim().required("Tên hợp đồng là bắt buộc"),
  description: yup.string().trim().defined(),
  startingPrice: yup
    .number()
    .typeError("Giá khởi điểm không hợp lệ")
    .moreThan(yup.ref("deposit"), "Giá khởi điểm phải lớn hơn tiền đặt cọc")

    .required("Giá khởi điểm là bắt buộc"),
  applicationFee: yup
    .number()
    .typeError("Phí hồ sơ không hợp lệ")
    .min(0, "Phí hồ sơ không được âm")

    .required("Phí hồ sơ là bắt buộc"),
  deposit: yup
    .number()
    .typeError("Tiền đặt cọc không hợp lệ")
    .min(0, "Tiền đặt cọc không được âm")

    .required("Tiền đặt cọc là bắt buộc"),
  registerStartDate: yup.string().required("Ngày bắt đầu đăng ký là bắt buộc"),
  registerExpiredDate: yup
    .string()
    .required("Ngày hết hạn đăng ký là bắt buộc")
    .test(
      "after-register-start",
      "Ngày hết hạn phải sau ngày bắt đầu",
      function (value) {
        return !value || value > this.parent.registerStartDate;
      },
    ),
  auctionDate: yup
    .string()
    .required("Ngày đấu giá là bắt buộc")
    .test(
      "after-register-expired",
      "Ngày đấu giá phải sau ngày hết hạn đăng ký",
      function (value) {
        return !value || value > this.parent.registerExpiredDate;
      },
    ),
  auctionTime: yup
    .number()
    .typeError("Thời lượng đấu giá không hợp lệ")
    .min(0, "Thời lượng đấu giá không được âm")

    .required("Thời lượng đấu giá là bắt buộc"),
  status: yup
    .mixed<ContractStatusEnum>()
    .oneOf(Object.values(ContractStatusEnum))
    .required("Trạng thái là bắt buộc"),
  fileUrl: yup.string().trim().defined(),
  auctioneer: yup.string().required("Đấu giá viên là bắt buộc"),
  secretary: yup.string().required("Thư ký là bắt buộc"),
});

interface ContractFormProps {
  contract?: ContractData;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: ContractPayload) => Promise<void>;
}

export const ContractForm = ({
  contract,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ContractFormProps) => {
  const [auctioneers, setAuctioneers] = useState<UserData[]>([]);
  const [secretaries, setSecretaries] = useState<UserData[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: yupResolver(contractSchema),
    defaultValues: getContractDefaults(contract),
  });

  useEffect(() => {
    const fetchAssignableUsers = async () => {
      try {
        const [auctioneerResponse, secretaryResponse] = await Promise.all([
          getAllUsers({ filterByRole: RoleEnum.AUCTIONEER, limit: 100 }),
          getAllUsers({ filterByRole: RoleEnum.SECRETARY, limit: 100 }),
        ]);
        setAuctioneers(auctioneerResponse.data);
        setSecretaries(secretaryResponse.data);
      } catch (error) {
        console.error("Error fetching assignable users:", error);
      }
    };

    fetchAssignableUsers();
  }, []);

  const submitForm = async (values: ContractFormValues) => {
    await onSubmit({
      regulationNumber: values.regulationNumber.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      startingPrice: Number(values.startingPrice),
      applicationFee: Number(values.applicationFee),
      deposit: Number(values.deposit),
      registerStartDate: values.registerStartDate,
      registerExpiredDate: values.registerExpiredDate,
      auctionDate: values.auctionDate,
      auctionTime: Number(values.auctionTime),
      status: values.status,
      fileUrl: values.fileUrl?.trim() || "",
      auctioneer: values.auctioneer,
      secretary: values.secretary,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-5 py-2">
      <FieldSet className="space-y-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Thông tin hợp đồng</h2>
          <Separator className="mb-2" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              control={control}
              name="regulationNumber"
              label="Số quy chế"
              error={errors.regulationNumber?.message}
            />
            <TextInput
              control={control}
              name="title"
              label="Tên hợp đồng"
              error={errors.title?.message}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Trạng thái</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ContractStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {CONTRACT_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status?.message && (
                    <p className="text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Chi tiết đấu giá</h2>
          <Separator className="mb-2" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PriceInput
              control={control}
              name="applicationFee"
              label="Phí hồ sơ"
              error={errors.applicationFee?.message}
            />
            <PriceInput
              control={control}
              name="deposit"
              label="Tiền đặt cọc"
              error={errors.deposit?.message}
            />
            <PriceInput
              control={control}
              name="startingPrice"
              label="Giá khởi điểm"
              error={errors.startingPrice?.message}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Lịch trình</h2>
          <Separator className="mb-2" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="registerStartDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Ngày bắt đầu đăng ký</FieldLabel>
                  <CalendarInput
                    date={field.value}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày bắt đầu"
                    enableTime={true}
                  />
                  {errors.registerStartDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.registerStartDate.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Controller
              name="registerExpiredDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Ngày hết hạn đăng ký</FieldLabel>
                  <CalendarInput
                    date={field.value}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày hết hạn"
                    enableTime={true}
                  />
                  {errors.registerExpiredDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.registerExpiredDate.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Controller
              name="auctionDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Ngày đấu giá</FieldLabel>
                  <CalendarInput
                    date={field.value}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày đấu giá"
                    enableTime={true}
                  />
                  {errors.auctionDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.auctionDate.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <TextInput
              control={control}
              name="auctionTime"
              label="Thời lượng đấu giá"
              type="number"
              error={errors.auctionTime?.message}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Nhân sự</h2>
          <Separator className="mb-2" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="auctioneer"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Đấu giá viên</FieldLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn đấu giá viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {auctioneers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.auctioneer?.message && (
                    <p className="text-sm text-red-500">
                      {errors.auctioneer.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Controller
              name="secretary"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Thư ký</FieldLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn thư ký" />
                    </SelectTrigger>
                    <SelectContent>
                      {secretaries.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.secretary?.message && (
                    <p className="text-sm text-red-500">
                      {errors.secretary.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Tài liệu</h2>
          <Separator className="mb-2" />
          <div>
            <TextInput
              control={control}
              name="fileUrl"
              label="Link tài liệu"
              className="md:col-span-2"
              error={errors.fileUrl?.message}
              disabled={true}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Mô tả</FieldLabel>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Nhập mô tả hợp đồng"
                    disabled={true}
                  />
                  {errors.description?.message && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      </FieldSet>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};
