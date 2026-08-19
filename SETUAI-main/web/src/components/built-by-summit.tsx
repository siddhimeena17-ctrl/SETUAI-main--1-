import Image from "next/image";

export function BuiltBySummit() {
  return (
    <a
      href="https://summitintelligentsystems.com"
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-2 text-[13px] font-medium leading-normal text-slate-400 transition-colors hover:text-slate-200"
    >
      <Image
        src="https://summitintelligentsystems.com/images/logo-mark.png"
        alt=""
        width={20}
        height={20}
        className="h-5 w-auto"
        unoptimized
      />
      <span>
        Built by <strong className="font-semibold text-blue-300">Summit Intelligent Systems</strong>
      </span>
    </a>
  );
}
