import { translateMessage } from "../i18n";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, CircleCheck, X } from "lucide-react";
type Notice = {
  text: string;
  error?: boolean;
  action?: {
    label: string;
    run: () => unknown;
  };
};
type Toast = Notice & {
  id: number;
  expires: number;
};
let items: Toast[] = [];
let sequence = 0;
const listeners = new Set<() => void>();
const publish = () => listeners.forEach((listener) => listener());
function dismiss(id: number) {
  items = items.filter((item) => item.id !== id);
  publish();
}
export function notify(notice: Notice) {
  if (
    !notice.text ||
    items.some(
      (item) => item.text === notice.text && !!item.error === !!notice.error,
    )
  )
    return;
  items = [
    ...items,
    {
      ...notice,
      id: ++sequence,
      expires: Date.now() + (notice.error ? 8000 : 5000),
    },
  ].slice(-3);
  publish();
}
export function ToastNotice({
  message,
  error = true,
  action,
  eventKey,
}: {
  message?: string;
  error?: boolean;
  action?: Notice["action"];
  eventKey?: unknown;
}) {
  useEffect(() => {
    if (message) notify({ text: message, error, action });
  }, [message, error, eventKey]);
  return null;
}
export default function ToastHost() {
  const toasts = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => items,
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !node.showPopover) return;
    if (node.matches(":popover-open")) node.hidePopover();
    if (toasts.length) node.showPopover();
  }, [toasts]);
  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(
      () => {
        items = items.filter((item) => item.expires > Date.now());
        publish();
      },
      Math.max(
        0,
        Math.min(...toasts.map((item) => item.expires)) - Date.now(),
      ) + 10,
    );
    return () => window.clearTimeout(timer);
  }, [toasts]);
  return createPortal(
    <div
      ref={ref}
      popover="manual"
      className="toast-host"
      aria-label={translateMessage("ui.b87b880332")}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-message ${toast.error ? "toast-error" : "toast-success"}`}
          role={toast.error ? "alert" : "status"}
        >
          {toast.error ? <CircleAlert size={20} /> : <CircleCheck size={20} />}
          <span>{toast.text}</span>
          {toast.action && (
            <button
              className="toast-action"
              onClick={() => {
                dismiss(toast.id);
                void Promise.resolve()
                  .then(toast.action!.run)
                  .catch((error) =>
                    notify({
                      text:
                        error instanceof Error
                          ? error.message
                          : translateMessage("ui.0c3b4cf7aa"),
                      error: true,
                    }),
                  );
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button
            className="icon"
            aria-label={translateMessage("ui.d301bc1258")}
            onClick={() => dismiss(toast.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
