import LegalPage, { legalDocumentType } from "./features/legal/LegalPage";
import GlobalLoading from "./ui/GlobalLoading";
import { useWalletAccount } from "./ui/useWalletAccount";
import Select from "./ui/Select";
import { translateMessage, formatDate } from "./i18n";
import { ToastNotice } from "./ui/Toast";
import ImportSafePage from "./features/accounts/ImportSafePage";
import NonceConflictDialog from "./features/transactions/NonceConflictDialog";
import { resolveProposalNonce } from "./features/transactions/proposal-nonce";
import { submitProposal } from "./features/transactions/submit";
import Modal from "./ui/Modal";
import HistoryPanel from "./features/transactions/HistoryPanel";
import {
  fetchSafeRegistry,
  fetchSafeService,
} from "./features/transactions/safe-config";
import { syncPending, reconcilePending } from "./features/transactions/sync";
import OwnersPage from "./features/accounts/OwnersPage";
import Topbar from "./ui/Topbar";
import AccountsPage from "./features/accounts/AccountsPage";
import CreateSafePage from "./features/accounts/CreateSafePage";
import { parseAccountData } from "./features/accounts/import-data";
import { loadAppAssets } from "./app-config";
import { useEffect, useState, type FormEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Layers,
  Users,
  History,
  Settings2,
  Plus,
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  X,
  Check,
  CircleHelp,
  Download,
  Share2,
  Search,
  ChevronLeft,
  Upload,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  formatUnits,
  parseUnits,
  parseAbi,
  encodeFunctionData,
  decodeFunctionData,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import {
  abi,
  active,
  address,
  chains,
  client,
  draft,
  decodeTransfer,
  erc20,
  execute,
  loadSafe,
  normalizeTx,
  SafeTransactionApi,
  short,
  sign,
  verify,
  wallet,
  type Settings,
  type Tx,
} from "./core";
import { defaults, mergeTxs, read, save } from "./storage";
import { appShare, appShareLink, parseShare } from "./share";
declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        listener: (...args: unknown[]) => void,
      ) => void;
    };
  }
}
type SavedSafe = {
  address: Address;
  chainId: number;
  name: string;
};
type Token = {
  address: Address;
  symbol: string;
  decimals: number;
};
export default function App() {
  const [settings, setSettings] = useState(() =>
    read<Settings>("settings", defaults),
  );
  const [safes, setSafes] = useState(() => read<SavedSafe[]>("safes", []));
  const [selected, setSelected] = useState(() => read<string>("selected", ""));
  const [txs, setTxs] = useState(() => read<Tx[]>("transactions", []));
  const [tokens, setTokens] = useState(() =>
    read<Record<number, Token[]>>("tokens", {}),
  );
  const { account, connected: setAccount, disconnect } = useWalletAccount();
  const [modal, setModal] = useState("");
  const [detail, setDetail] = useState<Tx>();
  const [busy, setBusy] = useState(false);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [nonceConflict, setNonceConflict] = useState<{
    nonce: number;
    queueNonce: number;
    canReplace: boolean;
    resolve: (policy: "replace" | "queue" | null) => void;
  }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    error: boolean;
  }>();
  const [share, setShare] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);
  const page =
    location.pathname === "/welcome/accounts"
      ? "accounts"
      : location.pathname.split("/")[1] || "accounts";
  const onboarding = page === "new-safe";
  const legalPage = legalDocumentType(location.pathname);
  const [importedAccounts, setImportedAccounts] = useState<SavedSafe[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const chain = chains.find((c) => c.id === settings.chainId)!;
  const current = safes.find(
    (s) => s.address === selected && s.chainId === settings.chainId,
  );
  const safe = current?.address;
  const accountView =
    !legalPage &&
    (page === "accounts" ||
      (!safe && !["settings", "new-safe"].includes(page)));
  const configuredApi =
    settings.api ||
    (settings.chainId === 97 ? import.meta.env.VITE_SAFE_TX_SERVICE_URL : "") ||
    "";
  const serviceConfig = useQuery({
    queryKey: ["safe-service-config", settings.chainId],
    queryFn: ({ signal }) => fetchSafeService(settings.chainId, signal),
    enabled:
      (!!safe ||
        !!new URLSearchParams(location.hash.slice(1)).get("share") ||
        !!new URLSearchParams(location.search).get("tx")) &&
      !configuredApi &&
      !legalPage,
    initialData: () =>
      read<string | undefined>(
        `safe-service-config-v2:${settings.chainId}`,
        undefined,
      ),
    initialDataUpdatedAt: 0,
    staleTime: 600000,
    retry: 1,
  });
  useEffect(() => {
    if (serviceConfig.data)
      save(`safe-service-config-v2:${settings.chainId}`, serviceConfig.data);
  }, [serviceConfig.data, settings.chainId]);
  const apiUrl = configuredApi || serviceConfig.data || "";
  const api = new SafeTransactionApi(apiUrl);
  const info = useQuery({
    queryKey: ["safe", settings, safe],
    queryFn: () => loadSafe(settings, safe!),
    enabled: !!safe && !legalPage,
    refetchInterval: 15000,
  });
  const assets = useQuery({
    queryKey: ["assets", settings, safe, tokens],
    enabled: !!safe && !legalPage,
    queryFn: async () =>
      Promise.all(
        (tokens[settings.chainId] ?? []).map(async (t) => ({
          ...t,
          balance: await client(settings).readContract({
            address: t.address,
            abi: erc20,
            functionName: "balanceOf",
            args: [safe!],
          }),
        })),
      ),
    refetchInterval: 30000,
  });
  const local = txs.filter(
    (t) =>
      t.chainId === settings.chainId &&
      t.safe.toLowerCase() === safe?.toLowerCase(),
  );
  const fallbackNonce = local
    .filter((t) => !t.isExecuted)
    .reduce((min, t) => Math.min(min, t.nonce), Infinity);
  const queueNonce =
    info.data && !info.error
      ? info.data.nonce
      : Number.isFinite(fallbackNonce)
        ? fallbackNonce
        : info.data?.nonce;
  const queueInfo =
    info.data && queueNonce !== undefined
      ? { ...info.data, nonce: queueNonce }
      : undefined;
  const pending = useQuery({
    queryKey: [
      "pending",
      apiUrl,
      settings.chainId,
      safe,
      queueNonce,
      info.data?.owners,
      info.data?.threshold,
    ],
    queryFn: ({ signal }) =>
      syncPending(apiUrl, safe!, settings.chainId, queueInfo!, txs, signal),
    enabled: !!safe && !!apiUrl && !!queueInfo && !legalPage,
    refetchInterval: 15000,
  });
  useEffect(() => {
    save("settings", settings);
  }, [settings]);
  useEffect(() => {
    save("safes", safes);
    save("selected", selected);
  }, [safes, selected]);
  useEffect(() => save("transactions", txs), [txs]);
  useEffect(() => save("tokens", tokens), [tokens]);
  useEffect(() => {
    if (pending.data) setTxs((prev) => reconcilePending(prev, pending.data));
  }, [pending.data]);
  const queue =
    queueNonce === undefined
      ? []
      : active(local, queueNonce).map((t) => ({
          ...t,
          confirmations: t.confirmations.filter(
            (c) =>
              /^0x[0-9a-fA-F]{130}$/.test(c.signature) &&
              (!info.data ||
                info.data.owners.some(
                  (owner) => owner.toLowerCase() === c.owner.toLowerCase(),
                )),
          ),
        }));
  useEffect(() => {
    if (!detail) return;
    const latest = txs.find(
      (t) =>
        t.chainId === detail.chainId &&
        t.safe.toLowerCase() === detail.safe.toLowerCase() &&
        t.safeTxHash.toLowerCase() === detail.safeTxHash.toLowerCase(),
    );
    if (latest && JSON.stringify(latest) !== JSON.stringify(detail))
      setDetail(latest);
  }, [txs, detail]);
  const provider = () => {
    if (!window.ethereum) throw Error(translateMessage("ui.46df229ac9"));
    return window.ethereum;
  };
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setNotice(undefined);
    try {
      await fn();
    } catch (e) {
      setNotice({
        text:
          e instanceof Error ? e.message : translateMessage("ui.0c3b4cf7aa"),
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }
  function success(text: string) {
    setNotice({ text, error: false });
    setNotifications((prev) => [text, ...prev].slice(0, 10));
  }
  async function connect() {
    const { account } = await wallet(provider(), settings);
    setAccount(account);
    success(translateMessage("ui.f3a0c2c3c4"));
  }
  async function refresh() {
    const results = await Promise.all([
      info.refetch(),
      assets.refetch(),
      ...(apiUrl ? [pending.refetch()] : [serviceConfig.refetch()]),
      queryClient.invalidateQueries({
        queryKey: ["app-history", settings.chainId, safe?.toLowerCase()],
      }),
    ]);
    for (const result of results) {
      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
      )
        throw result.error;
    }
    success(translateMessage("ui.c936834cba"));
  }
  function update(t: Tx) {
    setTxs((prev) => mergeTxs(prev, [t]));
    setDetail(t);
  }
  function switchChain(id: number) {
    const c = chains.find((c) => c.id === id)!;
    save(`network:${settings.chainId}`, settings);
    setSettings(
      read<Settings>(`network:${id}`, {
        ...defaults,
        chainId: id,
        rpc: c.rpcUrls.default.http[0],
        api: "",
      }),
    );
    setSelected("");
    setDetail(undefined);
  }
  async function importSafe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const a = address(String(f.get("address")));
      await loadSafe(settings, a);
      const entry = {
        address: a,
        chainId: settings.chainId,
        name: String(f.get("name") || translateMessage("ui.c32129fc1b")),
      };
      setSafes((prev) => [
        ...prev.filter(
          (s) => s.address !== a || s.chainId !== settings.chainId,
        ),
        entry,
      ]);
      setSelected(a);
      setModal("");
      success(translateMessage("ui.a74c7888b7"));
      navigate("/assets");
    });
  }
  async function propose(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      if (!safe) throw Error(translateMessage("ui.fce40a76bd"));
      if (!apiUrl) throw Error(translateMessage("ui.0a4e55bc92"));
      const latest = await loadSafe(settings, safe);
      const to = address(String(f.get("to")));
      const token = (tokens[settings.chainId] ?? []).find(
        (t) => t.address === f.get("token"),
      );
      const value = parseUnits(String(f.get("amount")), token?.decimals ?? 18);
      if (value <= 0n) throw Error(translateMessage("ui.6c78ebb573"));
      const balance = token
        ? await client(settings).readContract({
            address: token.address,
            abi: erc20,
            functionName: "balanceOf",
            args: [safe],
          })
        : latest.balance;
      if (value > balance) throw Error(translateMessage("ui.2a6db24f61"));
      // Refresh service proposals before deciding the nonce, as on another device
      // an owner may have just submitted a competing or queued transaction.
      const remotePending = await api.list(
        safe,
        settings.chainId,
        latest.nonce,
      );
      const scopedLocal = txs.filter(
        (t) =>
          t.chainId === settings.chainId &&
          t.safe.toLowerCase() === safe.toLowerCase(),
      );
      const resolved = await resolveProposalNonce(
        latest.nonce,
        Number(f.get("nonce")),
        mergeTxs(scopedLocal, remotePending),
        latest.owners.some(
          (owner) => owner.toLowerCase() === account?.toLowerCase(),
        ),
        (conflict) =>
          new Promise((resolve) => {
            setBusy(false);
            setNonceConflict({ ...conflict, resolve });
          }),
      );
      if (!resolved) return;
      setBusy(true);
      const nonce = resolved.nonce;
      // The nonce may have advanced while the conflict dialog was open.
      if (resolved.policy !== "direct") {
        const refreshed = await loadSafe(settings, safe);
        if (nonce < refreshed.nonce)
          throw Error(translateMessage("ui.8df0b247d7"));
      }
      const t = draft(
        settings,
        safe,
        token?.address ?? to,
        token ? "0" : value.toString(),
        token
          ? encodeFunctionData({
              abi: erc20,
              functionName: "transfer",
              args: [to, value],
            })
          : "0x",
        nonce,
      );
      await verify(settings, t);
      const signing = f.get("proposal-signing") === "sign";
      const confirmation = signing
        ? await sign(provider(), settings, t)
        : undefined;
      const proposer = confirmation?.owner ?? latest.owners[0];
      if (!proposer) throw Error(translateMessage("ui.5ab571873f"));
      const remote = await submitProposal(
        api,
        t,
        proposer,
        (remote) => verify(settings, remote),
        confirmation?.signature,
      );
      if (resolved.policy === "replace") {
        setTxs((prev) =>
          mergeTxs(
            prev.filter(
              (row) =>
                !(
                  row.chainId === t.chainId &&
                  row.safe.toLowerCase() === t.safe.toLowerCase() &&
                  row.nonce === nonce &&
                  !row.isExecuted
                ),
            ),
            [remote],
          ),
        );
        setDetail(remote);
      } else update(remote);
      void queryClient.invalidateQueries({ queryKey: ["pending"] });
      setModal("");
      navigate("/transactions");
      success(translateMessage("ui.c4433ee85c"));
    });
  }
  async function signTx(t: Tx) {
    await run(async () => {
      if (!apiUrl) throw Error(translateMessage("ui.c8ad80ff22"));
      let source = t;
      if (apiUrl) {
        source = normalize(
          await api.request(`/api/v2/multisig-transactions/${t.safeTxHash}/`),
          t.safe,
        );
        if (source.safeTxHash.toLowerCase() !== t.safeTxHash.toLowerCase())
          throw Error(translateMessage("ui.76c66a5a29"));
      }
      const confirmation = await sign(provider(), settings, source);
      await api.confirm(source, confirmation.signature);
      const remote = normalize(
        await api.request(
          `/api/v2/multisig-transactions/${source.safeTxHash}/`,
        ),
        source.safe,
      );
      if (remote.safeTxHash.toLowerCase() !== source.safeTxHash.toLowerCase())
        throw Error(translateMessage("ui.76c66a5a29"));
      await verify(settings, remote);
      if (
        !remote.confirmations.some(
          (c) => c.owner.toLowerCase() === confirmation.owner.toLowerCase(),
        )
      )
        throw Error(translateMessage("ui.33f75e1718"));
      update(remote);
      void queryClient.invalidateQueries({ queryKey: ["pending"] });
      success(translateMessage("ui.3ba7da74d4"));
    });
  }
  function normalize(raw: unknown, a: Address): Tx {
    return normalizeTx(raw, a, settings.chainId);
  }
  async function fetchShared(hash: string, a: Address) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
      throw Error(translateMessage("ui.1adc0afa3c"));
    if (!apiUrl) throw Error(translateMessage("ui.e4facbd49e"));
    const t = normalize(
      await api.request(`/api/v2/multisig-transactions/${hash}/`),
      a,
    );
    if (t.safeTxHash.toLowerCase() !== hash.toLowerCase())
      throw Error(translateMessage("ui.2cf00b0d1b"));
    await verify(settings, t);
    if (t.safe.toLowerCase() !== a.toLowerCase())
      throw Error(translateMessage("ui.fe328f72ae"));
    await loadSafe(settings, a);
    setSafes((prev) =>
      prev.some((s) => s.address === a && s.chainId === settings.chainId)
        ? prev
        : [
            ...prev,
            {
              address: a,
              chainId: settings.chainId,
              name: translateMessage("ui.c0aaba759c"),
            },
          ],
    );
    setSelected(a);
    update(t);
    navigate("/transactions");
  }
  useEffect(() => {
    const embedded = new URLSearchParams(location.hash.slice(1)).get("share");
    if (embedded) {
      let cancelled = false;
      void (async () => {
        try {
          const shared = await parseShare(embedded);
          if (cancelled) return;
          const chainId = Number(shared.chainid);
          if (chainId !== settings.chainId) {
            if (!chains.some((chain) => chain.id === chainId))
              throw Error(translateMessage("ui.4c26392ce5"));
            switchChain(chainId);
            return;
          }
          if (apiUrl)
            await run(() =>
              fetchShared(shared.safeTxHash, address(shared.safeAddress)),
            );
        } catch (error) {
          if (!cancelled)
            setNotice({
              text:
                error instanceof Error
                  ? error.message
                  : translateMessage("ui.4dadc1d29a"),
              error: true,
            });
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    // Keep existing locator links readable; new links always include the App envelope.
    const p = new URLSearchParams(location.search);
    const a = p.get("safe"),
      hash = p.get("tx"),
      id = p.get("chain");
    if (a && hash && Number(id) === settings.chainId && apiUrl)
      void run(() => fetchShared(hash, address(a)));
  }, [apiUrl, settings.chainId, location.hash, location.search]);
  async function shareData(t: Tx) {
    const chain = chains.find((c) => c.id === t.chainId);
    if (!chain) throw Error(translateMessage("ui.8d2416706b"));
    const settingsForTx = { ...settings, chainId: t.chainId };
    const safeInfo = await loadSafe(settingsForTx, t.safe);
    let token = tokens[t.chainId]?.find(
      (token) => token.address.toLowerCase() === t.to.toLowerCase(),
    );
    if (t.data !== "0x" && !token) {
      const c = client(settingsForTx);
      const [symbol, decimals] = await Promise.all([
        c.readContract({ address: t.to, abi: erc20, functionName: "symbol" }),
        c.readContract({ address: t.to, abi: erc20, functionName: "decimals" }),
      ]);
      token = { address: t.to, symbol, decimals };
    }
    return appShare(t, safeInfo, chain.nativeCurrency.symbol, token);
  }
  async function download(t: Tx) {
    const envelope = await shareData(t);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(JSON.parse(envelope), null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `safe-${t.nonce}-${t.safeTxHash.slice(2, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success(translateMessage("ui.e8e6c604fb"));
  }
  const amount = (t: Tx) => {
    if (t.data === "0x")
      return `${formatUnits(BigInt(t.value), 18)} ${chain.nativeCurrency.symbol}`;
    try {
      const decoded = decodeFunctionData({ abi: erc20, data: t.data });
      if (decoded.functionName === "transfer") {
        const token = tokens[settings.chainId]?.find(
          (a) => a.address.toLowerCase() === t.to.toLowerCase(),
        );
        return token
          ? `${formatUnits(decoded.args[1], token.decimals)} ${token.symbol}`
          : translateMessage("ui.dc661669ad");
      }
    } catch {}
    return translateMessage("ui.a3fb14ae71");
  };
  const showSidebar = !!safe && !accountView && !onboarding && !legalPage;
  const nav = [
    { path: "assets", label: translateMessage("ui.5f45bb826b"), icon: Wallet },
    {
      path: "transactions",
      label: translateMessage("ui.919ddbbd91"),
      icon: Layers,
    },
    { path: "owners", label: translateMessage("ui.c6be121342"), icon: Users },
    {
      path: "settings",
      label: translateMessage("ui.df3d58c7d8"),
      icon: Settings2,
    },
  ];
  return (
    <div
      className={
        "app " +
        (showSidebar ? "wallet-layout" : "full-layout") +
        (mobileMenuOpen ? " menu-open" : "")
      }
    >
      {showSidebar && mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label={translateMessage("ui.ec2037381d")}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {showSidebar && (
        <aside className="safe-sidebar">
          <button
            className="sidebar-close icon"
            aria-label={translateMessage("ui.bb0b6e36b3")}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
          <NavLink
            className="sidebar-home"
            to="/accounts"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img src="/images/brand-logo.png" alt="8379" />
            {translateMessage("ui.203c08e0d4")}
          </NavLink>
          <div className="sidebar-section-label">
            {translateMessage("ui.061246bd31")}
          </div>
          <button
            className="sidebar-account"
            onClick={() => navigate("/accounts")}
          >
            <span className="identicon" />
            <span>
              {current?.name}
              <small>{short(safe!)}</small>
            </span>
            <ChevronDown size={14} />
          </button>
          <button
            className="new-tx"
            onClick={() => {
              setMobileMenuOpen(false);
              setModal("transfer");
            }}
          >
            <Plus size={18} />
            {translateMessage("ui.9c7bd5077f")}
          </button>
          <nav onClick={() => setMobileMenuOpen(false)}>
            {nav.map((n) => (
              <NavLink
                key={n.path}
                to={"/" + n.path}
                className={
                  page === n.path ||
                  (n.path === "transactions" && page === "history")
                    ? "active"
                    : ""
                }
              >
                <n.icon size={18} />
                {n.label}
                {n.path === "transactions" && queue.length > 0 && (
                  <b className="count">{queue.length}</b>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="text-btn" onClick={() => navigate("/accounts")}>
              {translateMessage("ui.c0cb3111c8")}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </aside>
      )}
      <div className="workspace">
        {!legalPage && (
          <Topbar
            languageDisabled={
              !!modal || !!detail || !!nonceConflict || onboardingBusy
            }
            settings={settings}
            onMenu={() => setMobileMenuOpen(true)}
            busy={busy}
            account={account}
            safe={showSidebar ? safe : undefined}
            safeName={current?.name}
            onConnect={() => void run(connect)}
            onDisconnect={() => {
              disconnect();
              success(translateMessage("ui.a32c196384"));
            }}
            onChain={switchChain}
            onCopy={(text) =>
              void run(async () => {
                await navigator.clipboard.writeText(text);
                success(translateMessage("ui.af07341568"));
              })
            }
            onSelectSafe={() => navigate("/accounts")}
            notifications={notifications}
          />
        )}
        <main
          className={
            legalPage
              ? legalPage === "transfer"
                ? "transfer-main"
                : "legal-main"
              : accountView
                ? "accounts-main"
                : onboarding
                  ? "onboarding-main"
                  : "wallet-main"
          }
        >
          {!accountView && !onboarding && !legalPage && (
            <div className="page-title">
              <div>
                <div className="page-nav">
                  {page === "assets" ? (
                    <span className="current">
                      {translateMessage("ui.4a07881d15")}
                    </span>
                  ) : ["transactions", "history"].includes(page) ? (
                    <>
                      <NavLink
                        className={page === "transactions" ? "current" : ""}
                        to="/transactions"
                      >
                        {translateMessage("ui.e842a0ad32")}{" "}
                        {queue.length > 0 && (
                          <span className="tab-count">{queue.length}</span>
                        )}
                      </NavLink>
                      <NavLink
                        className={page === "history" ? "current" : ""}
                        to="/history"
                      >
                        {translateMessage("ui.b0385cfe4b")}
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        className={page === "owners" ? "current" : ""}
                        to="/owners"
                      >
                        {translateMessage("ui.601c5f1e2d")}
                      </NavLink>
                      <NavLink
                        className={page === "settings" ? "current" : ""}
                        to="/settings"
                      >
                        {translateMessage("ui.ae27b474ea")}
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
              <button
                className="secondary refresh-button"
                disabled={!safe || busy}
                onClick={() => void run(refresh)}
              >
                <RefreshCw size={16} />
                {translateMessage("ui.aee8874341")}
              </button>
            </div>
          )}
          <ToastNotice
            message={notice?.text}
            error={notice?.error ?? false}
            eventKey={notice}
          />
          <ToastNotice
            message={
              showSidebar ? (info.error ?? pending.error)?.message : undefined
            }
          />
          {legalPage ? (
            <LegalPage type={legalPage} />
          ) : accountView ? (
            <AccountsPage
              safes={safes}
              account={account}
              busy={busy}
              onConnect={() => void run(connect)}
              onAdd={() => navigate("/new-safe/load")}
              onCreate={() => navigate("/new-safe/create")}
              onImport={() => {
                setImportedAccounts([]);
                setImportFileName("");
                setNotice(undefined);
                setModal("data-import");
              }}
              onRemove={(entry) => {
                setSafes((prev) =>
                  prev.filter(
                    (s) =>
                      s.chainId !== entry.chainId ||
                      s.address.toLowerCase() !== entry.address.toLowerCase(),
                  ),
                );
                if (
                  settings.chainId === entry.chainId &&
                  selected.toLowerCase() === entry.address.toLowerCase()
                ) {
                  setSelected("");
                  setDetail(undefined);
                }
                success(translateMessage("ui.44822642ef"));
              }}
              onOpen={(entry) => {
                if (settings.chainId !== entry.chainId)
                  switchChain(entry.chainId);
                setSelected(entry.address);
                setDetail(undefined);
                navigate("/assets");
              }}
            />
          ) : onboarding ? (
            location.pathname.endsWith("/create") ? (
              <CreateSafePage
                onBusyChange={setOnboardingBusy}
                onConnected={setAccount}
                onNetworkChange={switchChain}
                settings={settings}
                account={account}
                provider={provider}
                onCreated={(a, name) => {
                  setSafes((prev) => [
                    ...prev,
                    { address: a, chainId: settings.chainId, name },
                  ]);
                  setSelected(a);
                  navigate("/assets");
                  success(translateMessage("ui.488a8cc6fc"));
                }}
              />
            ) : (
              <ImportSafePage
                onBusyChange={setOnboardingBusy}
                settings={settings}
                onNetworkChange={switchChain}
                onImported={(a, name) => {
                  setSafes((prev) => [
                    ...prev.filter(
                      (s) =>
                        s.chainId !== settings.chainId ||
                        s.address.toLowerCase() !== a.toLowerCase(),
                    ),
                    { address: a, chainId: settings.chainId, name },
                  ]);
                  setSelected(a);
                  navigate("/assets");
                  success(translateMessage("ui.a74c7888b7"));
                }}
              />
            )
          ) : (
            <>
              {page === "assets" && (
                <>
                  <section className="balance-card">
                    <div>
                      <span className="muted">
                        {translateMessage("ui.ae894ae4c0")}
                      </span>
                      <h2>
                        {info.isPending
                          ? "…"
                          : formatUnits(info.data?.balance ?? 0n, 18)}{" "}
                        <span>{chain.nativeCurrency.symbol}</span>
                      </h2>
                      <div className="address-line">
                        <span className="mini-avatar" />
                        {short(safe ?? "")}
                        <button
                          className="icon"
                          aria-label={translateMessage("ui.9cbc6f6e12")}
                          onClick={() =>
                            void run(async () => {
                              await navigator.clipboard.writeText(safe!);
                              success(translateMessage("ui.af07341568"));
                            })
                          }
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={`${chain.blockExplorers?.default.url}/address/${safe}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={translateMessage("ui.05c9119d45")}
                        >
                          <ExternalLink size={13} />
                        </a>
                        <span className="pill">
                          {info.data?.threshold ?? "—"} /{" "}
                          {info.data?.owners.length ?? "—"}
                          {translateMessage("ui.912d579bb9")}
                        </span>
                      </div>
                    </div>
                    <div className="balance-actions">
                      <button
                        className="primary"
                        onClick={() => setModal("transfer")}
                      >
                        <ArrowUpRight size={17} />
                        {translateMessage("ui.edecf0ae6e")}
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setModal("receive")}
                      >
                        <ArrowDownLeft size={17} />
                        {translateMessage("ui.6e68458688")}
                      </button>
                    </div>
                  </section>
                  <div className="section-heading">
                    <div className="tabs">
                      <button className="selected">
                        {translateMessage("ui.4a07881d15")}{" "}
                        <span>
                          {1 + (tokens[settings.chainId]?.length ?? 0)}
                        </span>
                      </button>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setModal("token")}
                    >
                      <Plus size={15} />
                      {translateMessage("ui.a5f1e78cb7")}
                    </button>
                  </div>
                  <section className="table-card">
                    <div className="table-row table-head">
                      <span>{translateMessage("ui.5f45bb826b")}</span>
                      <span>{translateMessage("ui.dc569f3d8d")}</span>
                      <span />
                    </div>
                    <div className="table-row">
                      <div className="asset-name">
                        <span className="coin">
                          {chain.nativeCurrency.symbol.slice(0, 1)}
                        </span>
                        <div>
                          <strong>{chain.nativeCurrency.name}</strong>
                          <small>{chain.nativeCurrency.symbol}</small>
                        </div>
                      </div>
                      <strong>
                        {formatUnits(info.data?.balance ?? 0n, 18)}
                      </strong>
                      <button
                        className="icon"
                        aria-label={translateMessage("ui.4c3be7e0b7")}
                        onClick={() => setModal("transfer")}
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </div>
                    {assets.data?.map((t) => (
                      <div className="table-row" key={t.address}>
                        <div className="asset-name">
                          <span className="coin token">
                            {t.symbol.slice(0, 1)}
                          </span>
                          <div>
                            <strong>{t.symbol}</strong>
                            <small>{short(t.address)}</small>
                          </div>
                        </div>
                        <strong>{formatUnits(t.balance, t.decimals)}</strong>
                        <button
                          className="icon"
                          onClick={() => setModal("transfer")}
                          aria-label={translateMessage("ui.0b13a3e395", {
                            p0: t.symbol,
                          })}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </div>
                    ))}
                    <ToastNotice
                      message={
                        assets.error
                          ? translateMessage("ui.1e0a4636da", {
                              p0: assets.error.message,
                            })
                          : undefined
                      }
                    />
                  </section>
                </>
              )}
              {page === "transactions" && (
                <>
                  <div className="section-heading">
                    <div className="tabs">
                      <button className="selected">
                        {translateMessage("ui.8930f1744c")}
                        <span>{queue.length}</span>
                      </button>
                    </div>
                    <div className="row">
                      <button
                        className="text-btn"
                        onClick={() => setModal("shared")}
                      >
                        <Download size={15} />
                        {translateMessage("ui.89e3d6e4f7")}
                      </button>
                      <button
                        className="primary"
                        onClick={() => setModal("transfer")}
                      >
                        <Plus size={15} />
                        {translateMessage("ui.ea7967e72a")}
                      </button>
                    </div>
                  </div>
                  {serviceConfig.isFetching && !apiUrl && (
                    <div className="notice">
                      {translateMessage("ui.a104b8debb")}
                    </div>
                  )}
                  <ToastNotice
                    message={!apiUrl ? serviceConfig.error?.message : undefined}
                    action={{
                      label: translateMessage("ui.b8784c8dd5"),
                      run: () => serviceConfig.refetch(),
                    }}
                  />
                  <ToastNotice
                    message={
                      pending.data?.warnings.length
                        ? translateMessage("ui.dbf3105db5", {
                            p0: pending.data.warnings[0],
                          })
                        : undefined
                    }
                  />
                  <section className="table-card">
                    {queue.length === 0 ? (
                      <div className="empty">
                        <Layers size={34} />
                        <h3>
                          {serviceConfig.isFetching || pending.isFetching
                            ? translateMessage("ui.2d8227a3de")
                            : pending.error || (!apiUrl && serviceConfig.error)
                              ? translateMessage("ui.bc3e1db4b9")
                              : translateMessage("ui.649273e1b0")}
                        </h3>
                        <p>
                          {pending.error || (!apiUrl && serviceConfig.error)
                            ? translateMessage("ui.40b68e7f23")
                            : translateMessage("ui.16c01ce94f")}
                        </p>
                        <NavLink className="secondary" to="/history">
                          {translateMessage("ui.d0eb8f7a5a")}
                        </NavLink>
                        <button
                          className="secondary"
                          onClick={() => setModal("transfer")}
                        >
                          {translateMessage("ui.bede8fe800")}
                        </button>
                      </div>
                    ) : (
                      queue.map((t) => (
                        <button
                          className="tx-row"
                          key={t.safeTxHash}
                          onClick={() => setDetail(t)}
                        >
                          <span className="nonce">#{t.nonce}</span>
                          <span className="tx-icon">
                            <ArrowUpRight size={20} />
                          </span>
                          <div className="tx-name">
                            <strong>{amount(t)}</strong>
                            <small>
                              {decodeTransfer(t)
                                ? translateMessage("ui.f482cb6fc7")
                                : translateMessage("ui.5cd77f4f73")}{" "}
                              {short(decodeTransfer(t)?.recipient ?? t.to)} ·{" "}
                              {formatDate(t.createdAt)}
                            </small>
                          </div>
                          <span className="pill">
                            {t.nonce === queueNonce
                              ? translateMessage("ui.3eb66266b4")
                              : translateMessage("ui.d6f766f2ad")}
                          </span>
                          <span className="sig-count">
                            <Users size={15} />
                            {
                              new Set(
                                t.confirmations.map((c) =>
                                  c.owner.toLowerCase(),
                                ),
                              ).size
                            }{" "}
                            / {info.data?.threshold}
                          </span>
                          <ArrowRight size={17} />
                        </button>
                      ))
                    )}
                  </section>
                  <p className="footnote">
                    {translateMessage("ui.edf9fe9100")}
                  </p>
                </>
              )}
              {page === "owners" && (
                <OwnersPage
                  info={info.data}
                  account={account}
                  explorer={chain.blockExplorers?.default.url}
                  onCopy={(a) =>
                    void run(async () => {
                      await navigator.clipboard.writeText(a);
                      success(translateMessage("ui.af07341568"));
                    })
                  }
                />
              )}
              {page === "history" && safe && (
                <HistoryPanel
                  key={`${settings.chainId}:${safe}`}
                  settings={settings}
                  safe={safe}
                  tokens={tokens[settings.chainId] ?? []}
                />
              )}
              {page === "settings" && (
                <section className="settings-card">
                  {safe && (
                    <>
                      <h3>{translateMessage("ui.7cf1a54939")}</h3>
                      <p className="muted">
                        {translateMessage("ui.273fa109f1")}
                      </p>
                      <button
                        className="secondary"
                        onClick={() => {
                          setSafes((prev) =>
                            prev.filter(
                              (s) =>
                                s.address !== safe ||
                                s.chainId !== settings.chainId,
                            ),
                          );
                          setSelected("");
                          setDetail(undefined);
                          success(translateMessage("ui.183386af1c"));
                        }}
                      >
                        {translateMessage("ui.fd77336c6d")}
                      </button>
                    </>
                  )}
                  <hr />
                  <h3>{translateMessage("ui.289ddfd345")}</h3>
                  <p className="muted">{translateMessage("ui.c20c42da56")}</p>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const data = await loadAppAssets(settings.chainId);
                        setTokens((prev) => ({
                          ...prev,
                          [settings.chainId]: [
                            ...new Map(
                              [
                                ...(prev[settings.chainId] ?? []),
                                ...data.tokens,
                              ].map((t) => [t.address.toLowerCase(), t]),
                            ).values(),
                          ],
                        }));
                        success(
                          translateMessage("ui.efd4ad3bbc", {
                            p0: data.tokens.length,
                          }),
                        );
                      })
                    }
                  >
                    {translateMessage("ui.d76e5efa78")}
                  </button>
                  <hr />
                  <h3>{translateMessage("ui.8be00c431b")}</h3>
                  <p className="muted">{translateMessage("ui.e75a20514c")}</p>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const all = await fetchSafeRegistry();
                        const config = all[`evm_${settings.chainId}`];
                        if (!config?.api_url)
                          throw Error(translateMessage("ui.d126eee3e3"));
                        setSettings({ ...settings, api: config.api_url });
                        success(translateMessage("ui.bc24d2b6ba"));
                      })
                    }
                  >
                    {translateMessage("ui.31221d7cdb")}
                  </button>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      {modal === "data-import" && (
        <Modal
          title={translateMessage("ui.a9774160c5")}
          notice={notice}
          close={() => setModal("")}
        >
          <p className="muted">{translateMessage("ui.5f06e504b9")}</p>
          <label className="file-drop">
            <Upload size={28} />
            <span>{importFileName || translateMessage("ui.405a583fb0")}</span>
            <input
              aria-label={translateMessage("ui.57e9f436f7")}
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  void run(async () => {
                    setImportedAccounts([]);
                    setImportFileName(file.name);
                    setImportedAccounts(parseAccountData(await file.text()));
                  });
              }}
            />
          </label>
          {importedAccounts.length > 0 && (
            <div className="import-summary">
              {translateMessage("account.recognized", {
                count: importedAccounts.length,
              })}
              {importedAccounts.map((entry) => (
                <p key={entry.chainId + entry.address}>
                  {entry.name} · {short(entry.address)}
                </p>
              ))}
            </div>
          )}
          <div className="modal-actions">
            <button className="secondary" onClick={() => setModal("")}>
              {translateMessage("ui.2cd0f3be87")}
            </button>
            <button
              className="primary"
              disabled={!importedAccounts.length || busy}
              onClick={() => {
                setSafes((prev) => [
                  ...new Map(
                    [...prev, ...importedAccounts].map((entry) => [
                      `${entry.chainId}:${entry.address.toLowerCase()}`,
                      entry,
                    ]),
                  ).values(),
                ]);
                setModal("");
                success(
                  translateMessage("ui.abce417b77", {
                    p0: importedAccounts.length,
                  }),
                );
                navigate("/accounts");
              }}
            >
              {translateMessage("ui.576d81bb06")}
            </button>
          </div>
        </Modal>
      )}
      {modal === "import" && (
        <Modal
          notice={notice}
          title={translateMessage("ui.a9ffe7e111")}
          close={() => setModal("")}
        >
          <p className="muted">{translateMessage("ui.00530d35ad")}</p>
          <form onSubmit={importSafe}>
            <label>
              {translateMessage("ui.405d9b75fd")}
              <input
                name="name"
                placeholder={translateMessage("ui.1f8bd4cca2")}
                maxLength={40}
              />
            </label>
            <label>
              {translateMessage("ui.f68959e14a")}
              <input required name="address" placeholder="0x…" autoFocus />
            </label>
            <div className="notice">
              {translateMessage("account.networkNotice", {
                network: chain.name,
              })}
            </div>
            <button className="primary full" disabled={busy}>
              {busy
                ? translateMessage("ui.73b61288ee")
                : translateMessage("ui.830a0edcea")}
            </button>
          </form>
        </Modal>
      )}
      {modal === "transfer" && info.data && (
        <Modal
          notice={notice}
          title={translateMessage("ui.f3a583b593")}
          close={() => setModal("")}
        >
          <form onSubmit={propose}>
            <label>
              {translateMessage("ui.8132d6aece")}
              <Select name="token">
                <option value="">
                  {chain.nativeCurrency.symbol}
                  {translateMessage("ui.82fb202c99")}
                </option>
                {tokens[settings.chainId]?.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.symbol}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              {translateMessage("ui.5ee277d217")}
              <input required name="to" placeholder="0x…" />
            </label>
            <label>
              {translateMessage("ui.5e29d121dd")}
              <input
                required
                name="amount"
                placeholder="0.00"
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]+)?"
              />
            </label>
            <label>
              {translateMessage("ui.dad6ca5c6b")}
              <input
                required
                name="nonce"
                type="number"
                min={info.data.nonce}
                defaultValue={info.data.nonce}
              />
            </label>
            <label>
              {translateMessage("ui.79aa9113d7")}
              <Select name="proposal-signing" defaultValue="sign">
                <option value="unsigned">
                  {translateMessage("ui.278bceedd7")}
                </option>
                <option value="sign">
                  {translateMessage("ui.127e7f82ca")}
                </option>
              </Select>
            </label>
            <div className="notice">
              {translateMessage("transfer.proposalNotice", {
                count: info.data.threshold,
              })}
            </div>
            <button className="primary full" disabled={busy}>
              {translateMessage("ui.2f266ec004")}
            </button>
          </form>
        </Modal>
      )}
      {nonceConflict && (
        <NonceConflictDialog
          nonce={nonceConflict.nonce}
          queueNonce={nonceConflict.queueNonce}
          canReplace={nonceConflict.canReplace}
          onChoose={(policy) => {
            const conflict = nonceConflict;
            setNonceConflict(undefined);
            conflict.resolve(policy);
          }}
        />
      )}
      {modal === "receive" && safe && (
        <Modal
          notice={notice}
          title={translateMessage("ui.9c6d678b9b")}
          close={() => setModal("")}
        >
          <div className="qr">
            <QRCodeSVG value={safe} size={190} />
          </div>
          <p className="center">
            {translateMessage("receive.network", { network: chain.name })}
          </p>
          <code className="break">{safe}</code>
          <button
            className="primary full"
            onClick={() =>
              void run(async () => {
                await navigator.clipboard.writeText(safe);
                success(translateMessage("ui.af07341568"));
              })
            }
          >
            {translateMessage("ui.4c6de01bbe")}
          </button>
        </Modal>
      )}
      {modal === "token" && (
        <Modal
          notice={notice}
          title={translateMessage("ui.0463738afc")}
          close={() => setModal("")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(async () => {
                const a = address(String(f.get("token")));
                const c = client(settings);
                const [symbol, decimals] = await Promise.all([
                  c.readContract({
                    address: a,
                    abi: erc20,
                    functionName: "symbol",
                  }),
                  c.readContract({
                    address: a,
                    abi: erc20,
                    functionName: "decimals",
                  }),
                ]);
                setTokens((prev) => ({
                  ...prev,
                  [settings.chainId]: [
                    ...(prev[settings.chainId] ?? []).filter(
                      (t) => t.address !== a,
                    ),
                    { address: a, symbol, decimals },
                  ],
                }));
                setModal("");
                success(translateMessage("ui.a75dc61513"));
              });
            }}
          >
            <label>
              {translateMessage("ui.99f9b15436")}
              <input name="token" required placeholder="0x…" />
            </label>
            <p className="muted">{translateMessage("ui.3aa703f18e")}</p>
            <button className="primary full" disabled={busy}>
              {translateMessage("ui.8f00281849")}
            </button>
          </form>
        </Modal>
      )}
      {modal === "shared" && (
        <Modal
          notice={notice}
          title={translateMessage("ui.298659a69d")}
          close={() => setModal("")}
        >
          <p className="muted">{translateMessage("ui.edd1d35279")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(async () => {
                const raw = String(f.get("payload"));
                let legacy: Record<string, unknown> | undefined;
                if (raw.trim().startsWith("{")) {
                  const candidate = JSON.parse(raw);
                  if (candidate?.safe && candidate?.chainId && !candidate?.type)
                    legacy = candidate;
                }
                if (legacy) {
                  const t = normalize(legacy, address(String(legacy.safe)));
                  if (!safe || safe.toLowerCase() !== t.safe.toLowerCase())
                    throw Error(translateMessage("ui.9535a6165f"));
                  if (Number(legacy.chainId) !== settings.chainId)
                    throw Error(translateMessage("ui.2cb4b3d12a"));
                  await verify(settings, t);
                  update(t);
                } else {
                  const p = await parseShare(raw);
                  if (Number(p.chainid) !== settings.chainId)
                    throw Error(translateMessage("ui.41a962e4d2"));
                  await fetchShared(p.safeTxHash, address(p.safeAddress));
                }
                setModal("");
                success(translateMessage("ui.95c8edd652"));
              });
            }}
          >
            <label>
              {translateMessage("ui.a520438552")}
              <textarea
                required
                name="payload"
                rows={7}
                placeholder='{"type":"multisig-sign",…}'
              />
            </label>
            <button className="primary full" disabled={busy}>
              {translateMessage("ui.25242601b9")}
            </button>
          </form>
        </Modal>
      )}
      {detail && info.data && (
        <Modal
          notice={notice}
          title={translateMessage("ui.bf477a08d6", { p0: detail.nonce })}
          close={() => {
            setDetail(undefined);
            setShare("");
          }}
        >
          <div className="detail-amount">
            <span className="tx-icon">
              <ArrowUpRight />
            </span>
            <h2>{amount(detail)}</h2>
            <span className="pill">
              {detail.isExecuted
                ? translateMessage("ui.5f4d7cf2c8")
                : translateMessage("ui.a6bf0f672f")}
            </span>
          </div>
          <dl>
            <dt>Safe</dt>
            <dd className="break">{detail.safe}</dd>
            <dt>{translateMessage("ui.1ddfddbd00")}</dt>
            <dd className="break">{detail.to}</dd>
            <dt>{translateMessage("ui.97b31b5d63")}</dt>
            <dd>{chain.name}</dd>
            <dt>Nonce</dt>
            <dd>
              {detail.nonce}
              {translateMessage("ui.956311fa9d")}
              {info.data.nonce}
            </dd>
            <dt>{translateMessage("ui.9037ffd025")}</dt>
            <dd className="break">{detail.safeTxHash}</dd>
            <dt>Call data</dt>
            <dd className="break">{detail.data}</dd>
          </dl>
          <h3>
            {translateMessage("ui.264211bb46")}{" "}
            <span className="muted">
              {detail.confirmations.length} / {info.data.threshold}
            </span>
          </h3>
          <div className="signers">
            {info.data.owners.map((a) => (
              <div key={a}>
                <span className="mini-avatar" />
                <code>{short(a)}</code>
                <span
                  className={
                    detail.confirmations.some(
                      (c) => c.owner.toLowerCase() === a.toLowerCase(),
                    )
                      ? "connected"
                      : "muted"
                  }
                >
                  {detail.confirmations.some(
                    (c) => c.owner.toLowerCase() === a.toLowerCase(),
                  )
                    ? translateMessage("ui.1173fd3c68")
                    : translateMessage("ui.4f3d4ae99f")}
                </span>
              </div>
            ))}
          </div>
          <div className="detail-tools">
            <button
              className="text-btn"
              onClick={() => void run(() => download(detail))}
            >
              <Download size={15} />
              {translateMessage("ui.fb48367b48")}
            </button>
            <button
              className="text-btn"
              onClick={() =>
                void run(async () => {
                  setShare(await shareData(detail));
                })
              }
            >
              <Share2 size={15} />
              {translateMessage("ui.b62a98f081")}
            </button>
            <button
              className="text-btn"
              onClick={() =>
                void run(async () => {
                  const envelope = await shareData(detail);
                  await navigator.clipboard.writeText(
                    appShareLink(envelope, window.location.origin),
                  );
                  success(translateMessage("ui.2f1679fbff"));
                })
              }
            >
              <Copy size={15} />
              {translateMessage("ui.8e86f9b1d5")}
            </button>
          </div>
          {share && (
            <div className="qr">
              <QRCodeSVG value={share} size={210} />
              <button
                className="text-btn"
                onClick={() =>
                  void run(async () => {
                    await navigator.clipboard.writeText(share);
                    success(translateMessage("ui.fc6d09fc14"));
                  })
                }
              >
                {translateMessage("ui.ae71ee5888")}
              </button>
            </div>
          )}
          <div className="modal-actions">
            <button
              className="secondary"
              disabled={busy || detail.isExecuted}
              onClick={() => void signTx(detail)}
            >
              {translateMessage("ui.264211bb46")}
            </button>
            <button
              className="primary"
              disabled={
                busy ||
                detail.isExecuted ||
                detail.nonce !== info.data.nonce ||
                detail.confirmations.length < info.data.threshold
              }
              onClick={() =>
                void run(async () => {
                  let t = detail;
                  if (apiUrl)
                    t = normalize(
                      await api.request(
                        `/api/v2/multisig-transactions/${detail.safeTxHash}/`,
                      ),
                      detail.safe,
                    );
                  if (
                    t.safeTxHash.toLowerCase() !==
                    detail.safeTxHash.toLowerCase()
                  )
                    throw Error(translateMessage("ui.76c66a5a29"));
                  const hash = await execute(provider(), settings, t);
                  update({ ...t, isExecuted: true, transactionHash: hash });
                  await info.refetch();
                  success(translateMessage("ui.be9d4a83b8", { p0: hash }));
                })
              }
            >
              {busy
                ? translateMessage("ui.d3d21191f3")
                : translateMessage("ui.658635d936")}
            </button>
          </div>
          {!detail.isExecuted && (
            <p className="footnote" role="status">
              {detail.nonce !== info.data.nonce
                ? detail.nonce > info.data.nonce
                  ? translateMessage("ui.78dbe5894c", {
                      p0: detail.nonce,
                      p1: info.data.nonce,
                    })
                  : translateMessage("ui.4698ca92af", {
                      p0: info.data.nonce,
                      p1: detail.nonce,
                    })
                : detail.confirmations.length < info.data.threshold
                  ? translateMessage("ui.9f40570e4d", {
                      p0: detail.confirmations.length,
                      p1: info.data.threshold,
                      p2: info.data.threshold - detail.confirmations.length,
                    })
                  : translateMessage("ui.8519281205")}
            </p>
          )}
          <p className="footnote">{translateMessage("ui.7f5a3e7b06")}</p>
        </Modal>
      )}
      {(busy || onboardingBusy) && <GlobalLoading />}
    </div>
  );
}
