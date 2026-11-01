
import Select, { type StylesConfig, type GroupBase } from "react-select";

const twFontSizeMap: Record<string, string> = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
};

const resolveFontSize = (className = "") => {
  const match = className.split(" ").find((c) => twFontSizeMap[c]);
  return match ? twFontSizeMap[match] : "0.875rem"; // default text-sm
};

export interface OptionType {
  value: any;
  label: string;
}

export interface SelectOptionProps {
  id?: string;
  name: string;
  options?: OptionType[];
  handleChange?: (selectedOption: any, actionMeta: any) => void;
  value?: any;
  height?: string;
  formik?: any;
  placement?: "top" | "bottom" | "auto";
  customOption?: boolean;
  className?: string;
  placeholderClassName?: string;
  placeholder?: string;
  isSearchable?: boolean;
}

export const SelectOption = ({
  options = [],
  handleChange,
  value,
  formik,
  height = "44px",
  placement = "bottom",
  customOption = false,
  className = "",
  placeholderClassName = "text-base",
  placeholder,
  ...props
}: SelectOptionProps) => {
  const fontSize = resolveFontSize(className);
  const placeholderFontSize = resolveFontSize(placeholderClassName) || fontSize;

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    indicatorSeparator: () => ({
      display: "none",
    }),
    control: (styles, state) => ({
      ...styles,
      backgroundColor: state.isDisabled ? "#F8FAFC" : "transparent",
      borderRadius: "8px",
      color: "#020617",
      border: `1px solid ${
        state.isFocused
          ? "#020617"
          : formik?.errors[props.name] && formik?.touched[props.name]
            ? "#EF4444"
            : "#D0D5DD"
      }`,
      boxShadow: state.isFocused ? "0 0 0 1px #020617" : "none",
      "&:hover": {
        borderColor: "#020617",
      },
      minHeight: height,
      height: height,
      cursor: "pointer",
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: "2px 8px",
    }),
    singleValue: (styles, state) => ({
      ...styles,
      color: state.isDisabled ? "#94A3B8" : "#020617",
      fontSize,
      fontWeight: "400",
      margin: 0,
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: "rgb(var(--color-background-surface))",
      padding: "8px",
      borderRadius: "8px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      border: "1px solid #E2E8F0",
      zIndex: 9999,
    }),
    menuPortal: (styles) => ({
      ...styles,
      zIndex: 9999,
    }),
    menuList: (styles) => ({
      ...styles,
      padding: 0,
      maxHeight: "300px",
      overflowY: "auto",
    }),
    option: (styles, { isFocused, isSelected, data }) => {
      const isDividerAfter = customOption && ["CFC", "CWO"].includes(data?.label);
      return {
        ...styles,
        borderBottom: isDividerAfter ? "2px solid #2a2c2f" : "none",
        borderRadius: "6px",
        padding: "10px 12px",
        margin: "2px 0",
        backgroundColor: isSelected
          ? "#115e59"
          : isFocused
            ? "#FEF3F2"
            : "transparent",
        color: isSelected ? "rgb(var(--color-text-invert-default))" : "#0F172A",
        "&:active": {
          backgroundColor: "#115e59",
          color: "rgb(var(--color-text-invert-default))",
        },
        cursor: "pointer",
        fontSize,
        fontWeight: isSelected ? "500" : "400",
        transition: "all 0.1s ease-in-out",
      };
    },
    input: (styles) => ({
      ...styles,
      margin: 0,
      padding: 0,
      color: "#101828",
      fontSize,
    }),
    placeholder: (styles) => ({
      ...styles,
      color: "#667085",
      fontSize: placeholderFontSize,
      fontWeight: "400",
      margin: 0,
    }),
    dropdownIndicator: (styles, state) => ({
      ...styles,
      color: state.isFocused ? "#020617" : "#667085",
      "&:hover": { color: "#020617" },
      transition: "all 0.2s ease-in-out",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    }),
    clearIndicator: (styles) => ({
      ...styles,
      color: "#667085",
      "&:hover": { color: "#EF4444" },
      cursor: "pointer",
    }),
  };

  const handleSelectChange = (selectedOption: any, actionMeta: any) => {
    if (handleChange) {
      handleChange(selectedOption, actionMeta);
    } else if (formik) {
      formik.setFieldValue(props.name, selectedOption?.value);
    }
  };

  const handleBlur = () => {
    if (formik && props.name) formik.setFieldTouched(props.name, true);
  };

  // Auto-resolve value from formik if value prop is not provided directly
  const resolvedValue = value !== undefined ? value : options.find(opt => opt.value === formik?.values?.[props.name]);

  return (
    <div className={className}>
      <Select
        styles={customStyles}
        isSearchable={props.isSearchable ?? true}
        options={options}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        value={resolvedValue}
        menuPlacement={placement as any}
        menuPortalTarget={placement === "top" ? document.body : undefined}
        classNamePrefix="custom-select"
        placeholder={placeholder}
        {...props}
      />
      {formik?.errors[props.name] && formik?.touched[props.name] && (
        <div className="text-red-500 text-xs pt-1 pl-1">
          {formik.errors[props.name] as string}
        </div>
      )}
    </div>
  );
};
