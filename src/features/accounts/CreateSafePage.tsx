import Select from "../../ui/Select";
import { translateMessage } from "../../i18n";
import { ToastNotice, notify } from "../../ui/Toast";
import { useQuery } from "@tanstack/react-query";
import { creationNetworks } from "./creation-networks";
import AddressAvatar from "../../ui/AddressAvatar";
import {
  APP_SAFE_DEPLOYMENT,
  assertAppSafeVersion,
  appCompatibleDeployment,
} from "./safe-deployment";
import { fetchSafeRegistry } from "../transactions/safe-config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  Lightbulb,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { save, read } from "../../storage";
import { Link, useLocation } from "react-router-dom";
import {
  formatUnits,
  parseAbi,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import {
  address,
  client,
  loadSafe,
  wallet,
  chains,
  type Settings,
} from "../../core";
type Prepared = {
  address: Address;
  to: Address;
  data: Hex;
  value: bigint;
  chainId: number;
  singleton: Address;
  owners: Address[];
  threshold: number;
  gas: bigint;
  fee: bigint;
  account: Address;
};
export default function CreateSafePage({
  settings,
  account,
  provider,
  onCreated,
  onNetworkChange,
  onConnected,
  onBusyChange,
}: {
  settings: Settings;
  onBusyChange?: (busy: boolean) => void;
  account?: Address;
  provider: () => EIP1193Provider;
  onCreated: (address: Address, name: string) => void;
  onNetworkChange: (id: number) => void;
  onConnected: (account: Address) => void;
}) {
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next");
  const returnTo =
    next &&
    ["/accounts", "/welcome/accounts", "/assets", "/transactions"].includes(
      next,
    )
      ? next
      : "/accounts";
  const [name, setName] = useState("");
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
  const [copied, setCopied] = useState("");
  const [owners, setOwners] = useState([account ?? ""]);
  const [ownerNames, setOwnerNames] = useState([""]);
  const [connected, setConnected] = useState(account);
  const [step, setStep] = useState(0);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);
  useEffect(() => {
    setConnected(account);
    if (account)
      setOwners((prev) => (prev[0] ? prev : [account, ...prev.slice(1)]));
  }, [account]);
  const [threshold, setThreshold] = useState(1);
  const chain = chains.find((c) => c.id === settings.chainId)!;
  const titles = [
    translateMessage("ui.6ff5f5c4d6"),
    translateMessage("ui.d74a5167c0"),
    translateMessage("ui.978e275133"),
  ];
  const subtitles = [
    translateMessage("ui.53ee06168a"),
    translateMessage("ui.08e166548b"),
    translateMessage("ui.d0a92d1d1b"),
  ];
  const networkName =
    settings.chainId === 97
      ? "bnb-test"
      : settings.chainId === 56
        ? "BNB Smart Chain"
        : chain.name;
  const prefix =
    settings.chainId === 97 ? "bnbt:" : settings.chainId === 56 ? "bnb:" : "";
  const displayName =
    name || translateMessage("ui.1c0158a01b", { p0: networkName });
  async function copyOwner(owner: string) {
    try {
      await navigator.clipboard.writeText(owner);
      setCopied(owner);
    } catch {
      setError(translateMessage("ui.e84fb892f7"));
    }
  }
  const ownerErrors = owners.map((owner, i) => {
    if (!owner.trim()) return translateMessage("ui.9ee2fa41ee");
    try {
      const normalized = address(owner).toLowerCase();
      if (
        normalized === "0x0000000000000000000000000000000000000000" ||
        normalized === "0x0000000000000000000000000000000000000001"
      )
        return translateMessage("ui.bfc9e1536e");
      if (
        owners.some((other, j) => i !== j && other.toLowerCase() === normalized)
      )
        return translateMessage("ui.1b0fbaf8d8");
    } catch {
      return translateMessage("ui.ff7733f7e4");
    }
    return "";
  });
  async function connectWallet() {
    setBusy(true);
    setError("");
    try {
      const { account: selected } = await wallet(provider(), settings);
      setConnected(selected);
      onConnected(selected);
      setOwners((prev) => (prev[0] ? prev : [selected, ...prev.slice(1)]));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : translateMessage("ui.a267845e09"),
      );
    } finally {
      setBusy(false);
    }
  }
  const [deploymentMode, setDeploymentMode] = useState<"app" | "registry">(
    "registry",
  );
  const [prepared, setPrepared] = useState<Prepared>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  function setError(text: string) {
    if (text) notify({ text, error: true });
  }
  const [salt] = useState(() =>
    String(
      BigInt(
        "0x" +
          Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
            b.toString(16).padStart(2, "0"),
          ).join(""),
      ),
    ),
  );
  async function prepare() {
    setBusy(true);
    setError("");
    try {
      if (ownerErrors.some(Boolean)) throw Error(ownerErrors.find(Boolean));
      if (!networkSelected) throw Error(translateMessage("ui.40317956b5"));
      const valid = owners.map(address);
      if (new Set(valid.map((a) => a.toLowerCase())).size !== valid.length)
        throw Error(translateMessage("ui.32eaaa76fb"));
      if (threshold < 1 || threshold > valid.length)
        throw Error(translateMessage("ui.f121223b1b"));
      const { account } = await wallet(provider(), settings);
      const c = client(settings);
      const config =
        deploymentMode === "app"
          ? appCompatibleDeployment(settings.chainId)
          : (await fetchSafeRegistry(undefined, false))[
              `evm_${settings.chainId}`
            ]?.safe;
      if (!config) throw Error(translateMessage("ui.e4cdcdfb95"));
      for (const a of [config.factory, config.singleton, config.handler]) {
        const code = await c.getCode({ address: address(a) });
        if (!code || code === "0x")
          throw Error(translateMessage("ui.42e0a6df26"));
      }
      const singletonVersion = await c.readContract({
        address: address(config.singleton),
        abi: parseAbi(["function VERSION() view returns (string)"]),
        functionName: "VERSION",
      });
      assertAppSafeVersion(singletonVersion);
      const { default: Safe } = await import("@safe-global/protocol-kit");
      const sdk = await Safe.init({
        provider: provider() as unknown as Parameters<
          typeof Safe.init
        >[0]["provider"],
        signer: account,
        isL1SafeSingleton: APP_SAFE_DEPLOYMENT.isL1SafeSingleton,
        contractNetworks: {
          [settings.chainId]: {
            safeSingletonAddress: config.singleton,
            safeProxyFactoryAddress: config.factory,
            fallbackHandlerAddress: config.handler,
          },
        },
        predictedSafe: {
          safeAccountConfig: {
            owners: valid,
            threshold,
            fallbackHandler: config.handler,
          },
          safeDeploymentConfig: {
            safeVersion: APP_SAFE_DEPLOYMENT.safeVersion,
            saltNonce: salt,
          },
        },
      });
      const tx = await sdk.createSafeDeploymentTransaction();
      const data = tx.data as Hex;
      const to = address(tx.to);
      const value = BigInt(tx.value);
      const gas = await c.estimateGas({ account, to, data, value });
      const price = await c.getGasPrice();
      setPrepared({
        address: address(await sdk.getAddress()),
        to,
        data,
        value,
        chainId: settings.chainId,
        singleton: address(config.singleton),
        owners: valid,
        threshold,
        gas,
        fee: gas * price,
        account,
      });
      setStep(2);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : translateMessage("ui.69244bc51f"),
      );
    } finally {
      setBusy(false);
    }
  }
  async function deploy() {
    if (!prepared) return;
    setBusy(true);
    setError("");
    try {
      if (settings.chainId !== prepared.chainId)
        throw Error(translateMessage("ui.f187287e3b"));
      const { w, account } = await wallet(provider(), settings);
      if (account.toLowerCase() !== prepared.account.toLowerCase())
        throw Error(translateMessage("ui.adf56da93d"));
      const c = client(settings);
      const hash = await w.sendTransaction({
        account,
        chain: c.chain,
        to: prepared.to,
        data: prepared.data,
        value: prepared.value,
      });
      const receipt = await c.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw Error(translateMessage("ui.e807b0a899"));
      const info = await loadSafe(settings, prepared.address);
      assertAppSafeVersion(info.version);
      if (info.threshold !== prepared.threshold)
        throw Error(translateMessage("ui.7686a8364b"));
      if (
        info.owners.length !== prepared.owners.length ||
        !prepared.owners.every((owner) =>
          info.owners.some(
            (actual) => actual.toLowerCase() === owner.toLowerCase(),
          ),
        )
      )
        throw Error(translateMessage("ui.0484b4bbfe"));
      const singletonSlot = await c.getStorageAt({
        address: prepared.address,
        slot: "0x0",
      });
      if (
        !singletonSlot ||
        singletonSlot.slice(-40).toLowerCase() !==
          prepared.singleton.slice(2).toLowerCase()
      )
        throw Error(translateMessage("ui.6a75760a20"));
      const names = read<Record<string, string>>("safe-owner-names", {});
      prepared.owners.forEach((owner, i) => {
        if (ownerNames[i]?.trim())
          names[owner.toLowerCase()] = ownerNames[i].trim();
      });
      save("safe-owner-names", names);
      onCreated(prepared.address, displayName);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : translateMessage("ui.e4959b8ba2"),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="safe-create-page">
      <h1>{translateMessage("ui.fe5e60ce7b")}</h1>
      <div className={`safe-create-layout safe-create-step-${step}`}>
        <section className="safe-create-card">
          <div
            className="safe-create-progress"
            aria-label={translateMessage("ui.dcb88018b8", { p0: step + 1 })}
          >
            <span style={{ width: `${(step + 1) * 25}%` }} />
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
                setError("");
                if (networkSelected) setStep(1);
              }}
            >
              <div className="safe-create-body safe-basics-body">
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
                      title={translateMessage("ui.7f240644d4")}
                      className="safe-name-info"
                    >
                      <Info size={18} />
                    </span>
                  </span>
                </label>
                <label>
                  {translateMessage("ui.62755265a6")}
                  <span className="safe-field-description">
                    {translateMessage("ui.9a7cbf91ba")}
                  </span>
                  <Select
                    aria-label={translateMessage("ui.a29f85c97c")}
                    value={networkSelected ? settings.chainId : ""}
                    disabled={
                      busy || registryQuery.isPending || registryQuery.isError
                    }
                    onValueChange={(value) => {
                      onNetworkChange(Number(value));
                      setPrepared(undefined);
                      setDeploymentMode("registry");
                    }}
                  >
                    <option value="" disabled>
                      {registryQuery.isPending
                        ? translateMessage("ui.07c4757d7f")
                        : translateMessage("ui.f0f2df4675")}
                    </option>
                    {availableNetworks.map((c) => (
                      <option key={c.id} value={c.id} disabled={!c.supported}>
                        {c.id === 97 ? "bnb-test" : c.name}（{c.id}）
                        {!c.supported ? translateMessage("ui.a4b84d1e84") : ""}
                      </option>
                    ))}
                  </Select>
                </label>
                {!connected && (
                  <div className="safe-connect-warning">
                    <strong>{translateMessage("ui.5059be965b")}</strong>
                    <p>{translateMessage("ui.539d98e491")}</p>
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={() => void connectWallet()}
                    >
                      {translateMessage("ui.a5574109f0")}
                    </button>
                  </div>
                )}
              </div>
              <footer className="safe-create-actions">
                <Link className="secondary" to={returnTo}>
                  {translateMessage("ui.2cd0f3be87")}
                </Link>
                <button
                  className="primary"
                  disabled={!connected || !networkSelected || busy}
                >
                  {translateMessage("ui.acfc4e74a6")}
                </button>
              </footer>
            </form>
          )}
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void prepare();
              }}
            >
              <div className="safe-create-body safe-signers-body">
                {owners.map((owner, i) => (
                  <div className="safe-owner-row" key={i}>
                    <label>
                      {translateMessage("ui.89b5864d94")}
                      <input
                        aria-label={translateMessage("ui.62f38614d2", {
                          p0: i + 1,
                        })}
                        value={ownerNames[i] ?? ""}
                        onChange={(e) =>
                          setOwnerNames((prev) =>
                            prev.map((n, j) => (i === j ? e.target.value : n)),
                          )
                        }
                        placeholder={translateMessage("ui.96adb0d526", {
                          p0: i + 1,
                        })}
                        maxLength={60}
                      />
                      {owner.toLowerCase() === connected?.toLowerCase() && (
                        <small className="muted">
                          {translateMessage("ui.477e9d0b91")}
                        </small>
                      )}
                    </label>
                    <label>
                      {translateMessage("ui.09a88b8f2e")}
                      <span
                        className={`safe-address-input ${owner && ownerErrors[i] ? "invalid" : ""}`}
                      >
                        {/^0x[0-9a-fA-F]{40}$/.test(owner) && (
                          <AddressAvatar address={owner} />
                        )}
                        <span className="safe-address-prefix">{prefix}</span>
                        <input
                          aria-label={translateMessage("ui.5ab868add8", {
                            p0: i + 1,
                          })}
                          aria-invalid={!!owner && !!ownerErrors[i]}
                          onBlur={() => {
                            if (owner && ownerErrors[i])
                              notify({ text: ownerErrors[i], error: true });
                          }}
                          value={owner}
                          onChange={(e) =>
                            setOwners((prev) =>
                              prev.map((a, j) =>
                                i === j ? e.target.value : a,
                              ),
                            )
                          }
                          placeholder="0x…"
                        />
                      </span>
                    </label>
                    {i > 0 && (
                      <button
                        type="button"
                        className="icon"
                        aria-label={translateMessage("ui.031595679e", {
                          p0: i + 1,
                        })}
                        onClick={() => {
                          setOwners(owners.filter((_, j) => i !== j));
                          setOwnerNames(ownerNames.filter((_, j) => i !== j));
                          setThreshold(Math.min(threshold, owners.length - 1));
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-btn safe-add-signer"
                  onClick={() => {
                    setOwners([...owners, ""]);
                    setOwnerNames([...ownerNames, ""]);
                  }}
                >
                  <Plus size={18} />
                  {translateMessage("ui.5fe7475639")}
                </button>
              </div>
              <div className="safe-create-body safe-create-divider safe-threshold-body">
                <h3>
                  {translateMessage("ui.b154c46c03")}
                  <Info size={16} />
                </h3>
                <p>{translateMessage("ui.a8d4580cdc")}</p>
                <div className="safe-threshold">
                  <Select
                    aria-label={translateMessage("ui.f26c6f4db3")}
                    value={threshold}
                    onValueChange={(value) => setThreshold(Number(value))}
                  >
                    {owners.map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Select>
                  <span>
                    {translateMessage("ui.70249d0491")}
                    {owners.length}
                    {translateMessage("ui.c40863c1bf")}
                  </span>
                </div>
              </div>
              <footer className="safe-create-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    setError("");
                    setStep(0);
                  }}
                >
                  <ArrowLeft size={18} />
                  {translateMessage("ui.572cf45ba4")}
                </button>
                <button
                  className="primary"
                  disabled={busy || ownerErrors.some(Boolean)}
                >
                  {busy
                    ? translateMessage("ui.ee727ba4d1")
                    : translateMessage("ui.acfc4e74a6")}
                </button>
              </footer>
            </form>
          )}
          {step === 2 && prepared && (
            <>
              <div className="safe-create-body safe-review-body">
                <dl className="safe-review-list">
                  <dt>{translateMessage("ui.97b31b5d63")}</dt>
                  <dd>
                    <span className="safe-network-icon" title={networkName}>
                      ?
                    </span>
                    <span className="sr-only">{networkName}</span>
                  </dd>
                  <dt>{translateMessage("ui.d44e9b3d3b")}</dt>
                  <dd>{displayName}</dd>
                  <dt>{translateMessage("ui.09a88b8f2e")}</dt>
                  <dd className="safe-review-owners">
                    {owners.map((owner, i) => (
                      <div className="safe-review-owner" key={owner}>
                        <AddressAvatar address={owner} size={40} />
                        <div>
                          <span
                            className="safe-owner-address"
                            title={ownerNames[i] || undefined}
                          >
                            {owner}
                          </span>
                          {ownerNames[i] && (
                            <small className="muted">{ownerNames[i]}</small>
                          )}
                        </div>
                        <button
                          type="button"
                          className="icon"
                          aria-label={translateMessage("ui.73a7406d65", {
                            p0: i + 1,
                          })}
                          onClick={() => void copyOwner(owner)}
                          title={
                            copied === owner
                              ? translateMessage("ui.8f6f8d979c")
                              : translateMessage("ui.4c6de01bbe")
                          }
                        >
                          <Copy size={15} />
                        </button>
                        {chain.blockExplorers?.default.url && (
                          <a
                            href={`${chain.blockExplorers.default.url}/address/${owner}`}
                            target="_blank"
                            rel="noreferrer"
                            className="icon"
                            aria-label={translateMessage("ui.524288c14a", {
                              p0: i + 1,
                            })}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    ))}
                  </dd>
                  <dt>{translateMessage("ui.f26c6f4db3")}</dt>
                  <dd>
                    {translateMessage("account.threshold", {
                      required: threshold,
                      total: owners.length,
                    })}
                  </dd>
                </dl>
              </div>
              <div className="safe-create-body safe-create-divider safe-fee-section">
                <span>{translateMessage("ui.79c94df7cc")}</span>
                <div>
                  <strong className="safe-fee-badge">
                    ≈ {Number(formatUnits(prepared.fee, 18)).toPrecision(4)}{" "}
                    {chain.nativeCurrency.symbol}
                  </strong>
                  <p className="muted">{translateMessage("ui.68adcd7c2d")}</p>
                </div>
              </div>
              <footer className="safe-create-actions">
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    setPrepared(undefined);
                    setError("");
                    setStep(1);
                  }}
                >
                  <ArrowLeft size={18} />
                  {translateMessage("ui.572cf45ba4")}
                </button>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void deploy()}
                >
                  {busy
                    ? translateMessage("ui.ed492c3a8b")
                    : translateMessage("ui.20fbeb2444")}
                </button>
              </footer>
            </>
          )}
        </section>
        <aside className="safe-create-aside">
          {step < 2 && (
            <section className="safe-preview-card">
              <header>
                <img
                  className="safe-preview-logo"
                  src="/images/brand-logo.png"
                  alt={translateMessage("ui.7f0c3ab2b6")}
                />
                <h2>{translateMessage("ui.dc8afcfdb8")}</h2>
              </header>
              <div className="safe-preview-content">
                {!connected ? (
                  <>
                    <p className="muted">{translateMessage("ui.09469aa9eb")}</p>
                    <button
                      className="primary full"
                      disabled={busy}
                      onClick={() => void connectWallet()}
                    >
                      {translateMessage("ui.a5574109f0")}
                    </button>
                  </>
                ) : (
                  <dl className="safe-preview-rows">
                    <dt>{translateMessage("ui.268002cb01")}</dt>
                    <dd>
                      <AddressAvatar address={connected} />
                      <span>
                        <b>{prefix}</b>
                        {connected.slice(0, 6)}…{connected.slice(-4)}
                      </span>
                    </dd>
                    <dt>{translateMessage("ui.d44e9b3d3b")}</dt>
                    <dd>{displayName}</dd>
                    <dt>{translateMessage("ui.97b31b5d63")}</dt>
                    <dd>
                      {networkSelected && (
                        <span className="safe-network-icon" title={networkName}>
                          ?
                        </span>
                      )}
                    </dd>
                  </dl>
                )}
              </div>
            </section>
          )}
          {step > 0 && (
            <section className="safe-create-tip">
              <h3>
                <Lightbulb size={15} />
                {translateMessage("ui.fe5e60ce7b")}
              </h3>
              {(step === 1
                ? [
                    [
                      translateMessage("ui.68c40f077a"),
                      translateMessage("ui.452cf93f8e"),
                    ],
                    [
                      translateMessage("ui.8de9e2c778"),
                      translateMessage("ui.0a8b20c8a3"),
                    ],
                  ]
                : [
                    [
                      translateMessage("ui.02a88734c1"),
                      translateMessage("ui.3e1a853290"),
                    ],
                    [
                      translateMessage("ui.8f53abacb3"),
                      translateMessage("ui.cfa998b831"),
                    ],
                    [
                      translateMessage("ui.02564f237a"),
                      translateMessage("ui.3973a054f3", {
                        p0: APP_SAFE_DEPLOYMENT.safeVersion,
                        p1:
                          deploymentMode === "registry"
                            ? translateMessage("ui.7d4f8b7751")
                            : translateMessage("ui.e2cfa8ba38"),
                      }),
                    ],
                  ]
              ).map(([title, text]) => (
                <details key={title}>
                  <summary>
                    {title}
                    <ChevronDown size={16} />
                  </summary>
                  <p>{text}</p>
                  {step === 2 &&
                    title === translateMessage("ui.02564f237a") && (
                      <div className="safe-config-control">
                        {" "}
                        <label>
                          {translateMessage("ui.ccbf90f527")}
                          <Select
                            value={deploymentMode}
                            onValueChange={(value) => {
                              setDeploymentMode(value as "app" | "registry");
                              setPrepared(undefined);
                              setStep(1);
                            }}
                          >
                            {settings.chainId === 97 && (
                              <option value="app">
                                {translateMessage("ui.e2cfa8ba38")}
                              </option>
                            )}
                            <option value="registry">
                              {translateMessage("ui.59742432bd")}
                            </option>
                          </Select>
                        </label>
                        <p className="break">
                          Singleton：{prepared?.singleton}
                        </p>
                      </div>
                    )}
                </details>
              ))}
            </section>
          )}
          {step === 1 && (
            <section className="safe-create-tip">
              <h3>
                <Lightbulb size={15} />
                {translateMessage("ui.02564f237a")}
              </h3>
              <details open>
                <summary>
                  {threshold}/{owners.length}
                  {translateMessage("ui.9e9e9b11f4")}
                  <ChevronDown size={16} />
                </summary>
                <p>
                  {threshold === owners.length
                    ? translateMessage("ui.4327a4396b")
                    : translateMessage("ui.16884d69ea", {
                        p0: owners.length,
                        p1: threshold,
                      })}
                </p>
              </details>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}
