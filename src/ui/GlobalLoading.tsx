import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { translateMessage } from "../i18n";
export default function GlobalLoading() {
  const ref = useRef<HTMLDialogElement>(null);
  const title = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  const overlay = (
    <dialog
      ref={ref}
      className="global-loading"
      aria-modal="true"
      aria-labelledby={title}
      aria-busy="true"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="global-loading-card" role="status" aria-live="polite">
        <LoaderCircle
          className="global-loading-spinner"
          size={32}
          aria-hidden="true"
        />
        <strong id={title}>{translateMessage("loading.processing")}</strong>
        <p>{translateMessage("loading.walletHint")}</p>
      </div>
    </dialog>
  );
  return typeof document === "undefined"
    ? overlay
    : createPortal(overlay, document.body);
}
