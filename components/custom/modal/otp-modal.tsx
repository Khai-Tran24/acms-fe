import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface OtpModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onVerify: (otp: string) => void;
  isVerificationLoading: boolean;
}

export const OtpModal = ({
  open,
  onVerify,
  isVerificationLoading,
  setOpen,
}: OtpModalProps) => {
  const [otp, setOtp] = useState("");
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Nhập OTP</DialogTitle>
          <DialogDescription>
            Vui lòng nhập OTP được gửi đến email của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full flex items-center space-x-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="XXXXXX"
              className="w-full h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </DialogClose>
          <Button
            onClick={() => onVerify(otp)}
            disabled={isVerificationLoading}
          >
            {isVerificationLoading ? "Đang xác thực..." : "Xác thực"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
