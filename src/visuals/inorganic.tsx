// Visual breakdowns for the inorganic lessons: the blast furnace and how gases are collected.
import { useState } from 'react';
import { Rich } from '../components/Rich';
import { GAS_TESTS } from '../lab/reactions';
import { Picker } from '../lab/Vessel';

const FURNACE: { y: number; title: string; eq?: string; text: string }[] = [
  { y: 30, title: 'The charge goes in at the top', text: 'Iron ore (haematite, mainly iron(III) oxide), coke and limestone are fed in continuously.' },
  { y: 200, title: 'Coke burns in the hot air blast', eq: 'C + O2 -> CO2', text: 'This is strongly exothermic and heats the furnace to about 1900 °C at the bottom.' },
  { y: 150, title: 'Carbon dioxide meets more hot coke', eq: 'CO2 + C -> 2CO', text: 'Carbon monoxide, the main reducing agent, is formed.' },
  { y: 95, title: 'Carbon monoxide reduces the ore', eq: 'Fe2O3 + 3CO -> 2Fe + 3CO2', text: 'The iron(III) oxide loses its oxygen. Molten iron trickles to the bottom.' },
  { y: 125, title: 'Limestone removes sandy impurities', eq: 'CaO + SiO2 -> CaSiO3', text: 'Limestone first decomposes ([[CaCO3 -> CaO + CO2]]). The basic calcium oxide then reacts with acidic silicon dioxide to form molten slag.' },
  { y: 232, title: 'Slag and iron are tapped off separately', text: 'Slag is less dense, so it floats on the molten iron and protects it from the air blast. Slag is used in road building.' },
];
export function BlastFurnaceVisual() {
  const [step, setStep] = useState(0);
  const s = FURNACE[step];
  return (
    <div className="visual">
      <div className="visual-row">
        <svg viewBox="0 0 220 270" width="230" role="img" aria-label="Blast furnace with numbered stages">
          <path d="M80 20 H140 L160 110 L168 200 L150 250 H70 L52 200 L60 110 Z" fill="var(--sunk)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M56 205 L72 248 H148 L164 205 Z" fill="#e8873a" opacity="0.75" />
          <path d="M66 232 L72 248 H148 L154 232 Z" fill="#b5651d" />
          <path d="M20 205 H54 M200 205 H166" stroke="var(--ink)" strokeWidth="2" />
          <text x="4" y="198" fontSize="8.5" fill="var(--muted)">hot air</text><text x="172" y="198" fontSize="8.5" fill="var(--muted)">hot air</text>
          <path d="M150 226 H196" stroke="var(--ink)" strokeWidth="2" /><text x="172" y="221" fontSize="8.5" fill="var(--muted)">slag</text>
          <path d="M70 244 H22" stroke="var(--ink)" strokeWidth="2" /><text x="18" y="258" fontSize="8.5" fill="var(--muted)">molten iron</text>
          <path d="M140 22 H180" stroke="var(--ink)" strokeWidth="1.5" /><text x="150" y="14" fontSize="8.5" fill="var(--muted)">waste gases</text>
          {FURNACE.map((f, i) => (
            <g key={i} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
              <circle cx={110} cy={f.y} r="11" fill={i === step ? 'var(--orange)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.5" />
              <text x={110} y={f.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill={i === step ? '#fff' : 'var(--ink)'}>{i + 1}</text>
            </g>
          ))}
        </svg>
        <div className="stack" style={{ flex: '1 1 220px' }}>
          <Picker label="Stage" options={FURNACE.map((_, i) => String(i + 1))} value={String(step + 1)} onChange={(v) => setStep(Number(v) - 1)} />
          <h3>{s.title}</h3>
          {s.eq && <p className="equation"><Rich text={`[[${s.eq}]]`} /></p>}
          <p><Rich text={s.text} /></p>
        </div>
      </div>
    </div>
  );
}
export const FURNACE_EQUATIONS = FURNACE.flatMap((f) => (f.eq ? [f.eq] : []));

const METHOD: Record<string, 'water' | 'up' | 'down'> = { H2: 'water', O2: 'water', CO2: 'down', NH3: 'up', Cl2: 'down', SO2: 'down', HCl: 'down' };
const METHOD_TEXT = {
  water: ['Over water', 'The gas pushes water out of an upturned jar. Used for gases that are not very soluble in water.'],
  up: ['Upward delivery', 'The gas is led up into an upturned jar and pushes the air out below. Used for gases less dense than air.'],
  down: ['Downward delivery', 'The gas is led down into an upright jar and pushes the air out above. Used for gases denser than air.'],
} as const;
export function GasCollectionVisual() {
  const gases = GAS_TESTS.filter((g) => METHOD[g.formula]);
  const [formula, setFormula] = useState('NH3');
  const g = gases.find((x) => x.formula === formula)!;
  const method = METHOD[formula];
  return (
    <div className="visual">
      <Picker label="Gas" options={gases.map((x) => x.formula)} value={formula} onChange={setFormula} render={(f) => gases.find((x) => x.formula === f)!.gas} />
      <div className="visual-row">
        <svg viewBox="0 0 200 170" width="220" role="img" aria-label={`${METHOD_TEXT[method][0]} for collecting ${g.gas}`}>
          {method === 'water' && (
            <>
              <path d="M20 90 V150 H180 V90" fill="none" stroke="var(--ink)" strokeWidth="2" />
              <rect x="21" y="105" width="158" height="44" fill="#bfe3f2" opacity="0.7" />
              <rect x="100" y="30" width="46" height="112" fill="#bfe3f2" opacity="0.5" stroke="var(--ink)" strokeWidth="2" />
              <rect x="101" y="31" width="44" height="48" fill="var(--surface)" />
              <path d="M0 60 H50 V135 H122 V118" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
              {[0, 1, 2].map((i) => <circle key={i} cx={122 + (i % 2) * 6} cy="112" r="3" fill="#fff" stroke="var(--muted)" strokeWidth="0.5" className="bubble" style={{ animationDelay: `${-i * 0.6}s`, animationDuration: '1.8s' }} />)}
              <text x="123" y="58" textAnchor="middle" fontSize="10" fill="var(--muted)">gas</text>
            </>
          )}
          {method === 'up' && (
            <>
              <rect x="80" y="20" width="50" height="110" fill="var(--sunk)" stroke="var(--ink)" strokeWidth="2" />
              <rect x="78" y="128" width="54" height="5" fill="var(--glass)" />
              <path d="M0 150 H105 V60" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
              <text x="105" y="44" textAnchor="middle" fontSize="10" fill="var(--muted)">gas rises</text>
              <text x="150" y="140" fontSize="9" fill="var(--muted)">air out</text>
              <path d="M136 132 v12" stroke="var(--muted)" strokeWidth="1.2" />
            </>
          )}
          {method === 'down' && (
            <>
              <path d="M80 30 V140 H130 V30" fill="var(--sunk)" stroke="var(--ink)" strokeWidth="2" />
              <path d="M0 14 H105 V110" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
              <text x="105" y="130" textAnchor="middle" fontSize="10" fill="var(--muted)">gas sinks</text>
              <text x="140" y="28" fontSize="9" fill="var(--muted)">air out</text>
            </>
          )}
        </svg>
        <div className="stack" style={{ flex: '1 1 220px' }}>
          <h3>{METHOD_TEXT[method][0]}</h3>
          <p>{METHOD_TEXT[method][1]}</p>
          <dl className="facts-list">
            <div><dt>Why this method</dt><dd>{g.density}</dd></div>
            <div><dt>Dry it with</dt><dd>{g.dry}</dd></div>
            <div><dt>Test: {g.test.toLowerCase()}</dt><dd>{g.result}</dd></div>
          </dl>
        </div>
      </div>
      <p className="small muted">Two questions decide the method: is the gas denser or less dense than air, and does it dissolve in water? The drying agent must not react with the gas.</p>
    </div>
  );
}
