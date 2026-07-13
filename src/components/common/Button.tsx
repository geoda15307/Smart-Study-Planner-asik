import type { ButtonHTMLAttributes, ReactNode } from "react";

const styles = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "bg-red-50 text-red-700 hover:bg-red-100"
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: keyof typeof styles }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
