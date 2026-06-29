import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateContractDiscountPrice } from "@/lib/api/contract/contract.api";
import { useToast } from "@/lib/hooks/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PriceInput } from "../input/price-input";

const udpateContractDiscountPriceFormSchema = yup.object({
  amount: yup.number().nullable(),
  times: yup.number().nullable(),
});

export const UpdateContractDiscountPriceForm = ({
  id,
  setOpen,
  onSuccess,
}: {
  id: string;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(udpateContractDiscountPriceFormSchema),
    defaultValues: {
      amount: 0,
      times: 0,
    },
  });
  const toast = useToast();

  const updateDiscountPrice = async (data: {
    amount?: number | null;
    times?: number | null;
  }) => {
    try {
      const response = await updateContractDiscountPrice(id, {
        amount: data.amount ?? 0,
        times: data.times ?? 0,
      });

      if (response.success === true) {
        toast.success("Giá giảm giá hợp đồng đã được cập nhật.");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật giá giảm giá hợp đồng.");
      }
    } catch (error) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Có lỗi xảy ra khi cập nhật giá giảm giá hợp đồng.",
      );
      throw error;
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(updateDiscountPrice)}>
        <FieldGroup className="mb-4">
          <Field>
            <FieldLabel>Số lần giảm giá</FieldLabel>
            <Controller
              name="times"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  min={0}
                  placeholder="Nhập số lần giảm giá"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            />
            {errors.times && (
              <p className="text-red-500 text-sm mt-1">
                {errors.times.message}
              </p>
            )}
          </Field>

          <PriceInput
            control={control}
            name="amount"
            label="Số tiền giảm giá"
            error={errors.amount?.message}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" size={"sm"}>
            Thêm giảm giá
          </Button>
        </div>
      </form>
    </div>
  );
};
