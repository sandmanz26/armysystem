import React, { memo, useRef, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  children: React.ReactNode;
  Icon?: string | React.ReactNode;
  positionType?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  rotate?: boolean;
  className?: string;
  isDisabled?: boolean;
  visible?: boolean;
  /** Extra classes for the trigger button (default 40px round). Optional — e.g. a 28px
   *  Figma `Button Icon` (Size 2xs) in a table Actions cell. */
  buttonClassName?: string;
}

const Dropdown = ({
  children,
  Icon,
  positionType = "bottom-right",
  rotate = false,
  className,
  isDisabled = false,
  visible = true,
  buttonClassName,
}: DropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  useLayoutEffect(() => {
    if (isExpanded && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current?.offsetWidth || 0;
      const dropdownHeight = dropdownRef.current?.offsetHeight || 0;

      let newCoords = { top: 0, left: 0 };

      switch (positionType) {
        case "top-right":
          newCoords.top = buttonRect.top + window.scrollY - dropdownHeight - 5;
          newCoords.left = buttonRect.right - dropdownWidth;
          break;
        case "top-left":
          newCoords.top = buttonRect.top + window.scrollY - dropdownHeight - 5;
          newCoords.left = buttonRect.left;
          break;
        case "bottom-left":
          newCoords.top = buttonRect.bottom + window.scrollY;
          newCoords.left = buttonRect.left;
          break;
        case "bottom-right":
        default:
          newCoords.top = buttonRect.bottom + window.scrollY;
          newCoords.left = buttonRect.right - dropdownWidth;
          break;
      }

      setPosition(newCoords);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, positionType]);

  return (
    <div className="flex">
      {visible && (
        <button
          ref={buttonRef}
          className={cn(
            "w-[40px] h-[40px] flex items-center justify-center relative hover:bg-default-default rounded-full transition-colors",
            buttonClassName,
          )}
          onClick={toggleDropdown}
          disabled={isDisabled}
        >
          {Icon && typeof Icon === "string" ? (
            <img
              src={Icon}
              alt="menu"
              className={`transition-transform duration-300 ease-in-out ${
                rotate && isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          ) : Icon ? (
            <div className={`transition-transform duration-300 ease-in-out ${rotate && isExpanded ? "rotate-180" : "rotate-0"}`}>
              {Icon}
            </div>
          ) : (
            <MoreHorizontal size={20} className="text-body" />
          )}
        </button>
      )}
      {isExpanded &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-[1113] bg-surface rounded-lg shadow-lg border border-invert-default w-[200px] overflow-hidden",
              className
            )}
            style={{ top: position.top, left: position.left }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
};

export default memo(Dropdown);
