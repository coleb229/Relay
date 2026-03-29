"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-0.5 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:shadow-sm active:shadow-primary/20 dark:shadow-primary/15 dark:hover:shadow-primary/25",
        outline:
          "border-border bg-background shadow-sm hover:bg-primary/5 hover:border-primary/30 hover:text-foreground active:shadow-none aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-primary/10 dark:hover:border-primary/40",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70 hover:shadow-md active:shadow-none aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted/70 aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 dark:active:bg-muted/30",
        destructive:
          "bg-destructive/15 text-destructive shadow-sm shadow-destructive/10 hover:bg-destructive/25 hover:shadow-md hover:shadow-destructive/15 active:shadow-none focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 dark:shadow-destructive/10",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/60",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 shadow-sm hover:shadow-md",
        "icon-xs":
          "size-6 shadow-none hover:shadow-sm rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 shadow-sm hover:shadow-md rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9 shadow-sm hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={nativeButton ?? (render ? false : undefined)}
      render={render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
