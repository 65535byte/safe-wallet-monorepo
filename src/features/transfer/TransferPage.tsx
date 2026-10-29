import { useEffect, useRef, useState } from "react";
import { initializeLanguage } from "../../i18n";

export function transferConfig(search: string) {
  const params = new URLSearchParams(search);
  const icon = params.get("appIcon") || "/images/transfer/app_icon.png";
  const scheme = params.get("openUrl") || "dapp://open?url=";
  return {
    title: params.get("appName") || "title",
    icon: /^(https?:\/\/|\/(?!\/))/i.test(icon)
      ? icon
      : "/images/transfer/app_icon.png",
    // URL parameters can launch an app, but must never execute page scripts.
    scheme:
      /^[a-z][a-z\d+.-]*:/i.test(scheme) &&
      !/^(javascript|data|vbscript|file|blob):/i.test(scheme)
        ? scheme
        : "dapp://open?url=",
  };
}
export function transferEnvironment(nav: {
  userAgent: string;
  standalone?: boolean;
}) {
  return {
    wechat: /micromessenger/i.test(nav.userAgent),
    ios: /iphone|ipad|ipod/i.test(nav.userAgent),
    standalone: nav.standalone === true,
  };
}
export default function TransferPage() {
  const [config] = useState(() => transferConfig(window.location.search));
  const [environment] = useState(() =>
    transferEnvironment(navigator as Navigator & { standalone?: boolean }),
  );
  const launched = useRef(false);
  function launch() {
    if (environment.wechat) return;
    if (environment.ios) window.location.href = config.scheme;
    else {
      const anchor = document.createElement("a");
      anchor.href = config.scheme;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
  }
  useEffect(() => {
    document.title = config.title;
    document.documentElement.lang = "zh-CN";
    const previousIcon = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]',
    );
    const previousHref = previousIcon?.getAttribute("href");
    const icon = previousIcon || document.createElement("link");
    icon.rel = "apple-touch-icon";
    icon.href = config.icon;
    if (!previousIcon) document.head.appendChild(icon);
    if (environment.standalone && !environment.wechat && !launched.current) {
      launched.current = true;
      launch();
    }
    return () => {
      if (!previousIcon) icon.remove();
      else if (previousHref !== null && previousHref !== undefined)
        icon.setAttribute("href", previousHref);
      else icon.removeAttribute("href");
      initializeLanguage();
    };
  }, [config, environment]);
  return (
    <div className="transfer-page">
      {!environment.standalone ? (
        <div className="guide-box">
          <div className="guide-box__title">添加服务到桌面</div>
          <div className="guide-box__bg">
            <img
              className="bg"
              src="/images/transfer/phone.jpg"
              alt="桌面示例"
            />
            <div className="logo">
              <img className="logo-icon" src={config.icon} alt="" />
            </div>
            <div className="text-box">
              <div className="text">{config.title}</div>
            </div>
          </div>
          <div className="step-block">
            <span className="step-label">第一步：</span>
            <span className="step-text">点击底部工具</span>
          </div>
          <img
            className="bottom-icon"
            src="/images/transfer/bottom.jpg"
            alt="底部工具"
          />
          <div className="step-block">
            <span className="step-label">第二步：</span>
            <span className="step-text">
              在弹出框中点击&quot;添加到主屏幕&quot;
            </span>
          </div>
          <img
            className="add-icon"
            src="/images/transfer/add.jpg"
            alt="添加到主屏幕"
          />
        </div>
      ) : (
        <>
          <div className="entry-box">
            <div className="entry-box__title">你即将进入</div>
            <img className="entry-box__icon" src={config.icon} alt="" />
            <div className="entry-box__text">{config.title}</div>
          </div>
          <div className="entry-box__btn">
            <button className="btn" onClick={launch}>
              立即进入
            </button>
          </div>
        </>
      )}
    </div>
  );
}
