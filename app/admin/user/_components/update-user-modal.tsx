import { Field, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserDetails } from "@/lib/api/user/user.api";
import { UserData, UserDetails } from "@/lib/types/user.type";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const updateUserSchema = yup.object().shape({
  username: yup.string().min(2).max(100),
  email: yup.string().email(),
});

export const UpdateUserModal = ({ user }: { user: UserData }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetails(user.id);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  const onSubmit = () => {};

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Field>
                <Label>Username</Label>
                <Input
                  {...field}
                  placeholder="Username"
                  className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Field>
                <Label>Email</Label>
                <Input
                  {...field}
                  placeholder="Email"
                  className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </Field>
            )}
          />
        </FieldSet>
      </form>
    </div>
  );
};
