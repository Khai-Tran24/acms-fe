import { ResetPasswordForm } from "./_components/reset-password-form";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ email: string; token: string }>;
}) => {
  const { email, token } = await searchParams;
  return (
    <ResetPasswordForm email={email} token={token} />
  );
};

export default ResetPasswordPage;
