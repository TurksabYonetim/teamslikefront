import clsx from "clsx";

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-[13px]",
  lg: "w-12 h-12 text-[17px]",
} as const;

interface AvatarProps {
  name?: string;
  initials?: string;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

function toInitials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  initials,
  color = "#5b5fc7",
  size = "md",
  className,
}: AvatarProps) {
  return (
    <span
      className={clsx(
        "inline-grid place-items-center rounded-full font-semibold text-white shrink-0 select-none",
        SIZES[size],
        className,
      )}
      style={{ background: color }}
    >
      {initials ?? toInitials(name)}
    </span>
  );
}
