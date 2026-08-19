import Image from "next/image";

type SetuAiMarkProps = {
  className?: string;
  preload?: boolean;
  sizes?: string;
};

export function SetuAiMark({ className = "", preload = false, sizes = "64px" }: SetuAiMarkProps) {
  return (
    <span aria-hidden="true" className={`block shrink-0 overflow-hidden ${className}`.trim()}>
      <Image
        src="/icon-512.png"
        alt=""
        width={512}
        height={512}
        preload={preload}
        sizes={sizes}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
