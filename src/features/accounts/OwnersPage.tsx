import { translateMessage } from "../../i18n";
import { read } from "../../storage";
import { Copy, Download, ExternalLink, Info } from "lucide-react";
import type { Address } from "viem";
import type { SafeInfo } from "../../core";
export default function OwnersPage({
  info,
  account,
  explorer,
  onCopy,
}: {
  info?: SafeInfo;
  account?: Address;
  explorer?: string;
  onCopy: (a: Address) => void;
}) {
  const ownerNames = read<Record<string, string>>("safe-owner-names", {});
  function download() {
    const csv =
      translateMessage("account.csv.name") +
      "," +
      translateMessage("account.csv.address") +
      "\n" +
      (info?.owners ?? [])
        .map(
          (a, i) => `${translateMessage("ui.0ae9ae3fa9", { p0: i + 1 })},${a}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "signers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <section className="setup-section">
        <div>
          <h2>
            {translateMessage("ui.53c43532d9")}
            <Info size={16} />
          </h2>
          <p>
            {translateMessage("ui.66459140e0")}
            <strong>{info?.nonce ?? "—"}</strong>
          </p>
        </div>
        <div>
          <h3>{translateMessage("ui.d2a526d55a")}</h3>
          <p>
            {translateMessage("account.version", {
              version: info?.version ?? "—",
            })}
          </p>
        </div>
      </section>
      <section className="setup-section members-section">
        <h2>{translateMessage("ui.6e6d6ddbb7")}</h2>
        <div className="setup-content">
          <h3>{translateMessage("ui.4e2720dcee")}</h3>
          <p>{translateMessage("ui.0ec2a7ed0a")}</p>
          <div className="signer-actions">
            <button className="secondary" onClick={download}>
              <Download size={16} />
              {translateMessage("ui.7ef9073ae4")}
            </button>
          </div>
          <div className="signer-table">
            {info?.owners.map((a, i) => (
              <div className="signer-row" key={a}>
                <span className="identicon" />
                <div className="signer-address">
                  <strong>
                    {ownerNames[a.toLowerCase()] ||
                      translateMessage("ui.0ae9ae3fa9", { p0: i + 1 })}
                  </strong>
                  <code>{a}</code>
                </div>
                <button
                  className="icon"
                  aria-label={translateMessage("ui.7ae608f4c0", { p0: i + 1 })}
                  onClick={() => onCopy(a)}
                >
                  <Copy size={14} />
                </button>
                <a
                  className="icon"
                  href={`${explorer}/address/${a}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={translateMessage("ui.568ba2d5d1", { p0: i + 1 })}
                >
                  <ExternalLink size={14} />
                </a>
                <span
                  className={
                    a.toLowerCase() === account?.toLowerCase()
                      ? "connected"
                      : "muted"
                  }
                >
                  {a.toLowerCase() === account?.toLowerCase()
                    ? translateMessage("ui.5be0323e8a")
                    : translateMessage("ui.3d52574ce1")}
                </span>
              </div>
            ))}
          </div>
        </div>
        <h2 className="required-heading">
          {translateMessage("ui.4dc5ef9aa2")}
        </h2>
        <div className="required-content">
          <p>{translateMessage("ui.1cd4f43b6e")}</p>
          <p>
            <strong>{info?.threshold ?? "—"}</strong> /{" "}
            <strong>{info?.owners.length ?? "—"}</strong>
            {translateMessage("ui.037a7a6cf4")}
          </p>
        </div>
      </section>
    </>
  );
}
