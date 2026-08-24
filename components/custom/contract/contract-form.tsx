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
import { ContractData, ContractPayload } from "@/lib/types/contract.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import {
  CONTRACT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  getContractDefaults,
} from "./contract-utils";
import { TextInput } from "@/components/custom/input/text-input";
import { PriceInput } from "@/components/custom/input/price-input";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { Separator } from "@/components/ui/separator";
import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from "@/lib/enums/contract.enum";
import { useEffect, useState } from "react";
import { getContractFilterOptions } from "@/lib/api/contract/contract.api";
import { RoleEnum } from "@/lib/enums/role.enum";

const contractSchema: yup.ObjectSchema<ContractPayload> = yup.object({
  contractNumber: yup.string().trim().required("Số hợp đồng là bắt buộc"),
  contractDate: yup.string().nullable().optional(),
  propertyName: yup.string().trim().required("Tên tài sản là bắt buộc"),
  propertyType: yup
    .mixed<PropertyType>()
    .oneOf(Object.values(PropertyType) as PropertyType[])
    .required("Loại tài sản là bắt buộc"),
  propertyOwner: yup
    .object({
      name: yup.string().trim().required("Tên chủ sở hữu là bắt buộc"),
      phone: yup
        .string()
        .trim()
        .required("Số điện thoại chủ sở hữu là bắt buộc"),
    })
    .required(),
  caseOfficer: yup.string().trim().required("Cán bộ phụ trách là bắt buộc"),
  startingPrice: yup
    .number()
    .typeError("Giá khởi điểm phải là một số")
    .required("Giá khởi điểm là bắt buộc"),
  winningPrice: yup
    .number()
    .typeError("Giá trúng thầu phải là một số")
    .nullable()
    .optional(),
  endRegisterDate: yup.string().required("Ngày kết thúc đăng ký là bắt buộc"),
  auctionDate: yup.string().required("Ngày đấu giá là bắt buộc"),
  status: yup
    .mixed<ContractStatus>()
    .oneOf(Object.values(ContractStatus) as ContractStatus[])
    .required("Trạng thái là bắt buộc"),
  winner: yup
    .object({
      name: yup.string().trim().optional(),
      phone: yup.string().trim().optional(),
    })
    .optional(),
  paymentStatus: yup
    .mixed<PaymentStatus>()
    .oneOf(Object.values(PaymentStatus) as PaymentStatus[])
    .required("Trạng thái thanh toán là bắt buộc"),
});

interface ContractFormProps {
  type: "create" | "update";
  contract?: ContractData;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: ContractPayload) => Promise<void>;
}

export const ContractForm = ({
  type,
  contract,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ContractFormProps) => {
  const contractDefaultsInput: ContractPayload | undefined = contract
    ? ({
        ...contract,
        caseOfficer:
          typeof contract.caseOfficer === "string"
            ? contract.caseOfficer
            : (contract.caseOfficer?.id ?? ""),
      } as ContractPayload)
    : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractPayload>({
    resolver: yupResolver(contractSchema),
    defaultValues: getContractDefaults(contractDefaultsInput),
  });

  const [userOptions, setUserOptions] = useState<
    { id: string; username: string; role: RoleEnum }[]
  >([]);

  const handleContractFilterOptions = async () => {
    const response = await getContractFilterOptions();
    if (response.success) {
      setUserOptions(response.data.caseOfficers);
    } else {
      console.error(
        "Failed to fetch contract filter options:",
        response.message,
      );
    }
  };

  useEffect(() => {
    const fetchCaseOfficers = async () => {
      await handleContractFilterOptions();
    };

    fetchCaseOfficers();
  }, [contract, control]);

  const submitForm = async (values: ContractPayload) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6 py-2">
      <FieldSet className="space-y-2">
        <section>
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Thông tin chung</h2>
            <p className="text-sm text-muted-foreground">
              Mã hợp đồng, ngày ký và thông tin tài sản.
            </p>
          </div>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              control={control}
              name="contractNumber"
              label="Số hợp đồng"
              placeholder="Nhập số hợp đồng"
              error={errors.contractNumber?.message}
            />
            <Controller
              name="contractDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Ngày ký hợp đồng</FieldLabel>
                  <CalendarInput
                    date={(field.value as string) ?? ""}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày ký hợp đồng"
                  />
                  {errors.contractDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.contractDate.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <TextInput
              control={control}
              name="propertyName"
              label="Tên tài sản"
              placeholder="Nhập tên tài sản"
              error={errors.propertyName?.message}
            />
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Loại tài sản</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn loại tài sản" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PropertyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROPERTY_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyType?.message && (
                    <p className="text-sm text-red-500">
                      {errors.propertyType.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <PriceInput
              control={control}
              name="startingPrice"
              label="Giá khởi điểm"
              error={errors.startingPrice?.message}
            />
            <Controller
              control={control}
              name="caseOfficer"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cán bộ phụ trách</FieldLabel>
                  <Select
                    value={field.value?.toString() ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cán bộ phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOptions.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.caseOfficer?.message && (
                    <p className="text-sm text-red-500">
                      {errors.caseOfficer.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Thông tin chủ sở hữu</h2>
            <p className="text-sm text-muted-foreground">
              Thông tin liên hệ của chủ sở hữu.
            </p>
          </div>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              control={control}
              name="propertyOwner.name"
              label="Tên chủ sở hữu"
              placeholder="Nhập tên chủ sở hữu"
              error={errors.propertyOwner?.name?.message}
            />
            <TextInput
              control={control}
              name="propertyOwner.phone"
              label="Số điện thoại chủ sở hữu"
              placeholder="Nhập số điện thoại"
              error={errors.propertyOwner?.phone?.message}
            />
          </div>
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Lịch trình</h2>
            <p className="text-sm text-muted-foreground">
              Chọn thời điểm kết thúc đăng ký và ngày đấu giá.
            </p>
          </div>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="endRegisterDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Ngày kết thúc đăng ký</FieldLabel>
                  <CalendarInput
                    enableTime={true}
                    date={field.value as string}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày kết thúc"
                  />
                  {errors.endRegisterDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.endRegisterDate.message}
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
                    enableTime={true}
                    date={field.value as string}
                    onDateChange={field.onChange}
                    placeholder="Chọn ngày đấu giá"
                  />
                  {errors.auctionDate?.message && (
                    <p className="text-sm text-red-500">
                      {errors.auctionDate.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Trạng thái</h2>
            <p className="text-sm text-muted-foreground">
              Chọn trạng thái xử lý và trạng thái thanh toán.
            </p>
          </div>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Trạng thái hợp đồng</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ContractStatus).map((status) => (
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
            <Controller
              name="paymentStatus"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Trạng thái thanh toán</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentStatus).map((paymentStatus) => (
                        <SelectItem key={paymentStatus} value={paymentStatus}>
                          {PAYMENT_STATUS_LABELS[paymentStatus]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentStatus?.message && (
                    <p className="text-sm text-red-500">
                      {errors.paymentStatus.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>
        </section>
        {type === "update" && (
          <section>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Người trúng thầu</h2>
              <p className="text-sm text-muted-foreground">
                Thông tin người thắng thầu của hợp đồng.
              </p>
            </div>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput
                control={control}
                name="winner.name"
                label="Tên người trúng thầu"
                placeholder="Nhập tên người trúng thầu"
                error={errors.winner?.name?.message}
              />
              <TextInput
                control={control}
                name="winner.phone"
                label="Số điện thoại người trúng thầu"
                placeholder="Nhập số điện thoại"
                error={errors.winner?.phone?.message}
              />
              <PriceInput
                control={control}
                name="winningPrice"
                label="Giá trúng thầu"
                error={errors.winningPrice?.message}
              />
            </div>
          </section>
        )}
      </FieldSet>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};
