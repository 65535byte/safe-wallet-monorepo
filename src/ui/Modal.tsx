import { translateMessage } from "../i18n";
import { X } from "lucide-react";
import { useRef, useEffect, type ReactNode } from "react";
export default function Modal({
  title,
  children,
  close,
  className = "",
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  notice?: {
    text: string;
    error: boolean;
  };
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = before;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`overlay ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section role="document" className="modal">
        <div className="modal-title">
          <h2>{title}</h2>
          <button
            className="icon"
            onClick={close}
            aria-label={translateMessage("ui.3fd47edce4")}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </dialog>
  );
}
