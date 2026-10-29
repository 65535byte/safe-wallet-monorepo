import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HistoryPanel from "../../src/features/transactions/HistoryPanel";
import "../../src/style.css";
const safe = "0x1111111111111111111111111111111111111111";
window.fetch = async () =>
  Response.json({
    result: 0,
    data: [
      {
        hash: `0x${"ab".repeat(32)}`,
        from: "0x4c2788370B4BC60fD4f302f92Afd710adD1605C2",
        to: safe,
        token_value: "0",
        decimal: 18,
        timestamp: 1792933200,
        status: 1,
        block_number: 12345678,
        nonce: 4,
      },
    ],
  });
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={new QueryClient()}>
    <main style={{ padding: 24 }}>
      <HistoryPanel
        settings={{ chainId: 56, rpc: "", api: "", fromBlock: "0" }}
        safe={safe}
      />
    </main>
  </QueryClientProvider>,
);
