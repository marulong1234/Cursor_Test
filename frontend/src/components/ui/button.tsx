import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
        variant === "ghost" && "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        size === "default" && "h-10 px-4 py-2 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-8 w-8",
        className,
      )}
      {...props}
    />
  );
}
