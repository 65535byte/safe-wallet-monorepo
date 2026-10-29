import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  History,
  RefreshCw,
} from "lucide-react";
import { chains, short, type Settings } from "../../core";
import { formatDate, translateMessage } from "../../i18n";
import { ToastNotice } from "../../ui/Toast";
import Modal from "../../ui/Modal";
import {
  appHistoryQueryPolicy,
  fetchAppHistory,
  type AppHistoryRecord,
} from "./app-history";
export default function HistoryPanel({
  settings,
  safe,
  tokens = [],
}: {
  settings: Settings;
  safe: string;
  tokens?: { address: string; symbol: string }[];
}) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AppHistoryRecord>();
  const chain = chains.find((c) => c.id === settings.chainId)!;
  const query = useQuery({
    ...appHistoryQueryPolicy,
    queryKey: ["app-history", settings.chainId, safe.toLowerCase(), page],
    queryFn: ({ signal }) =>
      fetchAppHistory(settings.chainId, safe, page, signal),
  });
  const symbol = (row: AppHistoryRecord) =>
    row.token === "native"
      ? chain.nativeCurrency.symbol
      : tokens.find((t) => t.address.toLowerCase() === row.token.toLowerCase())
          ?.symbol ||
        row.symbol ||
        "ERC20";
  const status = (row: AppHistoryRecord) =>
    translateMessage(
      row.status === "success"
        ? "history.success"
        : row.status === "pending"
          ? "history.pending"
          : "history.failed",
    );
  return (
    <>
      <div className="section-heading">
        <h3>{translateMessage("ui.7ccda22544")}</h3>
        <button
          className="secondary"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw size={15} />
          {translateMessage("ui.621e17c543")}
        </button>
      </div>
      <p className="history-account-context">
        {translateMessage("history.accountContext", {
          network: chain.name,
          safe,
        })}
      </p>
      <ToastNotice
        message={query.error?.message}
        eventKey={query.error}
        action={{
          label: translateMessage("ui.b8784c8dd5"),
          run: () => query.refetch(),
        }}
      />
      <section className="table-card">
        {query.data?.records.map((row) => {
          const outgoing = row.from.toLowerCase() === safe.toLowerCase();
          return (
            <button
              className="tx-row"
              key={row.id}
              onClick={() => setSelected(row)}
            >
              <span className="tx-icon">
                {outgoing ? (
                  <ArrowUpRight size={19} />
                ) : (
                  <ArrowDownLeft size={19} />
                )}
              </span>
              <div className="tx-name">
                <strong>
                  {outgoing ? "−" : "+"}
                  {row.amount} {symbol(row)}
                </strong>
                <small>
                  {short(outgoing ? row.to : row.from)} ·{" "}
                  {formatDate(row.timestamp)}
                </small>
              </div>
              <span className="pill">{status(row)}</span>
              <ExternalLink size={16} />
            </button>
          );
        })}
        {!query.data?.records.length && (
          <div className="empty">
            <History size={32} />
            <h3>
              {query.isFetching
                ? translateMessage("history.loading")
                : query.error
                  ? translateMessage("ui.14f647778f")
                  : translateMessage("history.empty")}
            </h3>
          </div>
        )}
      </section>
      <div className="history-pagination">
        <button
          className="secondary"
          disabled={page === 0 || query.isFetching}
          onClick={() => setPage((n) => n - 1)}
        >
          {translateMessage("history.previous")}
        </button>
        <span>{translateMessage("history.page", { page: page + 1 })}</span>
        <button
          className="secondary"
          disabled={!query.data?.hasNext || query.isFetching}
          onClick={() => setPage((n) => n + 1)}
        >
          {translateMessage("history.next")}
        </button>
      </div>
      {selected && (
        <Modal
          className="history-detail-modal"
          title={translateMessage("history.details")}
          close={() => setSelected(undefined)}
        >
          <dl className="history-detail-list">
            {Object.entries({
              [translateMessage("history.status")]: status(selected),
              [translateMessage("ui.97b31b5d63")]: chain.name,
              [translateMessage("history.amount")]:
                `${selected.amount} ${symbol(selected)}`,
              [translateMessage("history.from")]: selected.from,
              [translateMessage("ui.5ee277d217")]: selected.to,
              [translateMessage("ui.cd9bf8cca3")]: selected.hash,
              [translateMessage("history.time")]: formatDate(
                selected.timestamp,
              ),
              [translateMessage("ui.ae60964c61")]: selected.block,
              Nonce: selected.nonce,
            }).map(([label, value]) => (
              <div className="history-detail-field" key={label}>
                <dt>{label}</dt>
                <dd className="break">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {chain.blockExplorers && (
            <a
              className="secondary full"
              href={`${chain.blockExplorers.default.url}/tx/${selected.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              {translateMessage("ui.2a547e0382")}
              <ExternalLink size={16} />
            </a>
          )}
        </Modal>
      )}
    </>
  );
}
