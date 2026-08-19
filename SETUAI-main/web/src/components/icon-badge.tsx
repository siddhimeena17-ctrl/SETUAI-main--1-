import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Map,
  MessageCircle,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const icons = {
  book: BookOpen,
  building: Building2,
  check: CheckCircle2,
  heart: HeartHandshake,
  lightbulb: Lightbulb,
  map: Map,
  message: MessageCircle,
  school: School,
  shield: ShieldCheck,
  sparkles: Sparkles,
  students: GraduationCap,
  users: Users,
};

export function IconBadge({ icon = "sparkles" }: { icon?: string }) {
  const Icon = icons[icon as keyof typeof icons] || Sparkles;

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center border border-[var(--color-coral)] bg-[var(--color-teal-soft)] text-[var(--color-coral)]">
      <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
    </span>
  );
}
