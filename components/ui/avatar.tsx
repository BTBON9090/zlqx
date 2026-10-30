import { cn, avatarTone, initials } from "@/lib/utils";

export function Avatar({
  name,
  size = 36,
  className,
  ring = false,
  square = false,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
  square?: boolean;
}) {
  const tone = avatarTone(name);
  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize: Math.max(10, Math.round(size * 0.34)),
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold tracking-tight",
        square ? "rounded-[8px]" : "rounded-full",
        ring && "ring-2 ring-white",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarGroup({
  names,
  max = 3,
  size = 26,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <span key={name} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={name} size={size} ring />
        </span>
      ))}
      {rest > 0 ? (
        <span
          style={{ width: size, height: size, marginLeft: -8, fontSize: Math.round(size * 0.32) }}
          className="inline-flex items-center justify-center rounded-full bg-[#eef0ec] font-medium text-muted ring-2 ring-white"
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
