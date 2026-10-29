import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  BookOpen,
  MessageCircle,
  ChevronRight,
  Send,
  Twitter,
  Facebook,
} from "lucide-react";
import { initializeLanguage, systemLanguage } from "../../i18n";
import { notify } from "../../ui/Toast";
import Select from "../../ui/Select";
import helpZh from "./content/help.zh-CN.json";
import helpEn from "./content/help.en.json";
export const communityChannels = [
  {
    name: "Telegram 官方社区",
    english: "Official Telegram community",
    account: "8379官方社区",
    url: "https://t.me/+7PEAEQkXMn8xYzU9",
    icon: Send,
    theme: "tg",
    tip: "实时交流·问题解答",
    enTip: "Live discussions · Questions and answers",
  },
  {
    name: "X (Twitter) 官方账号",
    english: "Official X (Twitter) account",
    account: "8379wallet",
    url: "https://x.com/8379wallet",
    icon: Twitter,
    theme: "x",
    tip: "产品动态·行业资讯",
    enTip: "Product updates · Industry news",
  },
  {
    name: "FaceBook 官方账号",
    english: "Official Facebook account",
    account: "8379wallet",
    url: "https://www.facebook.com/profile.php?id=61587297066759",
    icon: Facebook,
    theme: "facebook",
    tip: "版本更新·重要通知",
    enTip: "Release updates · Important notices",
  },
];
export default function SupportPage({
  type,
}: {
  type: "help" | "service" | "community" | "suggest";
}) {
  const [issue, setIssue] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const en = systemLanguage() === "en";
  const text = (zh: string, english: string) => (en ? english : zh);
  const title =
    type === "suggest"
      ? text("投诉建议", "Feedback and suggestions")
      : type === "help"
        ? text("帮助中心", "Help center")
        : type === "service"
          ? text("联系我们", "Contact us")
          : text("加入我们的社区", "Join our community");
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "zh-CN";
    document.title = `${title} · 8379`;
    window.scrollTo({ top: 0, behavior: "auto" });
    return initializeLanguage;
  }, [title]);
  async function copy(value: string, email = false) {
    try {
      await navigator.clipboard.writeText(value);
      notify({
        text: email
          ? text("邮箱复制成功", "Email copied")
          : text("链接复制成功", "Link copied"),
      });
    } catch {
      notify({
        text: text(
          "复制失败，请手动记录",
          "Copy failed. Please copy the text manually.",
        ),
        error: true,
      });
    }
  }
  const serviceTips = en
    ? [
        "Check the help center first to resolve common questions.",
        "Provide a description, steps to reproduce and device information when contacting support.",
        "For urgent asset-related questions, email us with “Urgent” in the subject.",
        "We do not recover recovery phrases, private keys or assets.",
      ]
    : [
        "咨询前建议先查看「帮助中心」，快速解决常见问题",
        "联系客服时请提供问题描述、操作步骤、设备信息，便于高效处理",
        "资产相关紧急问题请直接发送邮件，并标注「紧急」字样",
        "本平台不提供人工找回助记词/私钥、资产追回服务",
      ];
  const communityTips = en
    ? [
        "All listed channels are officially operated. Do not trust unofficial accounts.",
        "Advertising, scams and abusive content are prohibited. Violators will be removed.",
        "For product questions, ask in the Telegram group first. Staff will respond.",
        "Paste the copied link into the corresponding app to open it. Availability varies by region.",
        "User comments represent individual opinions, not the official position.",
      ]
    : [
        "所有社区渠道均为官方运营，请勿相信非官方账号的信息",
        "社区内禁止发布广告、诈骗、辱骂等违规内容，违者将被踢出",
        "产品使用问题优先在TG群咨询，工作人员会及时回复",
        "复制链接后可在对应APP中粘贴打开，部分渠道需科学上网",
        "社区内的用户发言仅代表个人观点，不代表官方立场",
      ];
  return (
    <article className="legal-page support-page">
      <header className="support-heading">
        <h1>{title}</h1>
        {type === "help" && (
          <p className="faq-subtitle">
            {text("常见问题（FAQ）", "Frequently asked questions (FAQ)")}
          </p>
        )}
        {type === "community" && (
          <p>
            {text(
              "与全球用户交流，获取最新产品动态",
              "Connect with users worldwide and get the latest product updates",
            )}
          </p>
        )}
      </header>
      {type === "suggest" ? (
        <form
          className="support-card support-feedback"
          onSubmit={(event) => {
            event.preventDefault();
            if (!issue || !contact.trim() || description.trim().length < 10) {
              notify({
                text: text(
                  "请选择问题类型、填写联系方式，问题描述不少于10个字",
                  "Select an issue type, enter contact information and describe the issue in at least 10 characters.",
                ),
                error: true,
              });
              return;
            }
            notify({
              text: text(
                "暂未配置反馈提交接口，请发送邮件至 service@8379hk.com",
                "Feedback submission is not configured. Please email service@8379hk.com.",
              ),
              error: true,
            });
          }}
        >
          <p>
            {text(
              "我们重视您的每一条反馈，将持续优化产品体验",
              "We value your feedback and continue to improve the product experience",
            )}
          </p>
          <label>
            {text("问题类型", "Issue type")} *
            <Select value={issue} onValueChange={setIssue}>
              <option value="">
                {text("请选择问题类型", "Select an issue type")}
              </option>
              {(en
                ? [
                    "Functional issue",
                    "Experience improvement",
                    "Account issue",
                    "Asset issue",
                    "Display issue",
                    "Other feedback",
                  ]
                : [
                    "功能故障",
                    "体验优化建议",
                    "账号相关问题",
                    "资产相关问题",
                    "界面显示问题",
                    "其他投诉/建议",
                  ]
              ).map((t) => (
                <option value={t} key={t}>
                  {t}
                </option>
              ))}
            </Select>
          </label>
          <label>
            {text("联系方式", "Contact information")} *
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={text(
                "请输入手机号/邮箱（方便我们回复您）",
                "Phone number or email so we can reply",
              )}
            />
          </label>
          <label>
            {text("问题描述", "Description")} *
            <textarea
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text(
                "请详细描述您遇到的问题或建议，字数不超过500字",
                "Describe your issue or suggestion in up to 500 characters",
              )}
            />
          </label>
          <small>{description.length}/500</small>
          <section className="support-tips">
            <h2>{text("温馨提示", "Helpful reminders")}</h2>
            <p>
              {text(
                "如需紧急处理，可直接发送邮件至：",
                "For urgent assistance, email: ",
              )}
              <a href="mailto:service@8379hk.com">service@8379hk.com</a>
            </p>
          </section>
          <button className="support-submit" type="submit">
            {text("提交反馈", "Submit feedback")}
          </button>
        </form>
      ) : type === "help" ? (
        <div className="support-card faq-list">
          {(en ? helpEn : helpZh).map((faq) => (
            <section className="faq-item" key={faq.question}>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="support-card support-list">
            {type === "community" ? (
              communityChannels.map((c) => (
                <button
                  className="support-row"
                  onClick={() => void copy(c.url)}
                  key={c.url}
                >
                  <span className={`support-icon ${c.theme}`}>
                    <c.icon size={24} />
                  </span>
                  <span className="support-row-content">
                    <strong>{en ? c.english : c.name}</strong>
                    <span>
                      {en && c.theme === "tg"
                        ? "8379 official community"
                        : c.account}
                    </span>
                    <small>
                      {text("点击复制链接", "Click to copy link")} |{" "}
                      {en ? c.enTip : c.tip}
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))
            ) : (
              <>
                <button
                  className="support-row"
                  onClick={() => void copy("service@8379hk.com", true)}
                >
                  <span className="support-icon">
                    <Mail size={24} />
                  </span>
                  <span className="support-row-content">
                    <strong>{text("官方邮箱", "Official email")}</strong>
                    <span>service@8379hk.com</span>
                    <small>
                      {text(
                        "点击复制邮箱 | 24小时内回复",
                        "Click to copy email | Reply within 24 hours",
                      )}
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </button>
                <Link className="support-row" to="/help">
                  <span className="support-icon">
                    <BookOpen size={24} />
                  </span>
                  <span className="support-row-content">
                    <strong>
                      {text("常见问题", "Frequently asked questions")}
                    </strong>
                    <span>
                      {text(
                        "快速解决80%的使用问题",
                        "Quickly resolve 80% of common issues",
                      )}
                    </span>
                    <small>
                      {text("点击进入帮助中心", "Open the help center")}
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </Link>
                <a className="support-row" href="/suggest">
                  <span className="support-icon">
                    <MessageCircle size={24} />
                  </span>
                  <span className="support-row-content">
                    <strong>
                      {text("投诉建议", "Feedback and suggestions")}
                    </strong>
                    <span>
                      {text(
                        "高效处理您的投诉与优化建议",
                        "Share your concerns and suggestions for improvement",
                      )}
                    </span>
                    <small>
                      {text("点击提交详细反馈", "Submit detailed feedback")}
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </a>
              </>
            )}
          </div>
          <section className="support-card support-tips">
            <h2>
              {type === "community"
                ? text("社区须知", "Community guidelines")
                : text("温馨提示", "Helpful reminders")}
            </h2>
            <ol>
              {(type === "community" ? communityTips : serviceTips).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </section>
        </>
      )}
    </article>
  );
}
