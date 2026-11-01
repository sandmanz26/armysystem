import { useState } from "react";
import {
  useFloating, autoUpdate, offset, flip, shift,
  useHover, useFocus, useDismiss, useRole, useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

export function CoursewareCell({ text }) {
  const isLong = text.length > 20;
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <div
        ref={refs.setReference}
        className="max-w-[170px] truncate text-sm text-gray-600 cursor-default"
        {...getReferenceProps()}
      >
        {text}
      </div>
      {isLong && open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 99999 }}
            className="pointer-events-none bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-[260px] whitespace-normal shadow-lg leading-snug"
            {...getFloatingProps()}
          >
            {text}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
