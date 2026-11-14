// Paper 03 practice: the practical skills CSEC assesses through the SBA (Paper 03/1) and, for
// private candidates, the written alternative (Paper 03/2). Original questions in the same
// mark-by-mark format as Paper 02, plus the rules examiners apply to tables, graphs,
// observations and plans. Nothing here is copied from CXC papers.
import type { P2Question } from './paper2';

export type P3Question = P2Question & { skill: P3SkillId };
export type P3SkillId = 'mm' | 'orr' | 'ai' | 'pd';

export const P3_SKILLS: Record<P3SkillId, { name: string; short: string }> = {
  mm: { name: 'Manipulation and measurement', short: 'M&M' },
  orr: { name: 'Observation, recording and reporting', short: 'ORR' },
  ai: { name: 'Analysis and interpretation', short: 'A&I' },
  pd: { name: 'Planning and designing', short: 'P&D' },
};

/** The rules behind most Paper 03 marks, grouped by skill. */
export const P3_GUIDE: { skill: P3SkillId; title: string; rules: string[] }[] = [
  {
    skill: 'mm',
    title: 'Read every instrument to the right precision',
    rules: [
      'Burette: read the bottom of the meniscus at eye level and record to 2 decimal places, ending in 0 or 5 (e.g. 23.45 cm³). The scale reads downwards from 0 at the top.',
      'Pipette: delivers one fixed volume. Record it as 25.0 cm³ (or 10.0 cm³), filled so the bottom of the meniscus sits on the line.',
      'Measuring cylinder: read the bottom of the meniscus to half the smallest division (e.g. 36.5 cm³ on a cylinder marked every 1 cm³).',
      'Thermometer: read to half a division. With 1 °C markings, record to 0.5 °C, e.g. 28.5 °C. Wait for the reading to stop changing.',
      'Balance: write down every digit the display shows, including a final zero (2.40 g, not 2.4 g).',
      'Stopwatch: record to the nearest second for reactions; reaction times are not precise enough for hundredths.',
      'Every recorded number in one column has the same number of decimal places.',
    ],
  },
  {
    skill: 'orr',
    title: 'Observations, tables and graphs',
    rules: [
      'An observation is what you see, hear, feel or smell. Give colours before and after: "the blue solution turned colourless", not "it changed colour".',
      'Never name a product in an observation. Write "white precipitate", not "barium sulfate formed". Naming it is an inference.',
      'Gases: describe what you saw ("effervescence; colourless gas") and the test result ("relit a glowing splint"). The name of the gas goes in the inference column.',
      'Tables: ruled lines, a heading for every column with the quantity and its unit (Time / s), and no units in the body of the table.',
      'Graphs: a title; the variable you changed on the x-axis; both axes labelled with units; a scale with even steps (1, 2, 5 or 10) that uses more than half the grid.',
      'Plot points as small crosses or circled dots, then draw ONE smooth curve or straight line of best fit. Never join the dots with a ruler.',
      'Report in the past tense and the passive voice: "the mixture was heated", not "I heat the mixture".',
    ],
  },
  {
    skill: 'ai',
    title: 'Analysis and interpretation',
    rules: [
      'Describe a trend with data: "as the temperature increased from 20 °C to 60 °C, the time fell from 80 s to 12 s".',
      'Explain the trend with the chemistry (collision theory, the reactivity series, ions present), not just repeat it.',
      'Titrations: average only concordant titres (within 0.10 cm³ of each other). Never include the rough titre.',
      'Show every step of a calculation: moles of the known, the mole ratio from the equation, then the answer with its unit.',
      'Read values from your own graph and show the lines you drew on the grid to find them.',
      'A source of error must be specific to the experiment ("heat was lost through the sides of the cup"), not "human error".',
      'A conclusion answers the aim and says whether the results support the hypothesis.',
    ],
  },
  {
    skill: 'pd',
    title: 'Planning and designing an investigation',
    rules: [
      'Hypothesis: a testable statement that links two variables. "Increasing the temperature increases the rate of reaction between magnesium and acid."',
      'Aim: what the experiment will find out. "To investigate the effect of temperature on the rate of ..."',
      'Apparatus and materials: every item, with sizes and concentrations (250 cm³ beaker, 1.0 mol dm⁻³ hydrochloric acid).',
      'Variables: the manipulated (independent) variable, the responding (dependent) variable, and at least two controlled variables with how each is kept the same.',
      'Method: numbered steps in order, in the future or passive tense, that someone else could follow. Say how you will measure the responding variable.',
      'Results table: draw the empty table you will fill in, with headings and units.',
      'Expected results: say what results would support the hypothesis ("the time will decrease as temperature increases").',
      'Precautions (things that make the results reliable or safe) and limitations (what you cannot control). Assumptions belong in a plan too.',
    ],
  },
];

/** What a CSEC candidate should know about the Paper 03 options. Checked against the shape of the syllabus, not copied from it. */
export const P3_ABOUT: [string, string][] = [
  ['Paper 03/1 (SBA)', 'School candidates: lab reports done during the course and marked by the teacher, then moderated by CXC. The four skills above are each marked across several labs.'],
  ['Paper 03/2', 'Private candidates who cannot do the SBA sit a written paper instead. It tests the same four skills: reading instruments and results tables, observations and inferences, graphs and calculations, and planning an investigation.'],
  ['What to practise', 'Reading scales, filling observation and inference tables, plotting graphs from data, titration calculations, and writing full planning-and-design answers. Every question below is set in that style.'],
];

export const PAPER3: P3Question[] = [
  {
    id: 'p3-titration',
    skill: 'mm',
    title: 'Titrating sodium hydroxide',
    kind: 'Data analysis',
    topics: ['A7', 'A6', 'C4'],
    intro:
      'A student filled a burette with 0.100 mol dm⁻³ hydrochloric acid and titrated it against 25.0 cm³ portions of sodium hydroxide solution, using methyl orange as the indicator. The burette readings are shown.',
    table: {
      head: ['Titration', 'Rough', '1', '2', '3'],
      rows: [
        ['Final burette reading / cm³', '24.10', '24.20', '24.85', '23.75'],
        ['Initial burette reading / cm³', '0.00', '0.50', '1.20', '0.00'],
        ['Volume of acid used / cm³', '', '', '', ''],
      ],
    },
    parts: [
      {
        q: 'Calculate the volume of acid used in each titration, recording each value to the correct precision.',
        marks: 2, command: 'Calculate',
        points: ['Rough 24.10, then 23.70, 23.65 and 23.75 cm³', 'All four recorded to 2 decimal places'],
        model: 'Rough: 24.10 cm³. Titration 1: 23.70 cm³. Titration 2: 23.65 cm³. Titration 3: 23.75 cm³.',
      },
      {
        q: 'State the colour change at the end point.',
        marks: 1, command: 'State',
        points: ['Yellow to orange (accept yellow to red/pink if orange is mentioned as the end point)'],
        model: 'The methyl orange changes from yellow (in the alkali) to orange at the end point.',
      },
      {
        q: 'Calculate the mean titre. Say which values you used and why.',
        marks: 2, command: 'Calculate',
        points: ['Uses titrations 1, 2 and 3 only, because they are concordant (within 0.10 cm³) and the rough titre is excluded', 'Mean = 23.70 cm³'],
        model: 'Titres 1, 2 and 3 agree within 0.10 cm³, so they are averaged and the rough is left out: (23.70 + 23.65 + 23.75) ÷ 3 = 23.70 cm³.',
      },
      {
        q: 'Write a balanced equation, with state symbols, for the reaction.',
        marks: 1, command: 'Write',
        points: ['[[NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l)]] with correct state symbols'],
        model: '[[NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l)]]',
      },
      {
        q: 'Calculate the concentration of the sodium hydroxide solution in mol dm⁻³.',
        marks: 3, command: 'Calculate',
        points: ['Moles of HCl = 0.100 × 23.70 ÷ 1000 = 0.00237 mol', 'Mole ratio 1 : 1, so moles of NaOH in 25.0 cm³ = 0.00237 mol', 'Concentration = 0.00237 × 1000 ÷ 25.0 = 0.0948 mol dm⁻³'],
        model: 'n(HCl) = 0.100 × 23.70 ÷ 1000 = 0.00237 mol. The ratio is 1 : 1, so n(NaOH) = 0.00237 mol in 25.0 cm³. c(NaOH) = 0.00237 ÷ 0.0250 = 0.0948 mol dm⁻³.',
      },
      {
        q: 'Give TWO precautions that make the titres accurate.',
        marks: 2, command: 'Give',
        points: ['Rinse the burette with the acid (and the pipette with the alkali) before filling', 'Any one of: read the bottom of the meniscus at eye level; remove the funnel before titrating; add acid dropwise near the end point while swirling; use a white tile; remove the air bubble from the burette jet'],
        model: 'Rinse the burette with the hydrochloric acid before filling it, and add the acid drop by drop near the end point while swirling the flask over a white tile.',
      },
    ],
  },
  {
    id: 'p3-thermometric',
    skill: 'ai',
    title: 'Neutralisation in a polystyrene cup',
    kind: 'Data analysis',
    topics: ['A7', 'A11'],
    intro:
      'A student placed 25.0 cm³ of hydrochloric acid in a polystyrene cup and added 1.00 mol dm⁻³ sodium hydroxide solution 5.0 cm³ at a time, stirring and recording the highest temperature after each addition.',
    table: {
      head: ['Volume of NaOH added / cm³', '0.0', '5.0', '10.0', '15.0', '20.0', '25.0', '30.0', '35.0', '40.0'],
      rows: [['Temperature / °C', '27.0', '29.6', '32.1', '34.7', '37.0', '36.2', '35.3', '34.5', '33.6']],
    },
    parts: [
      {
        q: 'Suggest why a polystyrene cup is used instead of a glass beaker.',
        marks: 1, command: 'Suggest',
        points: ['Polystyrene is a poor conductor (insulator), so less heat is lost to the surroundings'],
        model: 'Polystyrene is a good insulator, so less of the heat released by the reaction is lost.',
      },
      {
        q: 'Describe how you would plot these results to find the volume of alkali that exactly neutralises the acid.',
        marks: 3, command: 'Describe',
        points: ['Volume of NaOH on the x-axis and temperature on the y-axis, labelled with units, scale using most of the grid', 'A straight line of best fit through the rising points and another through the falling points', 'Extend both lines until they cross; the volume where they meet is the end point'],
        model: 'Plot volume (cm³) on the x-axis against temperature (°C) on the y-axis. Draw one straight best-fit line through the first five points and another through the last four, and extend them until they intersect. Read the volume at the intersection.',
      },
      {
        q: 'Using your graph, state the volume of sodium hydroxide that neutralised the acid and the highest temperature reached.',
        marks: 2, command: 'State',
        points: ['Volume about 19.7 cm³ (accept 19.0 to 21.0 cm³)', 'Highest temperature about 37.1 °C (accept 37.0 to 37.6 °C)'],
        model: 'The lines cross at about 19.7 cm³, where the temperature is about 37.1 °C.',
      },
      {
        q: 'Explain why the temperature falls after the end point.',
        marks: 2, command: 'Explain',
        points: ['All the acid has reacted, so no more heat is released', 'The cooler alkali added (and heat lost to the surroundings) lowers the temperature of the mixture'],
        model: 'Once all the acid is neutralised no more heat is produced, and each extra portion of cooler alkali, together with heat loss to the air, cools the mixture.',
      },
      {
        q: 'Calculate the concentration of the hydrochloric acid. [[NaOH + HCl -> NaCl + H2O]]',
        marks: 2, command: 'Calculate',
        points: ['Moles of NaOH = 1.00 × 19.7 ÷ 1000 = 0.0197 mol (or using the student\'s own end-point volume)', 'Concentration of HCl = 0.0197 ÷ 0.0250 = 0.79 mol dm⁻³ (accept 0.76 to 0.84)'],
        model: 'n(NaOH) = 1.00 × 19.7 ÷ 1000 = 0.0197 mol = n(HCl) (1 : 1 ratio). c(HCl) = 0.0197 ÷ 0.0250 = 0.79 mol dm⁻³.',
      },
      {
        q: 'State ONE source of error in this experiment and how to reduce it.',
        marks: 1, command: 'State',
        points: ['Heat lost through the open top or sides; use a lid / a second cup as insulation (or: thermometer read before the highest temperature was reached; stir and wait for the reading to stop rising)'],
        model: 'Heat escapes from the open cup, so the rise is smaller than it should be. A lid with a hole for the thermometer reduces this.',
      },
    ],
  },
  {
    id: 'p3-unknown-salt',
    skill: 'orr',
    title: 'Identify salt X',
    kind: 'Structured',
    topics: ['C4', 'C1'],
    intro:
      'Salt X is made of pale green crystals. A student carried out these tests and recorded the observations. Write the inference for each test.',
    table: {
      head: ['Test', 'Observation'],
      rows: [
        ['1. Heat a little solid X in a dry test tube', 'Colourless liquid condensed near the top of the tube; it turned blue cobalt chloride paper pink'],
        ['2. Add sodium hydroxide solution to a solution of X, then excess', 'Green precipitate, insoluble in excess; it turned brown at the surface on standing'],
        ['3. Add aqueous ammonia to a solution of X, then excess', 'Green precipitate, insoluble in excess'],
        ['4. Add dilute nitric acid, then barium nitrate solution', 'White precipitate'],
        ['5. Add acidified potassium manganate(VII) solution', 'Purple solution decolourised'],
      ],
    },
    parts: [
      {
        q: 'Write the inference for test 1.',
        marks: 1, command: 'Infer',
        points: ['Water is present: X is hydrated (contains water of crystallisation)'],
        model: 'The liquid is water, so X contains water of crystallisation.',
      },
      {
        q: 'Write the inference for tests 2 and 3, and explain the brown colour.',
        marks: 2, command: 'Infer',
        points: ['Iron(II) ions, [[Fe^2+]], are present', 'The brown colour is iron(III) hydroxide: air oxidises iron(II) hydroxide at the surface'],
        model: '[[Fe^2+]] is present. The green iron(II) hydroxide is slowly oxidised by air to brown iron(III) hydroxide.',
      },
      {
        q: 'Write an ionic equation, with state symbols, for the reaction in test 2.',
        marks: 2, command: 'Write',
        points: ['[[Fe^2+(aq) + 2OH-(aq) -> Fe(OH)2(s)]] balanced', 'Correct state symbols'],
        model: '[[Fe^2+(aq) + 2OH-(aq) -> Fe(OH)2(s)]]',
      },
      {
        q: 'Write the inference for test 4. Why is nitric acid added first?',
        marks: 2, command: 'Infer',
        points: ['Sulfate ions, [[SO4^2-]], are present', 'The acid removes carbonate (or sulfite) ions, which would also give a white precipitate'],
        model: '[[SO4^2-]] is present. The acid is added first to destroy any carbonate, which would also form a white precipitate with barium ions.',
      },
      {
        q: 'Write the inference for test 5.',
        marks: 1, command: 'Infer',
        points: ['A reducing agent is present (iron(II) is oxidised to iron(III))'],
        model: 'X is a reducing agent: the [[Fe^2+]] ions reduce the manganate(VII) and are oxidised to [[Fe^3+]].',
      },
      {
        q: 'Name salt X.',
        marks: 1, command: 'Name',
        points: ['Hydrated iron(II) sulfate (accept iron(II) sulfate crystals)'],
        model: 'Hydrated iron(II) sulfate.',
      },
    ],
  },
  {
    id: 'p3-heating-solids',
    skill: 'orr',
    title: 'Heating two solids',
    kind: 'Structured',
    topics: ['C4', 'C1', 'A8'],
    intro:
      'Two solids were heated strongly in separate test tubes. Solid Y is white. Solid W is blue.',
    table: {
      head: ['Solid', 'Observations on heating'],
      rows: [
        ['Y', 'A colourless gas turned limewater milky. The residue was yellow while hot and white when cold.'],
        ['W', 'A brown gas was given off, and a glowing splint held in the tube relit. A black residue was left.'],
      ],
    },
    parts: [
      {
        q: 'Name the gas given off by Y and the anion it shows is present.',
        marks: 2, command: 'Name',
        points: ['Carbon dioxide', 'Carbonate ion, [[CO3^2-]]'],
        model: 'Carbon dioxide, so Y contains carbonate ions.',
      },
      {
        q: 'What does the residue being yellow when hot and white when cold show? Name Y.',
        marks: 2, command: 'Deduce',
        points: ['The residue is zinc oxide', 'Y is zinc carbonate'],
        model: 'Zinc oxide is yellow when hot and white when cold, so Y is zinc carbonate.',
      },
      {
        q: 'Write a balanced equation for the decomposition of Y.',
        marks: 1, command: 'Write',
        points: ['[[ZnCO3(s) -> ZnO(s) + CO2(g)]]'],
        model: '[[ZnCO3(s) -> ZnO(s) + CO2(g)]]',
      },
      {
        q: 'Identify the two gases given off by W and the anion present.',
        marks: 3, command: 'Identify',
        points: ['Nitrogen dioxide (the brown gas)', 'Oxygen (relit the glowing splint)', 'Nitrate ion, [[NO3-]]'],
        model: 'The brown gas is nitrogen dioxide and the gas that relit the splint is oxygen, so W is a nitrate.',
      },
      {
        q: 'W is blue and leaves a black residue. Name W and write the equation for its decomposition.',
        marks: 3, command: 'Name',
        points: ['Copper(II) nitrate', '[[2Cu(NO3)2(s) -> 2CuO(s) + 4NO2(g) + O2(g)]] correct formulae', 'Equation balanced'],
        model: 'W is copper(II) nitrate. [[2Cu(NO3)2(s) -> 2CuO(s) + 4NO2(g) + O2(g)]]',
      },
      {
        q: 'Give one safety precaution for heating W.',
        marks: 1, command: 'Give',
        points: ['Heat in a fume cupboard (or well-ventilated room), because nitrogen dioxide is toxic'],
        model: 'Heat it in a fume cupboard because nitrogen dioxide is poisonous.',
      },
    ],
  },
  {
    id: 'p3-solubility',
    skill: 'ai',
    title: 'Solubility of potassium nitrate',
    kind: 'Data analysis',
    topics: ['A2', 'A11'],
    intro:
      'The table shows the mass of potassium nitrate that dissolves in 100 g of water at different temperatures.',
    table: {
      head: ['Temperature / °C', '0', '10', '20', '30', '40', '50', '60'],
      rows: [['Solubility / g per 100 g water', '13', '21', '32', '46', '64', '85', '110']],
    },
    parts: [
      {
        q: 'Describe how you would plot a solubility curve from these data.',
        marks: 3, command: 'Describe',
        points: ['Temperature on the x-axis, solubility on the y-axis, both labelled with units', 'Even scales that use more than half the grid; all seven points plotted accurately', 'A smooth curve of best fit (not straight-line segments)'],
        model: 'Plot temperature (°C) on the x-axis and solubility (g per 100 g water) on the y-axis with even scales that fill the grid, plot the seven points and draw a smooth curve through them.',
      },
      {
        q: 'Use the curve to estimate the solubility at 35 °C and the temperature at which 100 g dissolves in 100 g of water.',
        marks: 2, command: 'Estimate',
        points: ['About 55 g per 100 g water at 35 °C (accept 52 to 58)', 'About 56 °C (accept 54 to 58 °C)'],
        model: 'About 55 g per 100 g water at 35 °C; 100 g dissolves at about 56 °C.',
      },
      {
        q: 'A saturated solution in 100 g of water at 60 °C is cooled to 20 °C. Calculate the mass of crystals that form.',
        marks: 2, command: 'Calculate',
        points: ['Uses 110 g and 32 g', '110 − 32 = 78 g of crystals'],
        model: 'At 60 °C, 110 g is dissolved; at 20 °C only 32 g can stay dissolved, so 110 − 32 = 78 g crystallises.',
      },
      {
        q: 'Describe how to find the solubility of potassium nitrate at 40 °C in the laboratory.',
        marks: 4, command: 'Describe',
        points: ['Add potassium nitrate to a known mass of water at 40 °C (water bath) and stir until no more dissolves (some solid remains)', 'Filter (or decant) the saturated solution at 40 °C', 'Weigh an evaporating basin, add a known mass of the solution, evaporate to dryness and weigh again', 'Solubility = mass of solid ÷ mass of water × 100'],
        model: 'Stir excess potassium nitrate into water kept at 40 °C in a water bath until some solid remains undissolved. Filter off a sample of the saturated solution, weigh it in a weighed evaporating basin, evaporate to dryness and weigh the solid. Mass of water = mass of solution − mass of solid; solubility = mass of solid ÷ mass of water × 100.',
      },
      {
        q: 'Explain why the solid is evaporated gently to dryness and weighed until the mass stops changing.',
        marks: 1, command: 'Explain',
        points: ['To make sure all the water has gone (heating to constant mass) without the solid spitting out or decomposing'],
        model: 'Heating to constant mass shows all the water has been removed; gentle heating stops solid spitting out of the basin.',
      },
    ],
  },
  {
    id: 'p3-pd-surface-area',
    skill: 'pd',
    title: 'Plan: powdered or lump limestone?',
    kind: 'Extended response',
    topics: ['A10'],
    intro:
      'A farmer spreads limestone (calcium carbonate) on acidic soil. She notices that powdered limestone seems to work faster than small lumps. Plan an experiment to investigate whether the particle size of calcium carbonate affects the rate of its reaction with hydrochloric acid.',
    parts: [
      {
        q: 'State a hypothesis and an aim for the investigation.',
        marks: 2, command: 'State',
        points: ['Hypothesis linking particle size to rate, e.g. "the smaller the particles of calcium carbonate, the faster the reaction"', 'Aim: to investigate the effect of particle size of calcium carbonate on the rate of its reaction with hydrochloric acid'],
        model: 'Hypothesis: the smaller the particles of calcium carbonate, the greater the rate of reaction with hydrochloric acid. Aim: to investigate how particle size of calcium carbonate affects the rate of its reaction with hydrochloric acid.',
      },
      {
        q: 'List the apparatus and materials.',
        marks: 2, command: 'List',
        points: ['Calcium carbonate as large chips, small chips and powder; hydrochloric acid of stated concentration (e.g. 1.0 mol dm⁻³)', 'Conical flask, measuring cylinder, balance, stopwatch, and a gas syringe (or a balance and cotton wool to measure mass loss)'],
        model: 'Large marble chips, small marble chips and powdered calcium carbonate; 1.0 mol dm⁻³ hydrochloric acid; 100 cm³ conical flask with bung and delivery tube; 100 cm³ gas syringe; 50 cm³ measuring cylinder; balance; stopwatch.',
      },
      {
        q: 'Name the manipulated, responding and TWO controlled variables.',
        marks: 3, command: 'Name',
        points: ['Manipulated: particle size (surface area) of calcium carbonate', 'Responding: volume of carbon dioxide produced in a fixed time (or time to collect a fixed volume)', 'Controlled: two of mass of calcium carbonate, volume and concentration of acid, temperature'],
        model: 'Manipulated: particle size. Responding: volume of carbon dioxide collected in 60 s. Controlled: the mass of calcium carbonate (2.0 g), and the volume (40 cm³) and concentration (1.0 mol dm⁻³) of acid, all at room temperature.',
      },
      {
        q: 'Write the method.',
        marks: 4, command: 'Describe',
        points: ['Measure 40 cm³ of acid into the flask; weigh 2.0 g of large chips', 'Add the chips, insert the bung connected to the gas syringe and start the stopwatch at once', 'Record the volume of gas every 10 s (or after a fixed time)', 'Repeat with small chips and with powder, keeping everything else the same; repeat each to check results'],
        model: '1. Measure 40 cm³ of 1.0 mol dm⁻³ hydrochloric acid into the conical flask. 2. Weigh 2.0 g of large chips. 3. Add the chips, quickly insert the bung connected to the gas syringe and start the stopwatch. 4. Record the volume of gas every 10 s for 2 minutes. 5. Repeat with 2.0 g of small chips and then 2.0 g of powder. 6. Repeat each run and average.',
      },
      {
        q: 'Draw up a results table.',
        marks: 2, command: 'Draw',
        points: ['Columns for time / s and volume of gas / cm³ for each particle size', 'Headings with units, no units in the body'],
        model: 'Columns: Time / s | Volume of CO₂ with large chips / cm³ | with small chips / cm³ | with powder / cm³.',
      },
      {
        q: 'State the results you would expect if the hypothesis is correct.',
        marks: 1, command: 'State',
        points: ['The powder gives the largest volume of gas in a given time (steepest curve), then small chips, then large chips'],
        model: 'The powder will produce gas fastest and large chips slowest, so the powder\'s curve will be steepest at the start.',
      },
      {
        q: 'Give ONE precaution and ONE limitation.',
        marks: 2, command: 'Give',
        points: ['Precaution: e.g. insert the bung immediately so no gas escapes / use the same batch of acid / wear goggles', 'Limitation: e.g. chips are not all exactly the same size / some gas escapes before the bung is inserted / temperature in the lab may change'],
        model: 'Precaution: insert the bung immediately after adding the solid. Limitation: the chips within each size group are not identical in size.',
      },
    ],
  },
  {
    id: 'p3-pd-reactivity',
    skill: 'pd',
    title: 'Plan: which metal is most reactive?',
    kind: 'Extended response',
    topics: ['C1', 'A11'],
    intro:
      'You are given powders of three metals, P, Q and R, and copper(II) sulfate solution. Plan an experiment to put P, Q and R in order of reactivity by measuring temperature changes.',
    parts: [
      {
        q: 'State a hypothesis.',
        marks: 1, command: 'State',
        points: ['The more reactive the metal, the greater the temperature rise when it reacts with copper(II) sulfate solution'],
        model: 'The more reactive the metal, the larger the temperature rise when it displaces copper from copper(II) sulfate solution.',
      },
      {
        q: 'Write the method, naming what you keep the same.',
        marks: 4, command: 'Describe',
        points: ['Place a measured volume (e.g. 25 cm³) of copper(II) sulfate solution of fixed concentration in a polystyrene cup; record the starting temperature', 'Add a fixed mass (e.g. 1.0 g, an excess) of metal P, stir and record the highest temperature', 'Repeat with Q and R using fresh solution', 'Keep the same volume and concentration of solution, the same mass and powder form of each metal, and the same cup'],
        model: '1. Put 25 cm³ of 1.0 mol dm⁻³ copper(II) sulfate solution in a polystyrene cup and record its temperature. 2. Add 1.0 g of powdered P, stir and record the highest temperature reached. 3. Repeat with Q and with R, each time using fresh solution. Keep the volume and concentration of solution, the mass of metal and the particle size the same.',
      },
      {
        q: 'Draw up a results table.',
        marks: 2, command: 'Draw',
        points: ['Columns: metal; initial temperature / °C; highest temperature / °C; temperature rise / °C', 'Units in headings only'],
        model: 'Metal | Initial temperature / °C | Highest temperature / °C | Temperature rise / °C.',
      },
      {
        q: 'Explain how you will use the results to decide the order of reactivity.',
        marks: 2, command: 'Explain',
        points: ['The metal giving the largest temperature rise is the most reactive', 'A metal giving no rise and no colour change is less reactive than copper'],
        model: 'The larger the temperature rise, the more energy released and the more reactive the metal. Rank them from largest to smallest rise; a metal giving no change is below copper in the series.',
      },
      {
        q: 'Besides the temperature rise, what would you SEE when a metal more reactive than copper is added?',
        marks: 2, command: 'State',
        points: ['The blue colour of the solution fades', 'A pink-brown (red-brown) solid, copper, forms'],
        model: 'The blue solution becomes paler and a pink-brown deposit of copper forms.',
      },
      {
        q: 'Give one assumption and one limitation.',
        marks: 2, command: 'Give',
        points: ['Assumption: e.g. all the heat released goes into the solution / the metals have the same particle size / the metals form ions of the same charge', 'Limitation: e.g. heat is lost to the surroundings / a coating of copper may slow the reaction'],
        model: 'Assumption: the heat lost from the cup is the same in each run. Limitation: copper coating the metal powder can stop it reacting completely.',
      },
    ],
  },
  {
    id: 'p3-pd-antacid',
    skill: 'pd',
    title: 'Plan: which antacid is best value?',
    kind: 'Extended response',
    topics: ['A7', 'A6'],
    intro:
      'Two brands of antacid tablet, A and B, both contain a base. Plan an experiment to find which brand neutralises more hydrochloric acid per tablet.',
    parts: [
      {
        q: 'State a hypothesis and an aim.',
        marks: 2, command: 'State',
        points: ['A testable hypothesis, e.g. "one tablet of brand A neutralises more acid than one tablet of brand B"', 'Aim: to compare the volume of hydrochloric acid neutralised by one tablet of each brand'],
        model: 'Hypothesis: one tablet of brand A neutralises a greater volume of acid than one tablet of brand B. Aim: to compare the volume of 0.10 mol dm⁻³ hydrochloric acid neutralised by one tablet of each brand.',
      },
      {
        q: 'Describe how you would carry out the experiment.',
        marks: 5, command: 'Describe',
        points: ['Crush one tablet and add it to a conical flask with distilled water (e.g. 25 cm³)', 'Add a few drops of a suitable indicator (methyl orange)', 'Fill a burette with hydrochloric acid of known concentration and record the initial reading', 'Add acid, swirling, until the indicator just changes colour permanently; record the final reading', 'Repeat with another tablet of the same brand until results agree, then repeat with brand B'],
        model: '1. Crush one tablet of brand A and wash it into a conical flask with 25 cm³ of distilled water. 2. Add three drops of methyl orange. 3. Fill a burette with 0.10 mol dm⁻³ hydrochloric acid and record the reading. 4. Run in acid while swirling until the colour just turns from yellow to orange, and record the final reading. 5. Repeat with more tablets of A until two results agree within 0.10 cm³, then do the same for brand B.',
      },
      {
        q: 'Name the manipulated, responding and one controlled variable.',
        marks: 3, command: 'Name',
        points: ['Manipulated: the brand of antacid', 'Responding: the volume of acid needed to neutralise one tablet', 'Controlled: e.g. concentration of acid / one whole tablet each time / same indicator / same volume of water'],
        model: 'Manipulated: brand. Responding: volume of acid needed to neutralise one tablet. Controlled: the concentration of acid.',
      },
      {
        q: 'Explain how you will decide which brand is better value.',
        marks: 2, command: 'Explain',
        points: ['The brand needing the larger volume of acid neutralises more acid per tablet', 'Compare volume per tablet with the price per tablet (volume of acid neutralised per dollar)'],
        model: 'The brand that needs more acid neutralises more per tablet. Divide that volume by the cost of one tablet; the higher figure is the better value.',
      },
      {
        q: 'Give one limitation of using an indicator with a crushed tablet.',
        marks: 1, command: 'Give',
        points: ['The tablet may contain insoluble fillers or colouring that make the colour change hard to see / the base may react slowly so the end point drifts'],
        model: 'Insoluble fillers make the mixture cloudy, so the colour change at the end point is hard to judge.',
      },
    ],
  },
];

export const P3_TOTAL = (q: P2Question) => q.parts.reduce((s, p) => s + p.marks, 0);

/** Scale-reading drills. Each instrument is read to the precision examiners expect. */
export interface ScaleTask {
  kind: 'burette' | 'thermometer' | 'cylinder';
  value: number;
  /** The smallest step a correct reading can be in. */
  step: number;
  decimals: number;
  unit: string;
}

export function makeScaleTask(rand: () => number, kind?: ScaleTask['kind']): ScaleTask {
  const k = kind ?? (['burette', 'thermometer', 'cylinder'] as const)[Math.floor(rand() * 3)];
  if (k === 'burette') {
    // 0.05 cm³ steps between 1.00 and 48.95
    const v = Math.round((1 + rand() * 47.95) * 20) / 20;
    return { kind: k, value: v, step: 0.05, decimals: 2, unit: 'cm³' };
  }
  if (k === 'thermometer') {
    const v = Math.round((15 + rand() * 80) * 2) / 2;
    return { kind: k, value: v, step: 0.5, decimals: 1, unit: '°C' };
  }
  const v = Math.round((5 + rand() * 90) * 2) / 2;
  return { kind: k, value: v, step: 0.5, decimals: 1, unit: 'cm³' };
}

/** Correct value and recorded to the right number of decimal places. */
export function checkScale(t: ScaleTask, typed: string): { ok: boolean; precisionOk: boolean; valueOk: boolean } {
  const s = typed.trim().replace(',', '.');
  const n = Number(s);
  const dp = s.includes('.') ? s.split('.')[1].length : 0;
  const valueOk = Number.isFinite(n) && Math.abs(n - t.value) <= t.step / 2 + 1e-9;
  const precisionOk = dp === t.decimals;
  return { ok: valueOk && precisionOk, precisionOk, valueOk };
}
