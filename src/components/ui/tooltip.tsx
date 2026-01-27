import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/**
 * Тултип, открывающийся только по клику (hover не открывает).
 * Дети: TooltipTrigger и TooltipContent. Для Trigger с asChild — клик вешается на дочерний элемент.
 */
function ClickableTooltip({
  children,
  ...rootProps
}: React.ComponentProps<typeof Tooltip>) {
  const [open, setOpen] = React.useState(false);
  const openedByClickRef = React.useRef(false);

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (next && !openedByClickRef.current) {
      return;
    }
    if (!next) {
      openedByClickRef.current = false;
    }
    setOpen(next);
  }, []);

  const toggle = React.useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        openedByClickRef.current = false;
        return false;
      }
      openedByClickRef.current = true;
      return true;
    });
  }, []);

  const mapped = React.Children.map(React.Children.toArray(children), (child) => {
    if (!React.isValidElement(child) || child.type !== TooltipTrigger) return child;
    const triggerProps = child.props as {
      asChild?: boolean;
      children?: React.ReactNode;
      onClick?: React.MouseEventHandler;
    };
    const existingOnClick = triggerProps.onClick;
    const mergedOnClick = (e: React.MouseEvent) => {
      toggle();
      existingOnClick?.(e);
    };
    if (triggerProps.asChild && React.isValidElement(triggerProps.children)) {
      const inner = triggerProps.children as React.ReactElement<{ onClick?: React.MouseEventHandler; }>;
      const innerOnClick = inner.props?.onClick;
      const innerMerged = (e: React.MouseEvent) => {
        toggle();
        innerOnClick?.(e);
      };
      return React.cloneElement(child as React.ReactElement<typeof triggerProps>, {
        children: React.cloneElement(inner, { onClick: innerMerged }),
      });
    }
    return React.cloneElement(child as React.ReactElement<typeof triggerProps>, {
      onClick: mergedOnClick,
    });
  });

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange} {...rootProps}>
      {mapped}
    </Tooltip>
  );
}

export { ClickableTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

