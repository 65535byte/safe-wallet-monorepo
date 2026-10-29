import { translateMessage } from "../../i18n";
import Modal from "../../ui/Modal";
import { useState } from "react";
import {
  ArrowDownUp,
  ChevronRight,
  Plus,
  Search,
  Wallet,
  Trash2,
} from "lucide-react";
import { chains, short } from "../../core";
import type { Address } from "viem";
export type SavedSafe = {
  address: Address;
  chainId: number;
  name: string;
};
type Props = {
  account?: Address;
  safes: SavedSafe[];
  busy: boolean;
  onConnect: () => void;
  onAdd: () => void;
  onCreate: () => void;
  onImport: () => void;
  onOpen: (safe: SavedSafe) => void;
  onRemove: (safe: SavedSafe) => void;
};
export default function AccountsPage(p: Props) {
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<SavedSafe>();
  const [descending, setDescending] = useState(false);
  const showStarted = !p.account && !p.safes.length;
  const matches = p.safes
    .filter((s) =>
      `${s.name} ${s.address}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (descending ? -1 : 1) * a.name.localeCompare(b.name));
  return (
    <section
      className={"accounts-page " + (showStarted ? "signed-out" : "")}
      data-testid="accounts-page"
    >
      {showStarted ? (
        <>
          <div className="accounts-navigation">
            <span>{translateMessage("ui.6c2eb6ceec")}</span>
          </div>
          <div className="get-started-card" data-testid="get-started-card">
            <img
              className="get-started-logo"
              src="/images/brand-logo.png"
              alt="8379"
            />
            <h1>{translateMessage("ui.715ee9dc84")}</h1>
            <p className="terms">
              {translateMessage("ui.7a7cdbd597")}{" "}
              <a href="/terms-service">
                {translateMessage("ui.c3bc331fbf")}
              </a>{" "}
              {translateMessage("ui.3d7114281f")}{" "}
              <a href="/privacy-policy">
                {translateMessage("ui.0ba75a0ce8")}
              </a>
            </p>
            <button
              className="primary connect-primary"
              disabled={p.busy}
              onClick={p.onConnect}
            >
              <Wallet size={18} />
              {translateMessage("ui.26ee90b0ba")}
            </button>
            <div className="or-divider">
              <span />
              {translateMessage("ui.a2123d6950")}
              <span />
            </div>
            <button className="watch-account" onClick={p.onAdd}>
              {translateMessage("ui.b519ad9e0e")}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="accounts-heading">
            <h1>{translateMessage("ui.061246bd31")}</h1>
            <div className="row">
              <button className="secondary" onClick={p.onAdd}>
                <Plus size={20} />
                {translateMessage("ui.7a8a11ead5")}
              </button>
              <button className="primary" onClick={p.onCreate}>
                {translateMessage("ui.20fbeb2444")}
              </button>
            </div>
          </div>
          <section className="accounts-panel">
            <div className="accounts-filters">
              <label className="account-search">
                <Search size={18} />
                <input
                  aria-label={translateMessage("ui.aa76fba551")}
                  placeholder={translateMessage("ui.cb4ff1fd57")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button
                className="sort-accounts"
                onClick={() => setDescending(!descending)}
              >
                <ArrowDownUp size={16} />
                {translateMessage("ui.a3bcd4aa33")}
                {descending
                  ? translateMessage("ui.4022782076")
                  : translateMessage("ui.d44e9b3d3b")}
              </button>
            </div>
            {matches.length ? (
              <div className="accounts-list">
                {matches.map((s) => (
                  <div
                    key={`${s.chainId}:${s.address}`}
                    className="account-list-item"
                  >
                    <button
                      className="account-list-row"
                      onClick={() => p.onOpen(s)}
                    >
                      <span className="identicon large" />
                      <div>
                        <strong>{s.name}</strong>
                        <small>{short(s.address)}</small>
                      </div>
                      <span className="chain-label">
                        {chains.find((c) => c.id === s.chainId)?.name ??
                          s.chainId}
                      </span>
                      <ChevronRight size={18} />
                    </button>
                    <button
                      className="icon remove-account"
                      aria-label={translateMessage("ui.300e3d42ea", {
                        p0: s.name,
                      })}
                      title={translateMessage("ui.53b4aa4982")}
                      disabled={p.busy}
                      onClick={() => setRemoving(s)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="accounts-empty">
                {query
                  ? translateMessage("ui.f477240189")
                  : translateMessage("ui.e217cada4a")}
              </div>
            )}
          </section>
        </>
      )}
      {removing && (
        <Modal
          title={translateMessage("ui.b487f606a4")}
          close={() => setRemoving(undefined)}
        >
          <p>
            {translateMessage("account.removePrompt", { name: removing.name })}
          </p>
          <div className="remove-account-summary">
            <span>
              {chains.find((c) => c.id === removing.chainId)?.name ||
                removing.chainId}
            </span>
            <code className="break">{removing.address}</code>
          </div>
          <p className="muted">{translateMessage("ui.b0ff0f7056")}</p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setRemoving(undefined)}
            >
              {translateMessage("ui.2cd0f3be87")}
            </button>
            <button
              className="primary danger-action"
              disabled={p.busy}
              onClick={() => {
                p.onRemove(removing);
                setRemoving(undefined);
              }}
            >
              {translateMessage("ui.b487f606a4")}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
