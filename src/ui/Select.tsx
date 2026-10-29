import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};
export function selectOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (
      !isValidElement<{
        children?: ReactNode;
        value?: string | number;
        disabled?: boolean;
      }>(child)
    )
      return;
    if (child.type === Fragment)
      options.push(...selectOptions(child.props.children));
    else if (child.type === "option")
      options.push({
        value: String(child.props.value ?? ""),
        label: child.props.children,
        disabled: !!child.props.disabled,
      });
  });
  return options;
}
export function nextOption(
  options: SelectOption[],
  current: number,
  direction: 1 | -1,
) {
  for (let step = 1; step <= options.length; step++) {
    const index =
      (current + direction * step + options.length) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}
type Props = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "defaultValue" | "onChange" | "multiple" | "size"
> & {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
};
export default function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  title,
  required,
}: Props) {
  const options = selectOptions(children);
  const [internal, setInternal] = useState(() =>
    String(defaultValue ?? options.find((o) => !o.disabled)?.value ?? ""),
  );
  const selected = String(value ?? internal);
  const selectedIndex = options.findIndex((o) => o.value === selected);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  }>();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const enabled = !disabled && options.some((o) => !o.disabled);
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);
  useEffect(() => {
    if (!open) {
      setPosition(undefined);
      return;
    }
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8,
        gap = 6,
        viewport = window.visualViewport;
      const bottom =
        (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0);
      const availableBelow = bottom - rect.bottom - margin - gap;
      const availableAbove =
        rect.top - (viewport?.offsetTop ?? 0) - margin - gap;
      const above = availableBelow < 180 && availableAbove > availableBelow;
      const height = Math.min(
        280,
        options.length * 44 + 12,
        Math.max(48, above ? availableAbove : availableBelow),
      );
      const width = Math.min(
        Math.max(rect.width, 160),
        window.innerWidth - 2 * margin,
      );
      setPosition({
        left: Math.max(
          margin,
          Math.min(rect.left, window.innerWidth - width - margin),
        ),
        top: above
          ? Math.max(margin, rect.top - height - gap)
          : rect.bottom + gap,
        width,
        maxHeight: height,
      });
    };
    const outside = (event: PointerEvent) => {
      const node = event.target as Node;
      if (!trigger.current?.contains(node) && !menu.current?.contains(node))
        setOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    };
    place();
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
    };
  }, [open, options.length]);
  useEffect(() => {
    if (open)
      menu.current
        ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, position?.width]);
  function show() {
    if (!enabled) return;
    setActive(
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : options.findIndex((o) => !o.disabled),
    );
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    setInternal(option.value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
    if (option.value !== selected) onValueChange?.(option.value);
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) show();
      else
        setActive(
          nextOption(options, active, event.key === "ArrowDown" ? 1 : -1),
        );
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!open) show();
      setActive(
        event.key === "Home"
          ? options.findIndex((o) => !o.disabled)
          : nextOption(options, 0, -1),
      );
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Tab") setOpen(false);
  }
  const host = open
    ? (trigger.current?.closest("dialog") ?? document.body)
    : null;
  return (
    <span className="web-select">
      <button
        ref={trigger}
        type="button"
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-activedescendant={
          open && active >= 0 ? `${menuId}-${active}` : undefined
        }
        aria-required={required}
        disabled={!enabled}
        title={title}
        className={`web-select-trigger ${className ?? ""}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={keyDown}
      >
        <span>{options[selectedIndex]?.label ?? options[0]?.label}</span>
        <ChevronDown size={16} />
      </button>
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      {open &&
        position &&
        host &&
        createPortal(
          <div
            ref={menu}
            id={menuId}
            role="listbox"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className="web-select-menu"
            style={position}
            onClick={(event) => event.stopPropagation()}
          >
            {options.map((option, index) => (
              <button
                key={`${option.value}:${index}`}
                id={`${menuId}-${index}`}
                data-index={index}
                type="button"
                role="option"
                aria-selected={option.value === selected}
                disabled={option.disabled}
                tabIndex={-1}
                className={`web-select-option ${index === active ? "active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => !option.disabled && setActive(index)}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {option.value === selected && <Check size={16} />}
              </button>
            ))}
          </div>,
          host,
        )}
    </span>
  );
}
