import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  children: React.ReactNode | ((props: { contentRef: React.RefObject<HTMLDivElement | null> }) => React.ReactNode);
  open: boolean;
  onClose?: () => void;
  width?: string | number;
  title?: string;
  isUseX?: boolean;
  /** "center" (default) is the classic dialog. "right" renders a full-height
   *  drawer sliding in from the right edge — for forms that feel more like a
   *  side panel than a popup (e.g. Add Lane, Add Blackout Date). */
  position?: "center" | "right";
}

const noop = () => {};

export const Modal = ({
  children,
  open,
  onClose = noop,
  width,
  title,
  isUseX = true,
  position = "center",
}: ModalProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isDrawer = position === "right";

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          ref={contentRef}
          style={{ width: width || (isDrawer ? "480px" : "500px"), maxWidth: isDrawer ? "95vw" : "95vw" }}
          className={cn(
            "bg-surface focus:outline-none",
            isDrawer
              ? cn(
                  "fixed inset-y-0 right-0 z-[100000] h-full flex flex-col shadow-2xl",
                  "transition-transform duration-300 ease-in-out",
                  "data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
                  "p-6 overflow-y-auto"
                )
              : "fixed left-[50%] top-[50%] z-[100000] translate-x-[-50%] translate-y-[-50%] rounded-xl shadow-lg p-6"
          )}
        >
          {title ? (
            <Dialog.Title className="text-xl font-semibold text-[#101828] mb-6">
              {title}
            </Dialog.Title>
          ) : (
            <Dialog.Title className="sr-only">Modal</Dialog.Title>
          )}

          <Dialog.Description className="sr-only">
            {title ? `${title} dialog` : "Dialog content"}
          </Dialog.Description>

          {isUseX && (
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                className="absolute top-[24px] right-[24px] cursor-pointer z-50 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          )}

          <div className={cn("relative", isDrawer && "flex-1 flex flex-col min-h-0")}>
            {typeof children === "function" ? children({ contentRef }) : children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
