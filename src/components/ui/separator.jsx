import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    role={decorative ? undefined : "separator"}
    aria-orientation={orientation}
    className={cn(
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    ref={ref}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
