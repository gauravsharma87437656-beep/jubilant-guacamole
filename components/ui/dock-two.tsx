import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DockProps {
  className?: string
  items: {
    icon: LucideIcon
    label: string
    onClick?: () => void
    badge?: number
    isActive?: boolean
  }[]
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  className?: string
  badge?: number
  isActive?: boolean
}

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ icon: Icon, label, onClick, className, badge, isActive }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full gap-1",
          "hover:bg-secondary/20 transition-colors",
          className
        )}
      >
        <div className="relative">
          <Icon className={cn(
            "w-6 h-6 transition-all duration-200",
            isActive ? "text-foreground stroke-[2.5px] fill-foreground/10" : "text-muted-foreground"
          )} />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        <span className={cn(
          "text-[10px] font-medium transition-colors",
          isActive ? "text-foreground font-semibold" : "text-muted-foreground"
        )}>
          {label}
        </span>
      </motion.button>
    )
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe rounded-t-xl sm:rounded-none mobile-dock-container",
          "md:hidden", // Hide on desktop by default
          className
        )}
      >
        <div className="flex items-center justify-between px-2 h-16 w-full max-w-md mx-auto">
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock }