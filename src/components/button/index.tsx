import React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: Port HasAccess from trx-fe when RBAC is implemented
// import { HasAccess } from "utils/checkAccess";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "default" | "outline" | "submit" | "button" | "reset" | any;
  loading?: boolean;
  code?: string;
  method?: string;
}

export const Button = ({
  className,
  children,
  type = "default",
  disabled,
  loading = false,
  code,
  method,
  ...props
}: ButtonProps) => {
  // if (code && method && !HasAccess(code, method)) return null;

  const isTextLeft = className?.includes("text-left");
  
  // Re-map the 'type' prop if it conflicts with standard HTML button type
  const htmlType = type === "submit" ? "submit" : type === "reset" ? "reset" : "button";
  const styleType = type === "submit" || type === "reset" || type === "button" ? "default" : type;

  return (
    <button
      {...props}
      type={htmlType}
      disabled={disabled || loading}
      className={cn(
        "p-3 rounded-md inline-flex items-center gap-2 transition-colors",

        styleType === "default"
          ? cn(
              "bg-default-invert-default w-full text-invert-default hover:bg-primary-hovered",
              isTextLeft ? "justify-start" : "justify-center",
            )
          : "",

        styleType === "outline"
          ? "border-2 text-body w-full bg-surface justify-start hover:bg-default-soft"
          : "",

        className,

        disabled ? "cursor-not-allowed pointer-events-none" : "",

        loading ? "opacity-90 relative pointer-events-none" : "",
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
          <LoaderCircle
            size={18}
            className={cn(
              "animate-spin shrink-0",
              styleType === "default" ? "text-invert-default" : "text-body",
            )}
          />
        </div>
      )}

      {children}
    </button>
  );
};
