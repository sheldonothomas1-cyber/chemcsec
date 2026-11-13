// Curated links and SBA guidance. Links only: nothing from these sources is copied into the app.

export interface Resource {
  name: string;
  url: string;
  kind: string;
  cost: 'Free' | 'Paid';
  note: string;
}

export const RESOURCES: { group: string; items: Resource[] }[] = [
  {
    group: 'Official CXC material',
    items: [
      { name: 'CSEC Chemistry syllabus, specimen papers and mark schemes (eBook)', url: 'http://cxc-store.com/csec-chemistry-syllabus-specimen-paper-mark-scheme-and-subject-reports-ebook.html', kind: 'Syllabus', cost: 'Free', note: 'The official blueprint. Free with a CXC Store account. Read the objectives for each section against this app\'s topic map.' },
      { name: 'CXC subject reports', url: 'https://www.cxc.org/subject-reports/', kind: 'Examiner reports', cost: 'Free', note: 'Examiners explain where candidates lost marks in each sitting. Read the latest two before your exam.' },
      { name: 'CSEC Chemistry past papers (eBook)', url: 'https://cxc-store.com/book-csecr-chemistry-past-papers-ebook-pdf.html', kind: 'Past papers', cost: 'Paid', note: 'About USD 8. For your personal use only. The best timed practice once you are scoring over 60% on mocks here.' },
      { name: 'CXC SBA Handbook', url: 'http://devcxcedu.wpengine.com/wp-content/uploads/2020/11/SBA-Handbook-2020.pdf', kind: 'SBA policy', cost: 'Free', note: 'How school-based assessment is run and moderated.' },
    ],
  },
  {
    group: 'Textbooks and notes',
    items: [
      { name: 'OpenStax Chemistry 2e', url: 'https://openstax.org/books/chemistry-2e', kind: 'Open textbook', cost: 'Free', note: 'A full, peer-reviewed textbook (CC BY-NC-SA 4.0). Goes deeper than CSEC needs; use it when a lesson here leaves you wanting more.' },
      { name: 'LibreTexts Chemistry', url: 'https://chem.libretexts.org', kind: 'Open library', cost: 'Free', note: 'Thousands of open pages. Search for a topic by name.' },
      { name: 'Chemistry for CSEC Study Guide (flipbook)', url: 'https://online.fliphtml5.com/tmlho/phcl/#p=18', kind: 'Study guide', cost: 'Free', note: 'Your saved reading link. This is a published Oxford University Press book, so the app links to it and copies nothing from it.' },
      { name: 'Oxford CXC Study Guide: Chemistry', url: 'https://global.oup.com/education/product/9781408522486/', kind: 'Study guide', cost: 'Paid', note: 'The publisher\'s page for the printed study guide.' },
      { name: 'CK-12 Chemistry', url: 'https://www.ck12.org/chemistry/', kind: 'FlexBooks', cost: 'Free', note: 'Short readings with built-in practice.' },
    ],
  },
  {
    group: 'Simulations and virtual labs',
    items: [
      { name: 'PhET simulations', url: 'https://phet.colorado.edu', kind: 'Simulations', cost: 'Free', note: 'Balancing equations, molarity, pH scale, isotopes and more. Several are built into the lessons here.' },
      { name: 'ChemCollective virtual labs', url: 'https://chemcollective.org', kind: 'Virtual labs', cost: 'Free', note: 'The closest free substitute for lab time: titrations and stoichiometry you carry out yourself.' },
    ],
  },
  {
    group: 'Video',
    items: [
      { name: 'CSEC Chemistry past-paper walkthroughs', url: 'https://www.youtube.com/results?search_query=CSEC+chemistry+past+paper', kind: 'YouTube', cost: 'Free', note: 'Worked solutions to real papers by Caribbean teachers.' },
      { name: 'The Animated Chem Tutor', url: 'https://www.youtube.com/results?search_query=The+Animated+Chem+Tutor+CXC', kind: 'YouTube', cost: 'Free', note: 'CSEC Paper 1 solutions explained step by step.' },
      { name: 'Science with Mr. Knight', url: 'https://www.youtube.com/results?search_query=Science+with+Mr.+Knight+CSEC', kind: 'YouTube', cost: 'Free', note: 'A fast CSEC Chemistry refresher for the last weeks.' },
      { name: 'Khan Academy Chemistry', url: 'https://www.khanacademy.org/science/chemistry', kind: 'Video and practice', cost: 'Free', note: 'Calm, step-by-step explanations when you need a topic from the beginning.' },
      { name: 'CrashCourse Chemistry', url: 'https://www.youtube.com/@crashcourse', kind: 'YouTube', cost: 'Free', note: 'Fast and funny. Good for a second look, too quick for a first one.' },
    ],
  },
];

export interface SbaSkill {
  id: string;
  name: string;
  about: string;
  checks: string[];
}

export const SBA_SKILLS: SbaSkill[] = [
  {
    id: 'pd', name: 'Planning and designing',
    about: 'You are given a problem and must design an investigation to solve it.',
    checks: [
      'My hypothesis is a testable statement that links two variables',
      'My aim says exactly what I am investigating',
      'I have listed all apparatus and materials, with sizes and concentrations',
      'My method is numbered, in order, and someone else could follow it',
      'I have named the variable I change, the one I measure and the ones I keep constant',
      'I have said what results would support my hypothesis',
      'I have given at least one precaution and one limitation',
    ],
  },
  {
    id: 'mm', name: 'Manipulation and measurement',
    about: 'Marked while you work: how you handle apparatus and take readings.',
    checks: [
      'I read the burette and measuring cylinder at eye level, from the bottom of the meniscus',
      'I record burette readings to two decimal places',
      'I rinse the burette and pipette with the solutions they will contain',
      'I swirl the flask and add the titrant drop by drop near the end point',
      'I repeat until two titres agree within 0.10 cm³',
      'I zero the balance and let it settle before recording a mass',
    ],
  },
  {
    id: 'orr', name: 'Observation, recording and reporting',
    about: 'What you saw, set out so anyone can read it.',
    checks: [
      'My table has a title, and every column has a heading with units',
      'All readings in a column have the same number of decimal places',
      'I wrote what I SAW (colour, precipitate, gas, temperature change), not what I think it means',
      'I described precipitates by colour and whether they dissolve in excess',
      'My graph has labelled axes with units, a sensible scale and a best-fit line or curve',
      'My report follows the standard headings and is written in the past tense',
    ],
  },
  {
    id: 'ai', name: 'Analysis and interpretation',
    about: 'What your results mean.',
    checks: [
      'Every calculation shows its working and has units on the answer',
      'Each inference is tied to a specific observation',
      'I wrote balanced equations (ionic where appropriate) for the reactions',
      'I explained my results using chemistry, not just described them again',
      'I named real sources of error and said how each affects the result',
      'My conclusion answers the aim in one or two sentences',
    ],
  },
];

export const SBA_SKELETON: [heading: string, prompt: string][] = [
  ['Title', 'A short name for the experiment.'],
  ['Aim', 'To investigate / determine / identify ...'],
  ['Apparatus and materials', 'List everything, with sizes and concentrations.'],
  ['Method', 'Numbered steps in the past tense. Include what you measured and how.'],
  ['Results', 'A titled table with units. Add a graph if you measured a trend.'],
  ['Calculations', 'Formula, substitution, answer with unit.'],
  ['Discussion', 'Explain the results with theory and equations. Compare with what you expected.'],
  ['Sources of error and precautions', 'What could have made the result too high or too low? What did you do about it?'],
  ['Conclusion', 'One or two sentences that answer the aim.'],
];
