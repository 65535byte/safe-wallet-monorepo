import { translateMessage } from "../../i18n";
import {
  ArrowLeftRight,
  ListOrdered,
  Info,
  Check,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import Modal from "../../ui/Modal";
import type { NoncePolicy } from "./proposal-nonce";
export default function NonceConflictDialog({
  nonce,
  queueNonce,
  canReplace,
  onChoose,
}: {
  nonce: number;
  queueNonce: number;
  canReplace: boolean;
  onChoose: (policy: Exclude<NoncePolicy, "direct"> | null) => void;
}) {
  const [selected, setSelected] = useState<"replace" | "queue">(
    canReplace ? "replace" : "queue",
  );
  return (
    <Modal
      className="nonce-dialog"
      title={translateMessage("ui.1480362c91")}
      close={() => onChoose(null)}
    >
      <div className="nonce-conflict-heading">
        <span className="nonce-status-dot" />
        <span>{translateMessage("ui.2a3709ab51")}</span>
        <code>Nonce {nonce}</code>
      </div>
      <p className="nonce-conflict-intro">
        {translateMessage("ui.3c75ec8b40")}
      </p>
      <fieldset className="nonce-conflict-options">
        <legend className="sr-only">{translateMessage("ui.b87449022f")}</legend>
        <label
          className={`nonce-choice ${selected === "replace" ? "selected" : ""} ${!canReplace ? "unavailable" : ""}`}
        >
          <input
            type="radio"
            name="nonce-conflict"
            value="replace"
            checked={selected === "replace"}
            disabled={!canReplace}
            onChange={() => setSelected("replace")}
          />
          <span className="nonce-choice-icon">
            <ArrowLeftRight size={21} />
          </span>
          <span className="nonce-choice-content">
            <strong>
              {translateMessage("ui.0f071d2f2e")}
              <code>#{nonce}</code>
            </strong>
            <small>
              {canReplace
                ? translateMessage("ui.4bd8a4d9ce")
                : translateMessage("ui.b812a8c486")}
            </small>
          </span>
          <span className="nonce-selection" aria-hidden="true">
            {selected === "replace" ? (
              <Check size={13} strokeWidth={3} />
            ) : !canReplace ? (
              <LockKeyhole size={12} />
            ) : null}
          </span>
        </label>
        <label
          className={`nonce-choice ${selected === "queue" ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="nonce-conflict"
            value="queue"
            checked={selected === "queue"}
            onChange={() => setSelected("queue")}
          />
          <span className="nonce-choice-icon">
            <ListOrdered size={21} />
          </span>
          <span className="nonce-choice-content">
            <strong>
              {translateMessage("ui.579ef87271")}
              <code>#{queueNonce}</code>
            </strong>
            <small>{translateMessage("ui.094dc37558")}</small>
          </span>
          <span className="nonce-selection" aria-hidden="true">
            {selected === "queue" && <Check size={13} strokeWidth={3} />}
          </span>
        </label>
      </fieldset>
      <div className="nonce-conflict-note">
        <Info size={16} />
        <p>{translateMessage("ui.73f24ca534")}</p>
      </div>
      <div className="modal-actions">
        <button className="secondary" onClick={() => onChoose(null)}>
          {translateMessage("ui.2cd0f3be87")}
        </button>
        <button className="primary" onClick={() => onChoose(selected)}>
          {selected === "replace"
            ? translateMessage("ui.ebd102db2d")
            : translateMessage("ui.41919f1486")}
        </button>
      </div>
    </Modal>
  );
}
