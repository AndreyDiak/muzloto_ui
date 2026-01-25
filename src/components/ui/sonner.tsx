import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#16161d] group-[.toaster]:text-white group-[.toaster]:border-[#00f0ff]/30",
          error: "group-[.toaster]:bg-red-500/10 group-[.toaster]:text-red-200 group-[.toaster]:border-red-500/30",
          success: "group-[.toaster]:bg-green-500/10 group-[.toaster]:text-green-200 group-[.toaster]:border-green-500/30",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:text-blue-200 group-[.toaster]:border-blue-500/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

