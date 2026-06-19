import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
        secondary: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        outline: "border border-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
