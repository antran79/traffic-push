import * as React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<React.ElementRef<typeof RadixSwitch.Root>, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <RadixSwitch.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-muted",
        checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600",
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </RadixSwitch.Root>
  )
);
Switch.displayName = "Switch";

export { Switch };
