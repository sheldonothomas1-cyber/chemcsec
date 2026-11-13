/** An atom or ion drawn as a nucleus with its electron shells. */
export function ShellDiagram({
  shells, label, size = 180, highlightOuter = false, title,
}: {
  shells: number[];
  label: string;
  size?: number;
  highlightOuter?: boolean;
  title?: string;
}) {
  const n = shells.length;
  const radius = (i: number) => (n <= 1 ? 54 : 28 + (i * 64) / (n - 1));
  const text = title ?? `${label}: electron arrangement ${shells.join(', ')}`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={text} className="shell-diagram">
      <title>{text}</title>
      {shells.map((count, i) => {
        const r = radius(i);
        const dot = count <= 8 ? 4.6 : count <= 18 ? 3.2 : 2.3;
        const outer = highlightOuter && i === n - 1;
        return (
          <g key={i} className={`shell-ring ${i % 2 ? 'reverse' : ''}`} style={{ animationDuration: `${40 + i * 18}s` }}>
            <circle cx="100" cy="100" r={r} fill="none" stroke="var(--line)" strokeWidth="1.4" />
            {Array.from({ length: count }, (_, k) => {
              const a = (2 * Math.PI * k) / count - Math.PI / 2;
              return <circle key={k} cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r={dot} fill={outer ? 'var(--orange)' : 'var(--blue)'} />;
            })}
          </g>
        );
      })}
      <circle cx="100" cy="100" r={n <= 1 ? 22 : 17} fill="var(--ink)" />
      <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fill="var(--surface)" fontFamily="var(--display)" fontWeight="700" fontSize={label.length > 3 ? 9 : label.length > 2 ? 11 : 14}>
        {label}
      </text>
    </svg>
  );
}
