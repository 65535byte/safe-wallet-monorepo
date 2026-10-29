import Select from "./Select";
import {
  translateMessage,
  getLanguage,
  setLanguage,
  languageNames,
  type Language,
} from "../i18n";
import { useQuery } from "@tanstack/react-query";
import { creationNetworks } from "../features/accounts/creation-networks";
import { fetchSafeRegistry } from "../features/transactions/safe-config";
import { ToastNotice, notify } from "./Toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  Copy,
  Settings2,
  Wallet,
  Waves,
  Check,
  LogOut,
} from "lucide-react";
import { short, type Settings } from "../core";
import type { Address } from "viem";
type Props = {
  account?: Address;
  busy: boolean;
  languageDisabled?: boolean;
  settings: Settings;
  safe?: Address;
  safeName?: string;
  onConnect: () => void;
  onMenu?: () => void;
  onDisconnect: () => void;
  onChain: (id: number) => void;
  onCopy: (text: string) => void;
  onSelectSafe: () => void;
  notifications: string[];
};
export default function Topbar(p: Props) {
  const [open, setOpen] = useState("");
  const language = getLanguage();
  function changeLanguage(next: Language) {
    if (
      p.busy ||
      p.languageDisabled ||
      document.querySelector("dialog[open]") ||
      next === language
    ) {
      setOpen("");
      return;
    }
    if (!setLanguage(next)) {
      notify({ text: translateMessage("language.saveError"), error: true });
      return;
    }
    window.location.reload();
  }
  const registryQuery = useQuery({
    queryKey: ["creation-safe-registry"],
    queryFn: ({ signal }) => fetchSafeRegistry(signal, false),
    staleTime: 60000,
    retry: 1,
    enabled: !!p.safe || open === "network",
  });
  const networks = registryQuery.data
    ? creationNetworks(registryQuery.data)
    : [];
  const selectedNetwork = networks.some(
    (c) => c.supported && c.id === p.settings.chainId,
  );
  const networkDisabled =
    p.busy || registryQuery.isPending || registryQuery.isError;
  const networkOptions = (
    <>
      <option value="" disabled>
        {registryQuery.isPending
          ? translateMessage("ui.07c4757d7f")
          : translateMessage("ui.f0f2df4675")}
      </option>
      {networks.map((c) => (
        <option key={c.id} value={c.id} disabled={!c.supported}>
          {c.name}（{c.id}）
        </option>
      ))}
    </>
  );
  return (
    <header className="safe-topbar">
      <ToastNotice
        message={
          (p.safe || open === "network") && registryQuery.isError
            ? translateMessage("ui.a7ea962c5c")
            : undefined
        }
        eventKey={registryQuery.error}
        action={{
          label: translateMessage("ui.b8784c8dd5"),
          run: () => registryQuery.refetch(),
        }}
      />

      <div className="topbar-context">
        {p.safe ? (
          <>
            <button
              className="mobile-menu-trigger icon"
              aria-label={translateMessage("ui.7efb13ead5")}
              onClick={p.onMenu}
            >
              <Menu size={22} />
            </button>
            <Link className="home-pill" to="/accounts">
              <img src="/images/brand-logo.png" alt="8379" />
              {translateMessage("ui.203c08e0d4")}
            </Link>
            <span className="context-divider" />
            <button className="safe-context" onClick={p.onSelectSafe}>
              <span className="identicon" />
              <span>
                <strong>{p.safeName}</strong>
                <small>{short(p.safe)}</small>
              </span>
              <ChevronDown size={16} />
            </button>
          </>
        ) : (
          <Link className="topbar-logo" to="/accounts">
            <img src="/images/brand-logo.png" alt="8379" />
          </Link>
        )}
      </div>
      <div className="header-island">
        <div className="popover-anchor">
          <button
            className="header-icon"
            aria-label={translateMessage("ui.c6c6c1a78b")}
            onClick={() => setOpen(open === "network" ? "" : "network")}
          >
            <img
              className="walletconnect-icon"
              src="/images/walletconnect.svg"
              alt=""
            />
          </button>
          {open === "network" && (
            <section className="header-popover">
              <h3>{translateMessage("ui.c6c6c1a78b")}</h3>
              <label>
                {translateMessage("ui.d58fcdd635")}
                <Select
                  value={selectedNetwork ? p.settings.chainId : ""}
                  disabled={networkDisabled}
                  onValueChange={(value) => {
                    p.onChain(Number(value));
                    setOpen("");
                  }}
                >
                  {networkOptions}
                </Select>
              </label>
              <Link
                className="text-btn"
                to="/settings"
                onClick={() => setOpen("")}
              >
                <Settings2 size={16} />
                {translateMessage("ui.8d07216266")}
              </Link>
            </section>
          )}
        </div>
        <div className="popover-anchor">
          <button
            className="header-wallet"
            disabled={p.busy}
            onClick={() =>
              p.account
                ? setOpen(open === "wallet" ? "" : "wallet")
                : p.onConnect()
            }
          >
            {p.account ? (
              <span className="identicon account-identicon" />
            ) : (
              <Wallet size={19} strokeWidth={1.5} />
            )}
            <span>
              {p.account ? short(p.account) : translateMessage("ui.26ee90b0ba")}
            </span>
          </button>
          {open === "wallet" && p.account && (
            <section className="header-popover">
              <h3>{translateMessage("ui.fdeb67bf53")}</h3>
              <code className="break">{p.account}</code>
              <button
                className="secondary full"
                onClick={() => p.onCopy(p.account!)}
              >
                <Copy size={15} />
                {translateMessage("ui.4c6de01bbe")}
              </button>
              <button
                className="text-btn"
                onClick={() => {
                  p.onDisconnect();
                  setOpen("");
                }}
              >
                <LogOut size={16} />
                {translateMessage("ui.a33f380476")}
              </button>
            </section>
          )}
        </div>
        <div className="popover-anchor">
          <button
            className="language-button"
            disabled={p.busy || p.languageDisabled}
            aria-label={translateMessage("language.label")}
            title={
              p.busy || p.languageDisabled
                ? translateMessage("language.busy")
                : undefined
            }
            onClick={() => setOpen(open === "language" ? "" : "language")}
          >
            {languageNames[language]}
            <ChevronDown size={17} />
          </button>
          {open === "language" && (
            <section
              className="header-popover language-menu"
              role="menu"
              aria-label={translateMessage("language.label")}
            >
              {(["zh-CN", "en"] as const).map((code) => (
                <button
                  key={code}
                  role="menuitemradio"
                  aria-checked={language === code}
                  onClick={() => changeLanguage(code)}
                >
                  <span className="language-check">
                    {language === code && <Check size={16} />}
                  </span>
                  {languageNames[code]}
                </button>
              ))}
            </section>
          )}
        </div>
      </div>
      {open && (
        <button
          className="popover-dismiss"
          tabIndex={-1}
          aria-label={translateMessage("ui.be0d5706c6")}
          onClick={() => setOpen("")}
        />
      )}
    </header>
  );
}
