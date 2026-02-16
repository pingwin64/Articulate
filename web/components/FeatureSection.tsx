import Reveal from './Reveal';

interface FeatureSectionProps {
  number: string;
  title: string;
  body: string;
  detail: string;
  visual: React.ReactNode;
  reverse?: boolean;
}

export default function FeatureSection({
  number,
  title,
  body,
  detail,
  visual,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <div
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-16`}
    >
      <Reveal
        animation={reverse ? 'fade-right' : 'fade-left'}
        className="flex-1 max-w-lg"
      >
        <span className="font-[family-name:var(--font-serif)] text-sm font-semibold text-[var(--muted)] mb-4 block">
          {number}
        </span>
        <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-bold tracking-tight mb-5 leading-snug">
          {title}
        </h3>
        <p className="text-[var(--secondary)] text-[15px] leading-[1.7] mb-4">
          {body}
        </p>
        <p className="text-[var(--muted)] text-[14px] leading-relaxed">
          {detail}
        </p>
      </Reveal>
      <Reveal
        animation={reverse ? 'fade-left' : 'fade-right'}
        delay={200}
        className="flex-1 flex items-center justify-center w-full"
      >
        {visual}
      </Reveal>
    </div>
  );
}
