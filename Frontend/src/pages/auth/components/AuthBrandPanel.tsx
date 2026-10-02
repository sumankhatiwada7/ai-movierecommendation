import posterImage from "../../../assets/walter-and-jesse.jpg";

interface AuthBrandPanelProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function AuthBrandPanel({ eyebrow, title, description }: AuthBrandPanelProps) {
  return (
    <aside className="relative flex h-72 flex-col justify-between overflow-hidden bg-[#17130b] p-6 text-white lg:min-h-[620px] lg:w-[46%] lg:p-12">
      <img src={posterImage} alt="Walter and Jesse" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />
      <div className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em]">
        <span className="h-2 w-2 rounded-full bg-primary" />
        WatchTV originals
      </div>
      <div className="relative z-10 max-w-sm">
        <p className="mb-3 text-sm font-bold uppercase tracking-[.3em] text-primary">{eyebrow}</p>
        <div className="font-display text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold uppercase leading-[.8] tracking-[-.04em] text-white">
          <span className="block">Let's</span>
          <span className="block">cook</span>
        </div>
        <p className="mt-6 hidden max-w-xs text-sm font-semibold leading-6 text-white lg:block">{description}</p>
      </div>
      <div className="relative z-10 hidden max-w-xs border-l-2 border-primary pl-4 text-sm font-semibold text-white lg:block">{title}</div>
    </aside>
  );
}
