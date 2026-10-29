export default function AddressAvatar({
  address,
  size = 32,
}: {
  address: string;
  size?: number;
}) {
  const seed = address.toLowerCase().replace(/^0x/, "").padEnd(40, "0");
  const hue = parseInt(seed.slice(0, 6), 16) % 360;
  return (
    <svg
      aria-hidden="true"
      className="address-avatar"
      width={size}
      height={size}
      viewBox="0 0 5 5"
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue} 65% 65%)`,
      }}
    >
      {Array.from({ length: 25 }, (_, i) => {
        const x = i % 5,
          y = Math.floor(i / 5);
        const value = parseInt(seed[(y * 3 + Math.min(x, 4 - x)) % 40], 16);
        return value % 3 ? (
          <rect
            key={i}
            x={x}
            y={y}
            width="1"
            height="1"
            fill={`hsl(${(hue + 100 + value * 13) % 360} 75% ${value % 2 ? 43 : 65}%)`}
          />
        ) : null;
      })}
    </svg>
  );
}
