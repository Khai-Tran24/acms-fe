import { toast } from "sonner";

export const useToast = () => {
  return {
    success: (message: string) =>
      toast.success(message, {
        position: "top-right",
        duration: 3000,
        style: { backgroundColor: "#4CAF50", color: "#fff" },
      }),
    error: (message: string) =>
      toast.error(message, {
        position: "top-right",
        duration: 3000,
        style: { backgroundColor: "#f44336", color: "#fff" },
      }),
    info: (message: string) =>
      toast.info(message, {
        position: "top-right",
        duration: 3000,
        style: { backgroundColor: "#2196F3", color: "#fff" },
      }),
    warning: (message: string) =>
      toast.warning(message, {
        position: "top-right",
        duration: 3000,
        style: { backgroundColor: "#f44336", color: "#fff" },
      }),
  };
};
