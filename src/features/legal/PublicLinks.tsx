import { translateMessage } from "../../i18n";
export default function PublicLinks() {
  return (
    <nav
      className="account-legal-links"
      aria-label={translateMessage("legal.help")}
    >
      {(
        [
          ["/help", "legal.help"],
          ["/service", "legal.service"],
          ["/community", "legal.community"],
          ["/terms-service", "legal.terms"],
          ["/privacy-policy", "legal.privacy"],
        ] as const
      ).map(([path, key]) => (
        <a href={path} key={path}>
          {translateMessage(key)}
        </a>
      ))}
    </nav>
  );
}
