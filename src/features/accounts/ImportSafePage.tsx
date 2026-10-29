import Select from "../../ui/Select";
import { translateMessage } from "../../i18n";
import { ToastNotice, notify } from "../../ui/Toast";
import { useQuery } from "@tanstack/react-query";
import { fetchSafeRegistry } from "../transactions/safe-config";
import { creationNetworks } from "./creation-networks";
import {
  networkPrefix,
  importAddress,
  stripNetworkPrefix,
} from "./import-address";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Info, Copy, ExternalLink } from "lucide-react";
import type { Address } from "viem";
import { chains, loadSafe, type SafeInfo, type Settings } from "../../core";
import { read, save } from "../../storage";
import AddressAvatar from "../../ui/AddressAvatar";
export default function ImportSafePage({
  settings,
  onNetworkChange,
  onImported,
  onBusyChange,
}: {
  settings: Settings;
  onBusyChange?: (busy: boolean) => void;
  onNetworkChange: (id: number) => void;
  onImported: (safe: Address, name: string) => void;
}) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get("next");
  const returnTo =
    next &&
    ["/accounts", "/welcome/accounts", "/assets", "/transactions"].includes(
      next,
    )
      ? next
      : "/accounts";
  const registryQuery = useQuery({
    queryKey: ["creation-safe-registry"],
    queryFn: ({ signal }) => fetchSafeRegistry(signal, false),
    staleTime: 60000,
    retry: 1,
  });
  const availableNetworks = registryQuery.data
    ? creationNetworks(registryQuery.data)
    : [];
  const networkSelected =
    availableNetworks.some((c) => c.id === settings.chainId && c.supported) &&
    !registryQuery.isError;
  const [name, setName] = useState("");
  const [input, setInput] = useState(params.get("address") || "");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const generation = useRef(0);
  function setError(text: string) {
    if (text) notify({ text, error: true });
  }
  const [info, setInfo] = useState<SafeInfo>();
  const [validated, setValidated] = useState<{
    safe: Address;
    chainId: number;
  }>();
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({});
  const chain = chains.find((c) => c.id === settings.chainId)!;
  const networkName = settings.chainId === 97 ? "bnb-test" : chain.name;
  const prefix = networkPrefix(settings.chainId);
  const displayName =
    name.trim() || translateMessage("ui.1c0158a01b", { p0: networkName });
  let parsed: Address | undefined;
  let validationError = "";
  try {
    parsed = importAddress(input, settings.chainId);
  } catch (e) {
    if (input.trim())
      validationError =
        e instanceof Error ? e.message : translateMessage("ui.5cc09fec5d");
  }
  useEffect(() => {
    generation.current++;
    setBusy(false);
    setInfo(undefined);
    setValidated(undefined);
    setStep(0);
    setError("");
    return () => {
      generation.current++;
    };
  }, [settings.chainId, settings.rpc]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);
  async function check() {
    if (!parsed || busy || !networkSelected) return;
    const requestGeneration = generation.current;
    setBusy(true);
    setError("");
    try {
      const snapshot = settings;
      const result = await loadSafe(snapshot, parsed);
      if (generation.current !== requestGeneration) return;
      setInfo(result);
      setValidated({ safe: parsed, chainId: snapshot.chainId });
      setOwnerNames(read<Record<string, string>>("safe-owner-names", {}));
      setStep(1);
    } catch (e) {
      if (generation.current !== requestGeneration) return;
      setError(
        e instanceof Error ? e.message : translateMessage("ui.549328687b"),
      );
    } finally {
      if (generation.current === requestGeneration) setBusy(false);
    }
  }
  async function finish() {
    if (!info || !validated || busy || !networkSelected) return;
    const requestGeneration = generation.current;
    setBusy(true);
    setError("");
    try {
      if (validated.chainId !== settings.chainId)
        throw Error(translateMessage("ui.b955f8e362"));
      const latest = await loadSafe(settings, validated.safe);
      if (generation.current !== requestGeneration) return;
      if (
        latest.threshold !== info.threshold ||
        latest.owners.length !== info.owners.length ||
        !latest.owners.every((owner) =>
          info.owners.some((a) => a.toLowerCase() === owner.toLowerCase()),
        )
      ) {
        setInfo(latest);
        setStep(1);
        throw Error(translateMessage("ui.2fce108735"));
      }
      const saved = read<Record<string, string>>("safe-owner-names", {});
      latest.owners.forEach((owner) => {
        const value = ownerNames[owner.toLowerCase()]?.trim();
        if (value) saved[owner.toLowerCase()] = value;
      });
      save("safe-owner-names", saved);
      onImported(validated.safe, displayName);
    } catch (e) {
      if (generation.current !== requestGeneration) return;
      setError(
        e instanceof Error ? e.message : translateMessage("ui.1270360d69"),
      );
    } finally {
      if (generation.current === requestGeneration) setBusy(false);
    }
  }
  const titles = [
    translateMessage("ui.3618f8160e"),
    translateMessage("ui.d74a5167c0"),
    translateMessage("ui.978e275133"),
  ];
  const subtitles = [
    translateMessage("ui.a981fd1a3d"),
    translateMessage("ui.d0d6dea4ae"),
    translateMessage("ui.dd4e725a1e"),
  ];
  return (
    <section className="safe-load-page">
      <h1>{translateMessage("ui.d8c2b0b066")}</h1>
      <section className="safe-create-card">
        <div
          className="safe-create-progress"
          aria-label={translateMessage("ui.dcb88018b8", { p0: step + 1 })}
        >
          <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
        <header className="safe-create-header">
          <span className="safe-step-number">{step + 1}</span>
          <div>
            <h2>{titles[step]}</h2>
            <p>{subtitles[step]}</p>
          </div>
        </header>
        <ToastNotice
          message={
            registryQuery.isError
              ? translateMessage("ui.a7ea962c5c")
              : undefined
          }
          action={{
            label: translateMessage("ui.7bdd5ce1e2"),
            run: () => registryQuery.refetch(),
          }}
        />
        <ToastNotice
          message={
            !registryQuery.isPending &&
            !registryQuery.isError &&
            availableNetworks.length === 0
              ? translateMessage("ui.026d0bc52b")
              : undefined
          }
        />
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void check();
            }}
          >
            <div className="safe-create-body safe-load-body">
              <div className="safe-load-name-network">
                <label>
                  {translateMessage("ui.d44e9b3d3b")}
                  <span className="safe-name-field">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={displayName}
                      maxLength={60}
                    />
                    <span
                      className="safe-name-info"
                      title={translateMessage("ui.8aef2c0149")}
                    >
                      <Info size={18} />
                    </span>
                  </span>
                </label>
                <label className="safe-load-network-label">
                  <span className="sr-only">
                    {translateMessage("ui.97b31b5d63")}
                  </span>
                  <span className="safe-load-network">
                    <span className="safe-network-icon" aria-hidden="true">
                      ?
                    </span>
                    <Select
                      aria-label={translateMessage("ui.577d4fa0ba")}
                      disabled={
                        busy || registryQuery.isPending || registryQuery.isError
                      }
                      value={networkSelected ? settings.chainId : ""}
                      onValueChange={(value) => onNetworkChange(Number(value))}
                    >
                      <option value="" disabled>
                        {registryQuery.isPending
                          ? translateMessage("ui.07c4757d7f")
                          : translateMessage("ui.f0f2df4675")}
                      </option>
                      {availableNetworks.map((c) => (
                        <option key={c.id} value={c.id} disabled={!c.supported}>
                          {c.id === 97 ? "bnb-test" : c.name}（{c.id}）
                          {!c.supported
                            ? translateMessage("ui.a4b84d1e84")
                            : ""}
                        </option>
                      ))}
                    </Select>
                  </span>
                </label>
              </div>
              <label>
                {translateMessage("ui.7f0c3ab2b6")}
                <span
                  className={`safe-address-input safe-load-address ${validationError ? "invalid" : ""}`}
                >
                  {parsed ? (
                    <AddressAvatar address={parsed} />
                  ) : (
                    <span className="safe-empty-avatar" />
                  )}
                  <span className="safe-address-prefix">{prefix}</span>
                  <input
                    aria-label={translateMessage("ui.d900ed9248")}
                    value={input}
                    onChange={(e) => {
                      setInput(
                        stripNetworkPrefix(e.target.value, settings.chainId),
                      );
                      setError("");
                    }}
                    placeholder=""
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!validationError}
                    onBlur={() => {
                      if (validationError)
                        notify({ text: validationError, error: true });
                    }}
                    disabled={busy}
                  />
                </span>
              </label>
              <p className="safe-load-description">
                {translateMessage("ui.9859161dbb")}
              </p>
            </div>
            <footer className="safe-create-actions">
              <Link className="secondary" to={returnTo}>
                {translateMessage("ui.572cf45ba4")}
              </Link>
              <button
                className="primary"
                disabled={!parsed || busy || !networkSelected}
              >
                {busy
                  ? translateMessage("ui.6b72c3d685")
                  : translateMessage("ui.acfc4e74a6")}
              </button>
            </footer>
          </form>
        )}
        {step === 1 && info && validated && (
          <>
            <div className="safe-create-body safe-signers-body">
              {info.owners.map((owner, i) => (
                <div className="safe-owner-row safe-load-owner" key={owner}>
                  <label>
                    {translateMessage("ui.89b5864d94")}
                    <input
                      aria-label={translateMessage("ui.62f38614d2", {
                        p0: i + 1,
                      })}
                      value={ownerNames[owner.toLowerCase()] || ""}
                      onChange={(e) =>
                        setOwnerNames({
                          ...ownerNames,
                          [owner.toLowerCase()]: e.target.value,
                        })
                      }
                      placeholder={translateMessage("ui.96adb0d526", {
                        p0: i + 1,
                      })}
                      maxLength={60}
                    />
                  </label>
                  <label>
                    {translateMessage("ui.09a88b8f2e")}
                    <span className="safe-address-input">
                      <AddressAvatar address={owner} />
                      <span className="safe-address-prefix">{prefix}</span>
                      <input
                        aria-label={translateMessage("ui.5ab868add8", {
                          p0: i + 1,
                        })}
                        readOnly
                        value={owner}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div className="safe-create-body safe-create-divider safe-threshold-body">
              <h3>
                {translateMessage("ui.b154c46c03")}
                <Info size={16} />
              </h3>
              <p>
                {translateMessage("account.thresholdDescription", {
                  required: info.threshold,
                  total: info.owners.length,
                })}
              </p>
              <span>
                {translateMessage("account.threshold", {
                  required: info.threshold,
                  total: info.owners.length,
                })}
              </span>
            </div>
            <footer className="safe-create-actions">
              <button
                className="secondary"
                onClick={() => {
                  setStep(0);
                  setError("");
                }}
              >
                <ArrowLeft size={18} />
                {translateMessage("ui.572cf45ba4")}
              </button>
              <button className="primary" onClick={() => setStep(2)}>
                {translateMessage("ui.acfc4e74a6")}
              </button>
            </footer>
          </>
        )}
        {step === 2 && info && validated && (
          <>
            <div className="safe-create-body">
              <dl className="safe-review-list safe-load-review">
                <dt>{translateMessage("ui.97b31b5d63")}</dt>
                <dd>{networkName}</dd>
                <dt>{translateMessage("ui.d44e9b3d3b")}</dt>
                <dd>{displayName}</dd>
                <dt>{translateMessage("ui.7f0c3ab2b6")}</dt>
                <dd className="safe-load-review-address">
                  <AddressAvatar address={validated.safe} />
                  <span className="break">{validated.safe}</span>
                  <a
                    className="icon"
                    aria-label={translateMessage("ui.85d6804f31")}
                    href={`${chain.blockExplorers?.default.url}/address/${validated.safe}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </dd>
                <dt>{translateMessage("ui.09a88b8f2e")}</dt>
                <dd className="safe-review-owners">
                  {info.owners.map((owner, i) => (
                    <div className="safe-review-owner" key={owner}>
                      <AddressAvatar address={owner} />
                      <div>
                        <span className="safe-owner-address">{owner}</span>
                        {ownerNames[owner.toLowerCase()] && (
                          <small className="muted">
                            {ownerNames[owner.toLowerCase()]}
                          </small>
                        )}
                      </div>
                      <button
                        className="icon"
                        aria-label={translateMessage("ui.73a7406d65", {
                          p0: i + 1,
                        })}
                        onClick={() =>
                          void navigator.clipboard
                            .writeText(owner)
                            .catch(() =>
                              setError(translateMessage("ui.e84fb892f7")),
                            )
                        }
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  ))}
                </dd>
                <dt>{translateMessage("ui.f26c6f4db3")}</dt>
                <dd>
                  {translateMessage("account.threshold", {
                    required: info.threshold,
                    total: info.owners.length,
                  })}
                </dd>
                <dt>{translateMessage("ui.d2a526d55a")}</dt>
                <dd>{info.version}</dd>
              </dl>
            </div>
            <footer className="safe-create-actions">
              <button
                className="secondary"
                disabled={busy}
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                <ArrowLeft size={18} />
                {translateMessage("ui.572cf45ba4")}
              </button>
              <button
                className="primary"
                disabled={busy || !networkSelected}
                onClick={() => void finish()}
              >
                {busy
                  ? translateMessage("ui.c725500abc")
                  : translateMessage("ui.1d3c7c2591")}
              </button>
            </footer>
          </>
        )}
      </section>
    </section>
  );
}
