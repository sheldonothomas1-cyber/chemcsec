// Paper 02-style practice: original structured and extended questions with mark schemes
// broken into single-mark checkpoints, the way CXC mark schemes award credit.
// The learner writes an answer, then ticks the checkpoints they actually earned.

export interface P2Part {
  q: string;
  marks: number;
  command: string;
  /** One checkpoint per mark. */
  points: string[];
  model: string;
}

export interface P2Question {
  id: string;
  title: string;
  kind: 'Data analysis' | 'Structured' | 'Extended response';
  topics: string[];
  intro: string;
  table?: { head: string[]; rows: (string | number)[][] };
  parts: P2Part[];
}

export const COMMAND_WORDS: [word: string, means: string][] = [
  ['State / name / identify', 'One word or one short line. No explanation needed, none rewarded.'],
  ['Define', 'The exact meaning of the term, in one sentence.'],
  ['Describe', 'Say what happens, in order. What you would see or do - not why.'],
  ['Explain', 'Give the reason, as a cause-and-effect chain: "because ..., so ...".'],
  ['Distinguish / compare', 'Say something about BOTH things, using the same feature.'],
  ['Calculate / determine', 'Show every step of working, and put the unit on the final answer.'],
  ['Deduce / predict', 'Use the information given to reach an answer you have not been taught directly.'],
  ['Suggest', 'Apply what you know to an unfamiliar situation. More than one answer may be accepted.'],
];

export const PAPER2: P2Question[] = [
  {
    id: 'p2-rates',
    title: 'Marble chips and acid',
    kind: 'Data analysis',
    topics: ['A10', 'A6'],
    intro:
      'A student added 2.0 g of marble chips (an excess) to 40 cm³ of 0.50 mol dm⁻³ hydrochloric acid at 28 °C and recorded the total volume of carbon dioxide collected in a gas syringe every 30 seconds.',
    table: {
      head: ['Time / s', 0, 30, 60, 90, 120, 150, 180, 210].map(String),
      rows: [['Volume of gas / cm³', 0, 80, 140, 185, 215, 232, 240, 240]],
    },
    parts: [
      {
        q: 'Write a balanced equation, with state symbols, for the reaction.',
        marks: 2, command: 'Write',
        points: ['Correct formulae and balanced', 'Correct state symbols on all five substances'],
        model: '[[CaCO3(s) + 2HCl(aq) -> CaCl2(aq) + H2O(l) + CO2(g)]]',
      },
      {
        q: 'Describe how you would draw a graph of these results.',
        marks: 3, command: 'Describe',
        points: ['Time on the horizontal axis and volume on the vertical axis, both labelled with units', 'A sensible scale using more than half the grid, with all points plotted accurately', 'A smooth curve of best fit, not points joined with a ruler'],
        model: 'Plot time (s) on the x-axis and volume of gas (cm³) on the y-axis, choose scales that fill most of the grid, plot all eight points and draw a smooth best-fit curve that levels off at 240 cm³.',
      },
      {
        q: 'Calculate the average rate of reaction (a) in the first 30 s and (b) between 120 s and 150 s.',
        marks: 2, command: 'Calculate',
        points: ['(a) 80 ÷ 30 = 2.7 cm³ s⁻¹', '(b) (232 - 215) ÷ 30 = 0.57 cm³ s⁻¹'],
        model: '(a) 80 cm³ ÷ 30 s = 2.7 cm³ s⁻¹. (b) 17 cm³ ÷ 30 s = 0.57 cm³ s⁻¹.',
      },
      {
        q: 'Explain why the rate decreases as the reaction proceeds.',
        marks: 2, command: 'Explain',
        points: ['The concentration of the acid falls as it is used up', 'So collisions between acid particles and the marble surface become less frequent'],
        model: 'The acid is used up, so its concentration decreases. There are fewer acid particles per unit volume, so they collide with the marble less often and the rate falls.',
      },
      {
        q: 'State the time at which the reaction finished, giving a reason.',
        marks: 1, command: 'State',
        points: ['By 180 s, because the volume of gas no longer increases'],
        model: 'The reaction had finished by 180 s: the volume stays at 240 cm³ afterwards.',
      },
      {
        q: 'Show by calculation that 240 cm³ is the volume of gas expected. (1 mol of gas occupies 24 000 cm³ at room temperature and pressure.)',
        marks: 3, command: 'Calculate',
        points: ['Moles of HCl = 0.50 × 40 ÷ 1000 = 0.020 mol', 'Mole ratio 2 HCl : 1 [[CO2]], so 0.010 mol of [[CO2]]', 'Volume = 0.010 × 24 000 = 240 cm³'],
        model: 'Moles of HCl = 0.50 × 0.040 = 0.020 mol. Two moles of HCl give one mole of [[CO2]], so 0.010 mol forms. Volume = 0.010 × 24 000 = 240 cm³.',
      },
      {
        q: 'The experiment is repeated at 38 °C with everything else unchanged. Describe how the curve would differ.',
        marks: 2, command: 'Describe',
        points: ['The curve is steeper at the start (and levels off sooner)', 'It levels off at the same final volume, 240 cm³, because the amount of acid is unchanged'],
        model: 'The new curve rises more steeply and flattens earlier, but ends at the same 240 cm³ because the same number of moles of acid reacted.',
      },
    ],
  },
  {
    id: 'p2-titration',
    title: 'Finding the concentration of sodium carbonate',
    kind: 'Structured',
    topics: ['A7', 'A6'],
    intro:
      'A student titrated 25.0 cm³ portions of sodium carbonate solution with 0.200 mol dm⁻³ hydrochloric acid, using methyl orange as the indicator.',
    table: {
      head: ['Titration', 'Rough', '1', '2', '3'],
      rows: [['Volume of acid used / cm³', '21.10', '20.40', '20.60', '20.50']],
    },
    parts: [
      {
        q: 'Name the piece of apparatus used to measure 25.0 cm³ of the sodium carbonate solution accurately.',
        marks: 1, command: 'Name',
        points: ['Pipette'],
        model: 'A 25.0 cm³ pipette.',
      },
      {
        q: 'Calculate the mean titre the student should use, and explain your choice of readings.',
        marks: 2, command: 'Calculate',
        points: ['Mean = (20.40 + 20.60 + 20.50) ÷ 3 = 20.50 cm³', 'The rough titre is left out because it overshoots the end point'],
        model: 'Use the three accurate titres only: (20.40 + 20.60 + 20.50) ÷ 3 = 20.50 cm³. The rough titration is only a guide.',
      },
      {
        q: 'Write a balanced equation for the reaction.',
        marks: 2, command: 'Write',
        points: ['Correct formulae for reactants and products', 'Correctly balanced'],
        model: '[[Na2CO3 + 2HCl -> 2NaCl + H2O + CO2]]',
      },
      {
        q: 'Calculate the concentration of the sodium carbonate solution in mol dm⁻³.',
        marks: 3, command: 'Calculate',
        points: ['Moles of HCl = 0.200 × 20.50 ÷ 1000 = 0.00410 mol', 'Moles of [[Na2CO3]] = 0.00410 ÷ 2 = 0.00205 mol', 'Concentration = 0.00205 ÷ 0.0250 = 0.0820 mol dm⁻³'],
        model: 'Moles of HCl = 0.200 × 0.02050 = 0.00410. Ratio 2:1, so moles of [[Na2CO3]] = 0.00205. Concentration = 0.00205 ÷ 0.0250 = 0.0820 mol dm⁻³.',
      },
      {
        q: 'Calculate the concentration in g dm⁻³. (Na = 23, C = 12, O = 16)',
        marks: 1, command: 'Calculate',
        points: ['0.0820 × 106 = 8.69 g dm⁻³'],
        model: 'Formula mass of [[Na2CO3]] = 106. Concentration = 0.0820 × 106 = 8.69 g dm⁻³.',
      },
      {
        q: 'Explain why the conical flask is rinsed with distilled water and NOT with the sodium carbonate solution.',
        marks: 2, command: 'Explain',
        points: ['Water left in the flask does not change the number of moles of sodium carbonate delivered by the pipette', 'Rinsing with the carbonate solution would leave extra moles behind, making the titre too large'],
        model: 'Drops of water do not alter the moles of carbonate pipetted in. Drops of carbonate solution would add extra moles, so more acid would be needed and the result would be too high.',
      },
    ],
  },
  {
    id: 'p2-bonding',
    title: 'Magnesium oxide and carbon dioxide',
    kind: 'Structured',
    topics: ['A5'],
    intro: 'Magnesium oxide melts at 2852 °C. Carbon dioxide is a gas at room temperature. (Mg is 2,8,2 and O is 2,6.)',
    parts: [
      {
        q: 'Describe, in terms of electrons, how magnesium and oxygen atoms form the ions in magnesium oxide.',
        marks: 3, command: 'Describe',
        points: ['Each magnesium atom loses its two outer electrons', 'Each oxygen atom gains two electrons', 'Forming [[Mg^2+]] (2,8) and [[O^2-]] (2,8) ions'],
        model: 'A magnesium atom transfers its two outer electrons to an oxygen atom, giving [[Mg^2+]] and [[O^2-]], both with the arrangement 2,8.',
      },
      {
        q: 'Explain why magnesium oxide has a very high melting point.',
        marks: 2, command: 'Explain',
        points: ['It is a giant ionic lattice with strong electrostatic attraction between oppositely charged ions', 'A large amount of energy is needed to overcome these forces'],
        model: 'Magnesium oxide is a giant lattice of [[Mg^2+]] and [[O^2-]] ions held by strong electrostatic attraction in all directions, so a great deal of energy is needed to separate them.',
      },
      {
        q: 'Compare the electrical conductivity of solid magnesium oxide, molten magnesium oxide and graphite.',
        marks: 3, command: 'Compare',
        points: ['Solid magnesium oxide does not conduct: the ions are fixed in position', 'Molten magnesium oxide conducts: the ions are free to move', 'Graphite conducts as a solid: it has delocalised electrons'],
        model: 'Solid MgO: no conduction, ions fixed. Molten MgO: conducts, mobile ions. Graphite: conducts even as a solid because of delocalised electrons.',
      },
      {
        q: 'The covalent bonds in carbon dioxide are strong. Explain why carbon dioxide is nevertheless a gas at room temperature.',
        marks: 2, command: 'Explain',
        points: ['Carbon dioxide consists of small molecules with only weak forces BETWEEN the molecules', 'Little energy is needed to separate the molecules; the covalent bonds are not broken'],
        model: 'It is simple molecular. Boiling only has to overcome the weak forces between molecules, which takes little energy; the strong covalent bonds inside each molecule stay intact.',
      },
    ],
  },
  {
    id: 'p2-brine',
    title: 'Electrolysis of brine',
    kind: 'Extended response',
    topics: ['A9', 'A5', 'C4'],
    intro: 'Concentrated aqueous sodium chloride (brine) is electrolysed using inert electrodes.',
    parts: [
      {
        q: 'Explain why solid sodium chloride does not conduct electricity but brine does.',
        marks: 2, command: 'Explain',
        points: ['In the solid the ions are held in fixed positions in the lattice', 'In solution the ions are free to move and carry charge'],
        model: 'Conduction needs mobile charged particles. The ions are locked in the solid lattice but are free to move once dissolved.',
      },
      {
        q: 'Identify the product at each electrode, write the half-equations, and explain why each ion is discharged.',
        marks: 6, command: 'Explain',
        points: [
          'Cathode product: hydrogen',
          '[[2H+ + 2e- -> H2]]',
          '[[H+]] is discharged in preference to [[Na+]] because sodium is much more reactive than hydrogen',
          'Anode product: chlorine',
          '[[2Cl- -> Cl2 + 2e-]]',
          '[[Cl-]] is discharged in preference to [[OH-]] because the chloride ions are present at high concentration',
        ],
        model: 'Cathode: hydrogen, [[2H+ + 2e- -> H2]]; sodium is far above hydrogen in the reactivity series, so [[H+]] is discharged. Anode: chlorine, [[2Cl- -> Cl2 + 2e-]]; in a concentrated solution chloride is discharged rather than hydroxide.',
      },
      {
        q: 'State what happens to the pH of the solution during the electrolysis, and explain why.',
        marks: 2, command: 'Explain',
        points: ['The pH rises (the solution becomes alkaline)', '[[Na+]] and [[OH-]] ions are left in solution, forming sodium hydroxide'],
        model: 'The solution becomes alkaline: hydrogen ions and chloride ions are removed, leaving sodium hydroxide.',
      },
      {
        q: 'Describe a test for the gas produced at the anode.',
        marks: 1, command: 'Describe',
        points: ['Damp blue litmus paper turns red and is then bleached'],
        model: 'Hold damp blue litmus paper in the gas: it turns red, then is bleached white.',
      },
      {
        q: 'A current of 0.5 A flows for 3860 s. Calculate the volume of chlorine produced at room temperature and pressure. (1 mol of electrons = 96 500 C; 1 mol of gas = 24 dm³)',
        marks: 3, command: 'Calculate',
        points: ['Q = 0.5 × 3860 = 1930 C, so moles of electrons = 1930 ÷ 96 500 = 0.020 mol', 'Moles of [[Cl2]] = 0.020 ÷ 2 = 0.010 mol', 'Volume = 0.010 × 24 = 0.24 dm³'],
        model: 'Q = It = 1930 C = 0.020 mol of electrons. Two moles of electrons release one mole of [[Cl2]], so 0.010 mol forms: 0.010 × 24 = 0.24 dm³ (240 cm³).',
      },
    ],
  },
  {
    id: 'p2-ethanol',
    title: 'Ethanol from sugar cane',
    kind: 'Extended response',
    topics: ['B2', 'A2'],
    intro: 'Ethanol for rum production is made by fermenting molasses, a by-product of the sugar industry.',
    parts: [
      {
        q: 'State the conditions needed for fermentation and write an equation for the fermentation of glucose.',
        marks: 3, command: 'State',
        points: ['Yeast (which provides the enzymes)', 'A temperature of about 30 °C, in the absence of oxygen', '[[C6H12O6 -> 2C2H5OH + 2CO2]]'],
        model: 'Yeast, warm conditions (about 30 °C) and no air. [[C6H12O6 -> 2C2H5OH + 2CO2]].',
      },
      {
        q: 'Explain why fermentation alone cannot produce concentrated ethanol, and how the ethanol is concentrated.',
        marks: 2, command: 'Explain',
        points: ['The yeast is killed when the ethanol concentration reaches about 15%', 'Fractional distillation: ethanol has a lower boiling point (78 °C) than water, so it distils first'],
        model: 'Yeast dies at roughly 15% ethanol, so the mixture is fractionally distilled; ethanol boils at 78 °C and leaves the column before water.',
      },
      {
        q: 'Ethanol can be oxidised to ethanoic acid. Name a suitable reagent and state what you would observe.',
        marks: 2, command: 'State',
        points: ['Acidified potassium dichromate(VI), with heating', 'The colour changes from orange to green'],
        model: 'Warm with acidified potassium dichromate(VI); the mixture changes from orange to green.',
      },
      {
        q: 'Ethanol reacts with ethanoic acid. Write the equation, name the organic product and state the conditions.',
        marks: 3, command: 'Write',
        points: ['[[CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O]]', 'Ethyl ethanoate', 'Concentrated sulfuric acid catalyst, with heating'],
        model: '[[CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O]]. The ester is ethyl ethanoate; heat with a little concentrated sulfuric acid as catalyst.',
      },
      {
        q: 'Describe a chemical test to distinguish ethanol from ethanoic acid.',
        marks: 2, command: 'Describe',
        points: ['Add sodium carbonate (or sodium hydrogencarbonate) to each', 'Ethanoic acid effervesces; ethanol shows no reaction'],
        model: 'Add sodium carbonate: ethanoic acid fizzes as carbon dioxide is given off; ethanol does nothing.',
      },
    ],
  },
  {
    id: 'p2-metals',
    title: 'Extracting metals and identifying an iron salt',
    kind: 'Extended response',
    topics: ['C2', 'C1', 'C4'],
    intro: 'Aluminium and iron are both extracted from their oxides, but by different methods.',
    parts: [
      {
        q: 'Explain why aluminium is extracted by electrolysis whereas iron is extracted by reduction with carbon.',
        marks: 3, command: 'Explain',
        points: ['Aluminium is above carbon in the reactivity series', 'So carbon cannot reduce aluminium oxide; electrolysis is needed', 'Iron is below carbon, so its oxide can be reduced by carbon / carbon monoxide'],
        model: 'Aluminium is more reactive than carbon, so carbon cannot take oxygen from its oxide and electrolysis must be used. Iron is less reactive than carbon, so the cheaper carbon reduction works.',
      },
      {
        q: 'Write equations for the formation of carbon monoxide in the blast furnace and for the reduction of iron(III) oxide.',
        marks: 3, command: 'Write',
        points: ['[[C + O2 -> CO2]]', '[[CO2 + C -> 2CO]]', '[[Fe2O3 + 3CO -> 2Fe + 3CO2]]'],
        model: '[[C + O2 -> CO2]], then [[CO2 + C -> 2CO]], then [[Fe2O3 + 3CO -> 2Fe + 3CO2]].',
      },
      {
        q: 'A solution contains either iron(II) sulfate or iron(III) sulfate. Describe tests, with observations and ionic equations, to identify the cation and confirm the anion.',
        marks: 5, command: 'Describe',
        points: [
          'Add sodium hydroxide solution to a sample',
          'Green precipitate shows [[Fe^2+]]; red-brown precipitate shows [[Fe^3+]]',
          '[[Fe^2+ + 2OH- -> Fe(OH)2]] or [[Fe^3+ + 3OH- -> Fe(OH)3]]',
          'To another sample add acidified barium nitrate (or barium chloride): white precipitate',
          '[[Ba^2+ + SO4^2- -> BaSO4]]',
        ],
        model: 'Sodium hydroxide gives a green precipitate with [[Fe^2+]] ([[Fe^2+ + 2OH- -> Fe(OH)2]]) or a red-brown one with [[Fe^3+]] ([[Fe^3+ + 3OH- -> Fe(OH)3]]). Acidified barium nitrate gives a white precipitate: [[Ba^2+ + SO4^2- -> BaSO4]].',
      },
      {
        q: 'Suggest why iron objects rust faster near the sea.',
        marks: 1, command: 'Suggest',
        points: ['Dissolved salt in sea spray acts as an electrolyte and speeds up rusting'],
        model: 'Salt water is a better electrolyte than fresh water, so the electron transfer involved in rusting happens faster.',
      },
    ],
  },
];

export const P2_TOTAL = (q: P2Question) => q.parts.reduce((s, p) => s + p.marks, 0);
