import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Select from "../../src/ui/Select";
import GlobalLoading from "../../src/ui/GlobalLoading";
import Modal from "../../src/ui/Modal";
import "../../src/style.css";
function Fixture() {
  const [modal, setModal] = useState(false),
    [result, setResult] = useState(""),
    [refresh, setRefresh] = useState(0),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(
      () => setRefresh((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
  return (
    <main style={{ padding: 32 }}>
      <h1>WebView select compatibility</h1>
      <button onClick={() => setModal(true)}>Open transfer test</button>
      <p role="status">{result}</p>
      {modal && (
        <Modal title="Transfer test" close={() => setModal(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setResult(
                JSON.stringify(
                  Object.fromEntries(new FormData(event.currentTarget)),
                ),
              );
            }}
          >
            <label>
              Asset
              <Select aria-label="Asset" name="token">
                <option value="">tBNB</option>
                <option value="erc20">USDT</option>
              </Select>
            </label>
            <label>
              Signing
              <Select
                aria-label="Signing"
                name="proposal-signing"
                defaultValue="sign"
              >
                <option value="unsigned">Unsigned</option>
                <option value="sign">Sign and submit</option>
              </Select>
            </label>
            <button type="button" onClick={() => setRefresh(refresh + 1)}>
              Refresh parent {refresh}
            </button>
            <button type="submit">Verify form values</button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 15000);
              }}
            >
              Preview global loading
            </button>
          </form>
        </Modal>
      )}
      {loading && <GlobalLoading />}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
