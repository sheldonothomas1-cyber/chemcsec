// The app's topic map for CSEC Chemistry (syllabus CXC 21/G/SYLL 13).
// Section order follows the syllabus: A Principles, B Organic, C Inorganic.
// Objective wording here is our own working draft - reconcile it against the
// official syllabus (free eBook from the CXC Store) before treating it as final.

export type SectionId = 'A' | 'B' | 'C';
export type Profile = 'KC' | 'UK' | 'XS';

export interface Objective {
  id: string;
  text: string;
}

export interface Topic {
  id: string;
  section: SectionId;
  sym: string; // two-letter tile symbol, periodic-table style
  name: string;
  blurb: string;
  prereqs: string[];
  /** Number of the 60 Paper 01 items this topic gets in a full mock (app blueprint, an estimate). */
  weight: number;
  objectives: Objective[];
}

export const SECTIONS: Record<SectionId, { name: string; note: string }> = {
  A: { name: 'Principles of chemistry', note: 'The ideas everything else is built on' },
  B: { name: 'Organic chemistry', note: 'Carbon compounds and their reactions' },
  C: { name: 'Inorganic chemistry', note: 'Metals, non-metals and identifying substances' },
};

const t = (
  id: string,
  sym: string,
  name: string,
  blurb: string,
  prereqs: string[],
  weight: number,
  objectives: string[],
): Topic => ({
  id,
  section: id[0] as SectionId,
  sym,
  name,
  blurb,
  prereqs,
  weight,
  objectives: objectives.map((text, i) => ({ id: `${id}.${i + 1}`, text })),
});

export const TOPICS: Topic[] = [
  t('A1', 'Sm', 'States of matter', 'Particles, changes of state, diffusion', [], 2, [
    'Describe solids, liquids and gases using the particle theory',
    'Explain changes of state, heating curves, and evaporation versus boiling',
    'Use diffusion and osmosis as evidence that particles move',
  ]),
  t('A2', 'Mx', 'Mixtures and separation', 'Solutions, suspensions, colloids and how to separate them', ['A1'], 3, [
    'Distinguish elements, compounds and mixtures; solutions, suspensions and colloids',
    'Choose and describe a suitable separation technique',
    'Interpret solubility and solubility curves',
  ]),
  t('A3', 'At', 'Atomic structure', 'Protons, neutrons, electrons and isotopes', [], 4, [
    'Describe the atom using atomic number and mass number',
    'Write electron arrangements for the first 20 elements and their ions',
    'Explain isotopes and calculate relative atomic mass',
  ]),
  t('A4', 'Pt', 'Periodic table', 'Groups, periods and the trends they predict', ['A3'], 3, [
    'Relate group and period to electron arrangement',
    'Describe trends in Group II and Group VII, including displacement',
    'Describe the trend across Period 3 from metals to non-metals',
  ]),
  t('A5', 'Bd', 'Bonding and structure', 'Ionic, covalent and metallic bonding and the properties they explain', ['A3'], 4, [
    'Explain ionic bonding and write formulae of ionic compounds',
    'Explain covalent bonding in simple molecules',
    'Relate structure to properties such as melting point and conductivity',
  ]),
  t('A6', 'Mo', 'The mole and equations', 'Counting particles by weighing: the three bridges', ['A3', 'A5'], 6, [
    'Calculate relative formula mass and convert between mass and moles',
    'Use the molar volume of a gas and the concentration of a solution',
    'Balance equations and calculate reacting masses',
    'Work out percentage composition and empirical formulae',
  ]),
  t('A7', 'Ac', 'Acids, bases and salts', 'pH, neutralisation, making salts and titration', ['A6'], 5, [
    'Define acids, bases and alkalis; separate strength from concentration; use the pH scale',
    'Describe the reactions of acids and write ionic equations',
    'Choose a method to prepare a given salt',
    'Carry out titration calculations',
  ]),
  t('A8', 'Rx', 'Redox', 'Oxidation and reduction as electron transfer', ['A5'], 3, [
    'Define oxidation and reduction in terms of electrons, oxygen and oxidation number',
    'Assign oxidation numbers and identify oxidising and reducing agents',
    'Recognise the colour-change tests for oxidising and reducing agents',
  ]),
  t('A9', 'El', 'Electrolysis', 'Using electricity to split compounds', ['A5', 'A8'], 4, [
    'Explain how electrolytes conduct and what happens at each electrode',
    'Predict the products of electrolysis and write half-equations',
    'Do Faraday calculations and describe industrial uses of electrolysis',
  ]),
  t('A10', 'Rt', 'Rates and equilibrium', 'How fast, how far, and why', ['A1'], 3, [
    'Explain the factors that affect rate using collision theory',
    'Interpret rate graphs and describe how rate is measured',
    'Describe dynamic equilibrium and predict how conditions shift it',
  ]),
  t('A11', 'En', 'Energetics', 'Heat given out and taken in by reactions', ['A6'], 3, [
    'Distinguish exothermic and endothermic reactions using energy profile diagrams',
    'Explain energy changes through bond breaking and bond making',
    'Calculate heat changes from temperature measurements',
  ]),
  t('B1', 'Hc', 'Hydrocarbons', 'Alkanes, alkenes, naming and isomers', ['A5'], 4, [
    'Describe homologous series, general formulae and naming',
    'Draw and recognise structural isomers',
    'Compare the reactions of alkanes and alkenes',
  ]),
  t('B2', 'Al', 'Alcohols, acids and esters', 'Ethanol, ethanoic acid and what they make together', ['B1'], 3, [
    'Describe how ethanol is made and how it reacts',
    'Describe the reactions of carboxylic acids',
    'Describe esters, soaps and detergents',
  ]),
  t('B3', 'Po', 'Petroleum and polymers', 'From crude oil to plastics', ['B1'], 2, [
    'Explain how fractional distillation separates petroleum and name uses of fractions',
    'Explain cracking and why it is needed',
    'Describe addition and condensation polymers',
  ]),
  t('C1', 'Me', 'Metals and reactivity', 'How metals react and why some react more', ['A8'], 3, [
    'Describe the reactions of metals with oxygen, water and dilute acids',
    'Use the reactivity series to predict displacement reactions',
    'Describe the action of heat on metal carbonates, nitrates and hydroxides',
  ]),
  t('C2', 'Ex', 'Extracting and using metals', 'Aluminium, iron, alloys and rust', ['C1', 'A9'], 2, [
    'Relate the extraction method to reactivity and describe the extraction of aluminium',
    'Describe the extraction of iron in the blast furnace',
    'Explain alloys, corrosion and how rusting is prevented',
  ]),
  t('C3', 'Nm', 'Non-metals', 'Gases, industry and the environment', ['A7'], 3, [
    'Describe the laboratory preparation and collection of gases',
    'Describe the Haber and Contact processes and the uses of their products',
    'Explain the environmental impact of non-metal compounds and the treatment of water',
  ]),
  t('C4', 'Qa', 'Qualitative analysis', 'Identifying ions and gases from what you observe', ['A7'], 3, [
    'Identify cations using sodium hydroxide and aqueous ammonia',
    'Identify anions using test reagents',
    'Identify gases from their tests',
  ]),
];

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((x) => [x.id, x]));
export const ALL_OBJECTIVES: Objective[] = TOPICS.flatMap((x) => x.objectives);
export const topicOf = (objectiveId: string): Topic => TOPIC_BY_ID[objectiveId.split('.')[0]];
