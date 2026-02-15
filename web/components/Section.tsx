interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`py-24 sm:py-32 px-6 ${className}`}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}
