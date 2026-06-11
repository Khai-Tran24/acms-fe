import { ResetPasswordForm } from "./_components/reset-password-form";

const ResetPasswordPage = ({
  searchParams,
}: {
  searchParams: { email: string; token: string };
}) => {
  return (
    <ResetPasswordForm email={searchParams.email} token={searchParams.token} />
  );
};

export default ResetPasswordPage;
