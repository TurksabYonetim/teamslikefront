import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-block w-5 h-5 rounded-full border-2 border-line border-t-brand animate-spin",
        className,
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid place-items-center h-full w-full min-h-[50vh]">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
