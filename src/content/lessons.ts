// One lesson per topic, in three representations (what you see, the particle picture,
// the symbols), followed by the traps examiners see every year, a worked example,
// key points and a recall question. Chemistry inside [[double brackets]] is typeset.
// Text is original to this app; the teaching sequence follows docs/research/csec-chemistry-playbook.md.

export interface Lesson {
  topic: string;
  see: string;
  picture: string;
  symbols: string;
  context?: string;
  traps: [wrong: string, fix: string][];
  worked: { q: string; steps: string[] };
  key: string[];
  check: { q: string; a: string };
  sim?: { name: string; slug: string };
}

export const LESSONS: Lesson[] = [
  {
    topic: 'A1',
    see: 'Ice melts in your hand, a puddle dries in the sun, and a pot of water bubbles on the stove. Nothing new is made in any of these changes: it is water before and water after.',
    picture:
      'Draw each particle as a circle. In a solid the circles touch in a regular pattern and only vibrate. In a liquid they still touch but slide past each other. In a gas they are far apart and move fast in all directions. The circles themselves never change - only their spacing and movement do.',
    symbols:
      'A change of state keeps the formula: [[H2O(s) -> H2O(l) -> H2O(g)]]. While a pure substance melts or boils its temperature stays constant, because the energy goes into overcoming the forces between particles rather than making them move faster.',
    context: 'Sea salt is still made in the Caribbean by letting the sun evaporate sea water in shallow ponds - evaporation happens at the surface, at any temperature.',
    traps: [
      ['Particles of a solid "melt into liquid particles".', 'The particles are identical in all three states. Only the arrangement, spacing and movement change.'],
      ['Evaporation and boiling are the same thing.', 'Evaporation happens only at the surface and at any temperature. Boiling happens throughout the liquid, with bubbles, at one fixed temperature.'],
      ['The temperature keeps rising while water boils.', 'It stays at the boiling point until all the liquid has changed state.'],
    ],
    worked: {
      q: 'Water is heated in an open beaker at sea level. Explain why the temperature stays near 100 °C while it boils.',
      steps: [
        'Heat is still being supplied, so the energy must be going somewhere.',
        'It is used to overcome the forces of attraction between the water molecules, separating them completely.',
        'It is not increasing the kinetic energy of the particles, so the temperature does not rise.',
        'The temperature rises again only after all the liquid has become gas.',
      ],
    },
    key: [
      'Solid: close, regular, vibrating. Liquid: close, random, sliding. Gas: far apart, fast, random.',
      'Flat sections on a heating curve are changes of state.',
      'Diffusion (gases and liquids spreading out) is evidence that particles move; lighter particles diffuse faster.',
      'Osmosis is the movement of water through a partially permeable membrane from a dilute to a concentrated solution.',
    ],
    check: {
      q: 'Sketch particle diagrams for ice, liquid water and steam. State ONE thing that is identical in all three.',
      a: 'The particles (water molecules) are the same size and the same substance in all three. Only the arrangement and movement differ.',
    },
    sim: { name: 'States of Matter: Basics', slug: 'states-of-matter-basics' },
  },
  {
    topic: 'A2',
    see: 'Muddy water clears if you leave it to settle; salt water never does. Black ink looks like one colour until a drop on wet paper spreads into several.',
    picture:
      'In a solution the solute particles are single ions or molecules, far too small to see or filter. In a suspension the pieces are large clumps that scatter light and settle. A colloid sits in between: clumps small enough to stay dispersed but large enough to scatter light.',
    symbols:
      'Separation works by exploiting ONE difference in property. Different particle size: filtration. Different boiling point: distillation (simple for a solid dissolved in a liquid, fractional for liquids that mix). Different solubility: crystallisation and chromatography. Liquids that do not mix: a separating funnel.',
    context: 'Rum distilleries use fractional distillation: ethanol boils at 78 °C and water at 100 °C, so the ethanol-rich vapour leaves the column first.',
    traps: [
      ['Chromatography works because "the colours travel differently".', 'Give the mechanism: each dye is carried by the moving solvent but also sticks to the paper. The more soluble a dye is in the solvent, the further it travels.'],
      ['A clear liquid must be pure.', 'Salt solution is clear but is a mixture. A pure liquid boils at one fixed temperature.'],
      ['Filtration can remove dissolved salt.', 'Dissolved particles pass straight through filter paper. Use evaporation or distillation.'],
    ],
    worked: {
      q: 'The solubility of potassium nitrate is 110 g per 100 g of water at 60 °C and 32 g per 100 g at 20 °C. A saturated solution containing 100 g of water is cooled from 60 °C to 20 °C. What mass of crystals forms?',
      steps: [
        'At 60 °C the water holds 110 g of dissolved solid.',
        'At 20 °C the same water can hold only 32 g.',
        'The difference can no longer stay dissolved: 110 - 32 = 78 g of crystals form.',
      ],
    },
    key: [
      'Element: one type of atom. Compound: elements chemically joined in fixed proportions. Mixture: not chemically joined, variable proportions.',
      'Choose the method from the property that differs, and say which property.',
      'A saturated solution holds the maximum mass of solute at that temperature.',
      'For most solids, solubility increases as temperature increases.',
    ],
    check: {
      q: 'Which method would you use to get (a) pure water from sea water, (b) sand from sea water, and what property does each rely on?',
      a: '(a) Simple distillation - water has a much lower boiling point than the dissolved salts. (b) Filtration - sand particles are too large to pass through filter paper.',
    },
    sim: { name: 'Concentration', slug: 'concentration' },
  },
  {
    topic: 'A3',
    see: 'Every sample of chlorine behaves the same way chemically, yet a mass spectrometer finds two kinds of chlorine atom with different masses.',
    picture:
      'An atom is a tiny, dense nucleus of protons (+) and neutrons (no charge) with electrons (-) arranged in shells around it. Shells fill in the order 2, 8, 8. The number of protons fixes which element it is; the electrons decide how it reacts.',
    symbols:
      'Atomic number Z = protons. Mass number A = protons + neutrons, so neutrons = A - Z. In a neutral atom electrons = protons. Isotopes have the same Z but a different A. Relative atomic mass is the weighted average of the isotopes.',
    traps: [
      ['The mass number includes electrons.', 'Electrons have almost no mass. Mass number counts protons and neutrons only.'],
      ['Isotopes react differently.', 'Isotopes have the same electrons, so the same chemistry. Only their mass (and some physical properties) differ.'],
      ['Atoms "want" a full shell.', 'Atoms have no desires. A full outer shell is a particularly stable, low-energy arrangement, so atoms tend to end up there.'],
    ],
    worked: {
      q: 'Chlorine is 75% chlorine-35 and 25% chlorine-37. Calculate its relative atomic mass.',
      steps: [
        'Multiply each isotope mass by its percentage: 75 × 35 = 2625 and 25 × 37 = 925.',
        'Add them: 2625 + 925 = 3550.',
        'Divide by 100: relative atomic mass = 35.5.',
        'Sense check: the answer is closer to 35 because chlorine-35 is more abundant.',
      ],
    },
    key: [
      'Protons identify the element. Neutrons = mass number - atomic number.',
      'Ions: more electrons than protons gives a negative ion; fewer gives a positive ion.',
      'First 20 elements fill shells 2, 8, 8, 2.',
      'Radioisotopes have uses: carbon-14 dating, cobalt-60 in cancer treatment, tracers, energy generation.',
    ],
    check: {
      q: 'A particle has 17 protons, 18 neutrons and 18 electrons. State its identity, its charge and its mass number.',
      a: '17 protons means chlorine. One more electron than protons gives a charge of 1-, so it is a chloride ion. Mass number = 17 + 18 = 35.',
    },
    sim: { name: 'Build an Atom', slug: 'build-an-atom' },
  },
  {
    topic: 'A4',
    see: 'Lithium fizzes steadily on water, sodium darts about and melts, potassium bursts into a lilac flame. Same group, same kind of reaction, growing violence.',
    picture:
      'Elements in a group have the same number of outer electrons, so they react in the same way. Going down a group, each atom has one more shell: the outer electrons are further from the nucleus and more shielded from its pull.',
    symbols:
      'Group number = outer electrons; period number = occupied shells. Metals (Groups I and II) react by LOSING electrons, which gets easier down the group, so reactivity increases. Halogens (Group VII) react by GAINING an electron, which gets harder down the group, so reactivity decreases. A more reactive halogen displaces a less reactive one: [[Cl2 + 2KBr -> 2KCl + Br2]].',
    traps: [
      ['Reactivity always increases down a group.', 'True for metals, the opposite for halogens. Always ask: does this element lose or gain electrons?'],
      ['Period number tells you the outer electrons.', 'Period = number of shells. Group = outer electrons.'],
    ],
    worked: {
      q: 'An element has the electron arrangement 2,8,7. Give its group and period and predict whether it will displace iodine from potassium iodide solution.',
      steps: [
        'Seven outer electrons: Group VII. Three shells: Period 3. The element is chlorine.',
        'Chlorine is above iodine in Group VII, so it is more reactive.',
        'It will displace iodine: [[Cl2 + 2KI -> 2KCl + I2]]. The solution turns brown.',
      ],
    },
    key: [
      'The Periodic Table is arranged in order of atomic number.',
      'Group II: reactivity increases down the group. Group VII: reactivity decreases down the group.',
      'Across Period 3: metals (Na, Mg, Al), then a metalloid (Si), then non-metals (P, S, Cl) and a noble gas (Ar).',
      'Period 3 oxides change from basic (Na, Mg) through amphoteric (Al) to acidic (Si, P, S).',
    ],
    check: {
      q: 'Why is barium more reactive than magnesium, although both have two outer electrons?',
      a: 'Barium atoms have more shells, so the two outer electrons are further from the nucleus and more shielded. They are attracted less strongly and are lost more easily.',
    },
  },
  {
    topic: 'A5',
    see: 'Table salt needs 801 °C to melt; candle wax melts in warm water. Copper wire carries a current; a plastic comb does not. The differences come from how the particles are held together.',
    picture:
      'Three pictures explain almost everything. Ionic: a giant lattice of alternating + and - ions held by strong attraction in every direction. Simple molecular: strong covalent bonds INSIDE each molecule but only weak forces BETWEEN molecules. Metallic: positive ions in a "sea" of delocalised electrons.',
    symbols:
      'Metal + non-metal: electrons are transferred, giving ions, for example [[Mg^2+]] and [[O^2-]] in [[MgO]]. Non-metal + non-metal: electrons are shared in pairs, as in [[H2O]] or [[CO2]]. To write an ionic formula, balance the charges: [[Al^3+]] and [[O^2-]] need 2 × 3+ and 3 × 2-, giving [[Al2O3]].',
    traps: [
      ['When a molecular substance melts, covalent bonds break.', 'Only the weak forces between molecules are overcome. The molecules themselves stay intact.'],
      ['Ionic compounds conduct because they contain ions.', 'They conduct only when the ions can MOVE: molten or dissolved, never as a solid.'],
      ['Dissolving salt "melts" it.', 'Water molecules pull the lattice apart and surround the ions. That is dissolving, not melting.'],
    ],
    worked: {
      q: 'Explain why solid sodium chloride does not conduct electricity but molten sodium chloride does.',
      steps: [
        'Conduction needs charged particles that are free to move.',
        'In the solid, the ions are held in fixed positions in the lattice, so they cannot carry charge.',
        'Melting breaks down the lattice; the ions are now free to move to the electrodes.',
      ],
    },
    key: [
      'Giant ionic: high melting point, conducts when molten or aqueous, often soluble in water.',
      'Simple molecular: low melting point, does not conduct.',
      'Giant covalent (diamond, silicon dioxide): very high melting point. Graphite conducts because each carbon has one delocalised electron.',
      'Metals: conduct as solids and are malleable because layers of ions slide while the electron sea holds them together.',
    ],
    check: {
      q: 'Why does graphite conduct electricity but diamond does not, when both are made only of carbon atoms?',
      a: 'In diamond each carbon uses all four outer electrons in covalent bonds. In graphite each carbon bonds to only three others, leaving one electron per atom delocalised and free to move between the layers.',
    },
  },
  {
    topic: 'A6',
    see: 'You cannot count atoms one by one, but you can weigh them. 12 g of carbon and 24 g of magnesium look very different, yet contain the same number of atoms.',
    picture:
      'A mole is a COUNT, like a dozen, only much bigger: 6.0 × 10²³ particles. The number is chosen so that one mole of any substance has a mass in grams equal to its relative formula mass.',
    symbols:
      'Every calculation uses the same three bridges. Mass to moles: divide by the formula mass. Moles to moles: use the coefficients in the balanced equation. Moles to an answer: multiply by formula mass (mass), by 24 dm³ (gas volume at room temperature and pressure), or divide by volume in dm³ (concentration).',
    context: 'A bauxite refinery uses exactly this arithmetic to work out how much alumina a shipment of ore should give.',
    traps: [
      ['"2 g of hydrogen reacts with 1 g of oxygen because the equation says 2:1."', 'Coefficients compare MOLES, never grams. Convert to moles first, every time.'],
      ['The mole is a number of grams.', 'The mole is a number of particles. Its mass depends on which substance you are counting.'],
      ['Leaving volume in cm³ in a concentration calculation.', 'Concentration is mol per dm³. Divide cm³ by 1000 first.'],
    ],
    worked: {
      q: 'What mass of carbon dioxide forms when 5.0 g of calcium carbonate is completely decomposed? [[CaCO3 -> CaO + CO2]]',
      steps: [
        'Bridge 1, mass to moles: formula mass of [[CaCO3]] = 40 + 12 + 48 = 100, so moles = 5.0 ÷ 100 = 0.050 mol.',
        'Bridge 2, mole ratio: the equation shows 1 [[CaCO3]] gives 1 [[CO2]], so 0.050 mol of [[CO2]] forms.',
        'Bridge 3, moles to mass: formula mass of [[CO2]] = 12 + 32 = 44, so mass = 0.050 × 44 = 2.2 g.',
      ],
    },
    key: [
      'moles = mass ÷ formula mass',
      'gas volume at room temperature and pressure = moles × 24 dm³',
      'concentration (mol dm⁻³) = moles ÷ volume in dm³',
      'Percentage by mass of an element = (atoms × atomic mass ÷ formula mass) × 100',
      'Empirical formula: divide each percentage by the atomic mass, then divide by the smallest result.',
    ],
    check: {
      q: 'How many moles are in 4.4 g of [[CO2]] (formula mass 44), and what volume would it occupy at room temperature and pressure?',
      a: '4.4 ÷ 44 = 0.10 mol. Volume = 0.10 × 24 = 2.4 dm³.',
    },
    sim: { name: 'Balancing Chemical Equations', slug: 'balancing-chemical-equations' },
  },
  {
    topic: 'A7',
    see: 'Lime juice is sour and turns blue litmus red. Limewash is slippery and turns red litmus blue. Mix the right amounts and you are left with something neither sour nor slippery.',
    picture:
      'An acid releases [[H+]] ions in water. Think of two separate dials: STRENGTH is the fraction of acid molecules that ionise (hydrochloric: all of them; ethanoic: a few), CONCENTRATION is how much acid is in each dm³. In neutralisation the [[H+]] and [[OH-]] ions pair up to make water; the other ions stay in solution as the salt.',
    symbols:
      'Neutralisation: [[H+ + OH- -> H2O]]. Acid + metal gives salt + hydrogen. Acid + carbonate gives salt + water + carbon dioxide. Acid + base gives salt + water. On the pH scale each step is a tenfold change in [[H+]] concentration.',
    context: 'Farmers spread limestone on acidic soils to raise the pH, and antacid tablets do the same job in your stomach.',
    traps: [
      ['Strong means concentrated.', 'Strong means fully ionised. A strong acid can be dilute, and a weak acid can be concentrated.'],
      ['Neutralisation destroys the acid and the base, leaving nothing.', 'Nothing vanishes. [[H+]] and [[OH-]] form water and the remaining ions are the salt.'],
      ['Any salt can be made by any method.', 'Choose by solubility: insoluble salts by precipitation; soluble salts from acid plus an excess of insoluble base (then filter), or by titration for sodium, potassium and ammonium salts.'],
    ],
    worked: {
      q: '25.0 cm³ of 0.100 mol dm⁻³ sodium hydroxide is exactly neutralised by 20.0 cm³ of hydrochloric acid. Find the concentration of the acid.',
      steps: [
        'Equation: [[NaOH + HCl -> NaCl + H2O]].',
        'Moles of NaOH = 0.100 × 25.0 ÷ 1000 = 0.00250 mol.',
        'Ratio is 1:1, so moles of HCl = 0.00250 mol.',
        'Concentration of HCl = 0.00250 ÷ (20.0 ÷ 1000) = 0.125 mol dm⁻³.',
      ],
    },
    key: [
      'Solubility rules: all nitrates, and all sodium, potassium and ammonium salts, are soluble.',
      'Chlorides are soluble except silver and lead(II). Sulfates are soluble except barium, lead(II) and calcium.',
      'Most carbonates and hydroxides are insoluble.',
      'Titration layout: balanced equation, moles of the known solution, mole ratio, then concentration of the unknown.',
    ],
    check: {
      q: '0.01 mol dm⁻³ hydrochloric acid and 0.01 mol dm⁻³ ethanoic acid have the same concentration. Which has the lower pH, and why?',
      a: 'Hydrochloric acid. It is a strong acid and ionises fully, so it has a higher concentration of [[H+]] ions than the partially ionised ethanoic acid.',
    },
    sim: { name: 'pH Scale', slug: 'ph-scale' },
  },
  {
    topic: 'A8',
    see: 'A shiny iron nail turns orange-brown in damp air. A zinc strip dipped in blue copper(II) sulfate grows a coat of pink-brown copper while the blue fades.',
    picture:
      'Redox is electron transfer. One particle loses electrons (it is oxidised) and another gains them (it is reduced). The two always happen together, because the electrons have to go somewhere.',
    symbols:
      'OIL RIG: Oxidation Is Loss, Reduction Is Gain of electrons. Oxidation numbers are bookkeeping: they must add up to the charge on the species, and an increase means oxidation. The reducing agent is the substance that gets oxidised; the oxidising agent is the one that gets reduced.',
    traps: [
      ['Oxidation only means adding oxygen.', 'That is the old, narrow definition. Loss of electrons covers every case, including reactions with no oxygen at all.'],
      ['The oxidising agent is the thing that is oxidised.', 'The oxidising agent does the oxidising to something else, so it is itself reduced.'],
    ],
    worked: {
      q: 'Identify the oxidising agent and the reducing agent in [[Zn + Cu^2+ -> Zn^2+ + Cu]].',
      steps: [
        'Split it into half-equations: [[Zn -> Zn^2+ + 2e-]] and [[Cu^2+ + 2e- -> Cu]].',
        'Zinc loses electrons, so zinc is oxidised. It is the reducing agent.',
        '[[Cu^2+]] gains electrons, so it is reduced. It is the oxidising agent.',
      ],
    },
    key: [
      'Oxidation: loss of electrons, gain of oxygen, or increase in oxidation number.',
      'Rules: an uncombined element is 0; oxygen is usually -2; hydrogen is usually +1; the total equals the charge.',
      'Test for a reducing agent: acidified potassium manganate(VII) turns from purple to colourless, or acidified potassium dichromate(VI) from orange to green.',
      'Test for an oxidising agent: potassium iodide solution turns from colourless to brown.',
    ],
    check: {
      q: 'In [[2Mg + O2 -> 2MgO]], which substance is reduced, and how can you tell?',
      a: 'Oxygen. Its oxidation number falls from 0 in [[O2]] to -2 in [[MgO]]: each oxygen atom gains two electrons.',
    },
  },
  {
    topic: 'A9',
    see: 'Pass a current through molten lead(II) bromide and silvery lead collects at one electrode while brown bromine vapour rises from the other.',
    picture:
      'The power supply pushes electrons into the cathode and pulls them out of the anode. Inside the liquid there are no free electrons: the charge is carried by IONS moving. Positive ions (cations) go to the cathode and gain electrons; negative ions (anions) go to the anode and lose electrons.',
    symbols:
      'Molten salts have only two ions, so there is no competition. In aqueous solutions, water adds [[H+]] and [[OH-]]. At the cathode the less reactive cation is discharged (hydrogen, unless the metal is below hydrogen, like copper). At the anode a concentrated halide is discharged; otherwise [[OH-]] gives oxygen: [[4OH- -> 2H2O + O2 + 4e-]].',
    context: 'Jamaican and Guyanese bauxite is refined to alumina, which is electrolysed to aluminium. The huge electricity cost is the reason recycling aluminium cans matters.',
    traps: [
      ['Electrons flow through the electrolyte.', 'Electrons travel only in the wires and electrodes. Ions carry the charge through the liquid.'],
      ['Sodium forms at the cathode when sodium chloride SOLUTION is electrolysed.', 'Sodium is far more reactive than hydrogen, so [[H+]] from water is discharged instead and hydrogen gas forms.'],
    ],
    worked: {
      q: 'Predict the products of the electrolysis of concentrated aqueous sodium chloride with inert electrodes, with half-equations.',
      steps: [
        'Ions present: [[Na+]], [[Cl-]], [[H+]] and [[OH-]].',
        'Cathode: [[H+]] is discharged in preference to [[Na+]]: [[2H+ + 2e- -> H2]]. Hydrogen is produced.',
        'Anode: the solution is concentrated, so [[Cl-]] is discharged: [[2Cl- -> Cl2 + 2e-]]. Chlorine is produced.',
        '[[Na+]] and [[OH-]] are left behind, so the solution becomes sodium hydroxide.',
      ],
    },
    key: [
      'Cations to the cathode (reduction). Anions to the anode (oxidation).',
      'Charge = current × time (Q = It). One mole of electrons carries 96 500 C.',
      'Copper(II) sulfate with copper electrodes: the anode dissolves and the cathode gains copper - the basis of purifying copper.',
      'Electroplating: the object is the cathode, in a solution of the plating metal\'s ions.',
    ],
    check: {
      q: 'During the electrolysis of molten lead(II) bromide, what forms at each electrode? Give the half-equation at the cathode.',
      a: 'Lead at the cathode: [[Pb^2+ + 2e- -> Pb]]. Bromine at the anode: [[2Br- -> Br2 + 2e-]].',
    },
  },
  {
    topic: 'A10',
    see: 'A powdered antacid fizzes away in seconds while a whole tablet takes minutes. Food spoils in hours on a hot counter but lasts days in a fridge.',
    picture:
      'Particles react only when they collide with enough energy (the activation energy). Anything that makes successful collisions more frequent makes the reaction faster. In a reversible reaction, the forward and backward reactions eventually run at the same rate: dynamic equilibrium.',
    symbols:
      'More concentrated or more finely divided: collisions are more frequent. Hotter: particles move faster AND far more of them have at least the activation energy. A catalyst provides a route with lower activation energy and is not used up. For [[N2 + 3H2 <=> 2NH3]] (forward reaction exothermic), high pressure favours the side with fewer gas molecules and a lower temperature favours the exothermic direction.',
    traps: [
      ['At equilibrium the reaction has stopped.', 'Both reactions are still going, at equal rates. That is why the amounts stay constant.'],
      ['At equilibrium the amounts of reactants and products are equal.', 'The amounts are constant, not equal.'],
      ['A catalyst is slowly used up.', 'It is regenerated, so its mass and chemical nature are unchanged at the end.'],
    ],
    worked: {
      q: 'Explain, using collision theory, why powdered marble reacts faster with hydrochloric acid than lumps of the same mass.',
      steps: [
        'Powdering the marble greatly increases its total surface area.',
        'More marble particles are exposed to the acid, so acid particles collide with the surface more often.',
        'More frequent successful collisions means a faster rate. The total amount of gas made is unchanged because the mass is the same.',
      ],
    },
    key: [
      'On a volume-time graph, a steeper curve is a faster reaction; a flat line means the reaction has finished.',
      'The final volume depends on the amount of the limiting reactant, not on the rate.',
      'Haber process compromise: about 450 °C, 200 atm and an iron catalyst - an acceptable yield made quickly.',
    ],
    check: {
      q: 'For [[N2 + 3H2 <=> 2NH3]] (exothermic), state and explain the effect on the yield of ammonia of (a) raising the pressure, (b) raising the temperature.',
      a: '(a) Yield increases: there are 4 moles of gas on the left and 2 on the right, so the equilibrium shifts to the side with fewer gas molecules. (b) Yield decreases: the equilibrium shifts in the endothermic (reverse) direction to absorb the extra heat.',
    },
  },
  {
    topic: 'A11',
    see: 'A burning candle warms your hand. A cold pack from a first-aid kit turns icy when you squeeze it. Both are chemistry moving energy around.',
    picture:
      'Every reaction is a two-step energy deal. First, bonds in the reactants are broken, which TAKES energy in. Then new bonds form in the products, which GIVES energy out. The overall energy change is the difference between the two.',
    symbols:
      'Exothermic: more energy is given out than taken in, the surroundings get hotter, products sit lower on the energy profile, ΔH is negative. Endothermic: the reverse, ΔH is positive. Heat change q = m × c × ΔT, with c = 4.2 J g⁻¹ °C⁻¹ for water and dilute solutions.',
    traps: [
      ['Breaking bonds releases energy.', 'Breaking bonds always absorbs energy. Making bonds releases it.'],
      ['Exothermic means the products have more energy.', 'The energy has left the chemicals and gone to the surroundings, so the products have LESS.'],
      ['ΔH is the temperature change.', 'ΔH is an energy change in kJ per mole. The temperature change is just what you measure to calculate it.'],
    ],
    worked: {
      q: '50 cm³ of acid is mixed with 50 cm³ of alkali and the temperature rises by 6.0 °C. Calculate the heat released. (Density of solution 1.0 g cm⁻³, c = 4.2 J g⁻¹ °C⁻¹)',
      steps: [
        'Total volume = 100 cm³, so mass of solution = 100 g.',
        'q = m × c × ΔT = 100 × 4.2 × 6.0 = 2520 J.',
        'That is 2.52 kJ. The temperature rose, so the reaction is exothermic and ΔH is negative.',
      ],
    },
    key: [
      'Energy profile diagrams show reactants, products, the activation energy "hill" and ΔH.',
      'A catalyst lowers the hill but leaves the start and end levels - and so ΔH - unchanged.',
      'Experimental values are usually too small because heat is lost to the surroundings.',
    ],
    check: {
      q: 'Why does adding a catalyst speed up a reaction but leave ΔH unchanged?',
      a: 'A catalyst provides an alternative route with lower activation energy, so more collisions succeed. The energy of the reactants and of the products is unchanged, so the difference between them, ΔH, is the same.',
    },
  },
  {
    topic: 'B1',
    see: 'Cooking gas, petrol and candle wax are all hydrocarbons. They burn in the same way but one is a gas, one a liquid and one a solid, because their carbon chains have different lengths.',
    picture:
      'Carbon forms four bonds and happily chains to itself. A homologous series is a family with the same "surname" (functional group): each member has one more [[CH2]] than the last, so chemical reactions stay the same while boiling point rises steadily.',
    symbols:
      'Alkanes, CₙH₂ₙ₊₂, are saturated (single bonds only) and react by substitution in ultraviolet light: [[CH4 + Cl2 -> CH3Cl + HCl]]. Alkenes, CₙH₂ₙ, have a C=C double bond which opens to ADD atoms: [[C2H4 + Br2 -> C2H4Br2]]. Names: 1 meth-, 2 eth-, 3 prop-, 4 but-, 5 pent-, 6 hex-.',
    context: 'Trinidad and Tobago\'s natural gas is mostly methane, the first member of the alkane family.',
    traps: [
      ['Isomers are different names for the same compound.', 'Isomers have the same molecular formula but the atoms are joined in a different order, giving different compounds.'],
      ['Alkanes decolourise bromine water too.', 'Only in ultraviolet light, and slowly. Alkenes decolourise it immediately, which is the test for unsaturation.'],
    ],
    worked: {
      q: 'Draw and name the structural isomers of [[C4H10]].',
      steps: [
        'Start with the longest straight chain, four carbons: [[CH3CH2CH2CH3]], butane.',
        'Shorten the chain to three carbons and attach the fourth carbon to the middle one: [[CH3CH(CH3)CH3]], 2-methylpropane.',
        'Check each has 4 carbons and 10 hydrogens. No other arrangement is possible, so there are two isomers.',
      ],
    },
    key: [
      'Members of a homologous series: same general formula, same functional group, similar reactions, gradual change in physical properties.',
      'Complete combustion gives carbon dioxide and water; a limited air supply gives carbon monoxide or soot.',
      'Test for an alkene: bromine water changes from orange-brown to colourless.',
      'Alkenes also add hydrogen (nickel catalyst) and steam (to make alcohols).',
    ],
    check: {
      q: 'Give one chemical test to distinguish hexane from hexene, with the observation for each.',
      a: 'Shake each with bromine water. Hexene decolourises it (orange-brown to colourless). With hexane it stays orange-brown.',
    },
  },
  {
    topic: 'B2',
    see: 'Yeast turns cane juice into rum, wine left open turns to vinegar, and a mixture of the two can be made to smell of fruit.',
    picture:
      'The -OH group makes an alcohol; the -COOH group makes a carboxylic acid. An ester forms when the two join end to end and a molecule of water drops out between them.',
    symbols:
      'Fermentation: [[C6H12O6 -> 2C2H5OH + 2CO2]] (yeast, about 30 °C, no oxygen). Oxidation of ethanol with acidified potassium dichromate(VI) gives ethanoic acid, and the mixture turns from orange to green. Esterification: [[CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O]] (concentrated sulfuric acid catalyst), giving ethyl ethanoate.',
    context: 'Caribbean rum production is fermentation of molasses followed by distillation.',
    traps: [
      ['Ethanoic acid is weak because it is dilute.', 'Weak means only partly ionised. It still does everything an acid does - just more slowly.'],
      ['Fermentation needs plenty of air.', 'With oxygen present the yeast respires aerobically and the ethanol is oxidised to ethanoic acid.'],
    ],
    worked: {
      q: 'Compare making ethanol by fermentation with making it by hydration of ethene.',
      steps: [
        'Fermentation: sugar and yeast at about 30 °C without oxygen. Slow batch process, renewable raw material, product is dilute and must be distilled.',
        'Hydration: ethene and steam at about 300 °C and 60-70 atm with a phosphoric acid catalyst: [[C2H4 + H2O -> C2H5OH]].',
        'Hydration is fast, continuous and gives pure ethanol, but uses non-renewable petroleum and a lot of energy.',
      ],
    },
    key: [
      'Ethanol reacts with sodium to give hydrogen, burns to carbon dioxide and water, and is dehydrated to ethene by hot concentrated sulfuric acid.',
      'Ethanoic acid reacts with metals, bases and carbonates like any acid, forming ethanoate salts.',
      'Soap is made by boiling fats or oils with sodium hydroxide (saponification).',
      'Soapless detergents do not form scum in hard water; some are non-biodegradable or contain phosphates.',
    ],
    check: {
      q: 'Describe a test to distinguish ethanol from ethanoic acid.',
      a: 'Add sodium carbonate (or sodium hydrogencarbonate). Ethanoic acid effervesces, giving carbon dioxide; ethanol shows no reaction.',
    },
  },
  {
    topic: 'B3',
    see: 'Thick black crude oil goes into a refinery; out come cooking gas, petrol, jet fuel, diesel, lubricating oil and the bitumen on the road.',
    picture:
      'Crude oil is a mixture of hydrocarbon chains of many lengths. Short chains have weak forces between them and boil easily; long chains tangle and need more heat. A fractionating tower is hot at the bottom and cooler at the top, so each fraction condenses at its own level.',
    symbols:
      'Cracking breaks long alkanes that are in low demand into shorter alkanes plus alkenes: [[C10H22 -> C8H18 + C2H4]]. Addition polymerisation joins alkene monomers by opening their double bonds - ethene becomes poly(ethene) and nothing else is formed. Condensation polymerisation joins monomers with two functional groups and releases a small molecule such as water each time.',
    context: 'The Pointe-à-Pierre refinery in Trinidad processed crude oil this way for a century.',
    traps: [
      ['Fractional distillation breaks the molecules up.', 'It only separates them by boiling point - a physical change. Cracking is the chemical step.'],
      ['All polymers are made the same way.', 'Addition polymers need a C=C bond and give one product. Condensation polymers also release a small molecule.'],
    ],
    worked: {
      q: 'Explain why an oil company cracks some of its heavier fractions.',
      steps: [
        'Fractional distillation gives more of the long-chain fractions than customers want, and too little petrol.',
        'Cracking (heat and a catalyst) breaks the long chains into shorter, more useful alkanes for petrol.',
        'It also produces alkenes such as ethene, the raw material for plastics and ethanol.',
      ],
    },
    key: [
      'Fractions from top to bottom: refinery gas, petrol, kerosene, diesel, lubricating and fuel oils, bitumen.',
      'Down the tower: longer chains, higher boiling points, more viscous, harder to ignite.',
      'Polyesters (Terylene) and polyamides (nylon) are condensation polymers. Starch and proteins are natural condensation polymers.',
      'Most plastics are non-biodegradable; burning them can release toxic gases.',
    ],
    check: {
      q: 'State two differences between addition and condensation polymerisation.',
      a: 'Addition: monomers contain a C=C double bond and the polymer is the only product. Condensation: monomers have two functional groups and a small molecule (such as water) is released each time a link forms.',
    },
  },
  {
    topic: 'C1',
    see: 'Sodium has to be stored under oil; magnesium burns with a blinding white flame; gold lies unchanged on the sea floor for centuries.',
    picture:
      'Reactivity is how readily a metal atom gives up its outer electrons to become a positive ion. In a displacement reaction the more reactive metal hands its electrons to the ions of the less reactive one.',
    symbols:
      'Series (most reactive first): K, Na, Ca, Mg, Al, (C), Zn, Fe, Pb, (H), Cu, Ag, Au. With cold water: [[2Na + 2H2O -> 2NaOH + H2]]. With dilute acid: [[Mg + 2HCl -> MgCl2 + H2]]. Displacement: [[Fe + Cu^2+ -> Fe^2+ + Cu]].',
    traps: [
      ['Reactivity means how strong or hard the metal is.', 'Reactivity is chemical: how easily the atoms lose electrons. Sodium is very reactive and soft enough to cut with a knife.'],
      ['All metals react with dilute acids.', 'Only metals above hydrogen in the series do. Copper, silver and gold do not.'],
    ],
    worked: {
      q: 'Iron nails are placed in copper(II) sulfate solution. Write the ionic equation and state what is observed.',
      steps: [
        'Iron is above copper in the reactivity series, so it displaces copper.',
        'Ionic equation: [[Fe + Cu^2+ -> Fe^2+ + Cu]]. Iron is oxidised and [[Cu^2+]] is reduced.',
        'Observations: a red-brown solid coats the nails and the blue solution fades to pale green.',
      ],
    },
    key: [
      'Very reactive metals react with cold water; magnesium, zinc and iron react with steam.',
      'Heating carbonates: most give the oxide and carbon dioxide (sodium and potassium carbonates are stable).',
      'Heating nitrates: sodium and potassium give the nitrite and oxygen; others give the oxide, brown nitrogen dioxide and oxygen.',
      'Heating hydroxides: most give the oxide and water.',
    ],
    check: {
      q: 'Metal X displaces copper from copper(II) sulfate but does not react with zinc sulfate. Where does X sit in the reactivity series?',
      a: 'Between zinc and copper: it is more reactive than copper but less reactive than zinc (for example iron or lead).',
    },
  },
  {
    topic: 'C2',
    see: 'Iron has been smelted with charcoal for three thousand years, but aluminium was a precious metal until electricity became cheap.',
    picture:
      'An ore is a metal compound, usually the oxide. Extraction means forcing electrons back onto the metal ions. Carbon can do this for metals below it in the reactivity series; for metals above carbon, only electricity is a strong enough reducing agent.',
    symbols:
      'Blast furnace: [[C + O2 -> CO2]], then [[CO2 + C -> 2CO]], then [[Fe2O3 + 3CO -> 2Fe + 3CO2]]. Limestone removes sandy impurities: [[CaCO3 -> CaO + CO2]] and [[CaO + SiO2 -> CaSiO3]] (slag). Aluminium: alumina dissolved in molten cryolite; cathode [[Al^3+ + 3e- -> Al]], anode [[2O^2- -> O2 + 4e-]].',
    context: 'Bauxite mined in Jamaica and Guyana is refined to alumina locally, then shipped to countries with cheap electricity for the electrolysis step.',
    traps: [
      ['Coke is the main reducing agent in the blast furnace.', 'Carbon MONOXIDE does most of the reducing. Coke is the fuel and the source of the carbon monoxide.'],
      ['Cryolite is the ore of aluminium.', 'Bauxite is the ore. Cryolite is the solvent that lets alumina be electrolysed at about 950 °C instead of over 2000 °C.'],
    ],
    worked: {
      q: 'Aluminium is extracted by electrolysis but iron by reduction with coke. Explain why.',
      steps: [
        'Aluminium is above carbon in the reactivity series, so carbon cannot remove the oxygen from aluminium oxide.',
        'Electrons must be supplied directly by electrolysis of the molten oxide, which is expensive.',
        'Iron is below carbon, so carbon (as carbon monoxide) can reduce iron(III) oxide cheaply in a blast furnace.',
      ],
    },
    key: [
      'Above carbon: electrolysis. Below carbon: reduction with carbon. Unreactive metals occur native.',
      'Carbon anodes burn away in the oxygen produced and must be replaced.',
      'Rusting needs BOTH oxygen and water. Prevent it with a barrier (paint, oil, plating), by galvanising, or by alloying.',
      'Alloys are harder than pure metals because different-sized atoms stop the layers sliding.',
    ],
    check: {
      q: 'Why does galvanised iron stay protected even when the zinc coating is scratched?',
      a: 'Zinc is more reactive than iron, so it is oxidised in preference to the iron (sacrificial protection). The iron stays as the metal.',
    },
  },
  {
    topic: 'C3',
    see: 'A sharp smell rises from a bottle of household ammonia. Rain near a power station is acidic enough to etch limestone buildings. A river below a fertilised field turns green with algae.',
    picture:
      'To collect a gas, ask two questions: is it more or less dense than air, and does it dissolve in water? To dry it, pick a drying agent that will not react with it. Industrial processes are a negotiation between yield, rate and cost.',
    symbols:
      'Ammonia: [[2NH4Cl + Ca(OH)2 -> CaCl2 + 2H2O + 2NH3]]; dry with calcium oxide; collect by upward delivery. Carbon dioxide: [[CaCO3 + 2HCl -> CaCl2 + H2O + CO2]]. Oxygen: [[2H2O2 -> 2H2O + O2]] with a manganese(IV) oxide catalyst. Haber: [[N2 + 3H2 <=> 2NH3]]. Contact: [[2SO2 + O2 <=> 2SO3]] with a vanadium(V) oxide catalyst.',
    context: 'Point Lisas in Trinidad is one of the world\'s largest exporters of ammonia, made from local natural gas by the Haber process.',
    traps: [
      ['Any drying agent works for any gas.', 'Ammonia is alkaline, so it reacts with concentrated sulfuric acid, and it also reacts with calcium chloride. Use calcium oxide.'],
      ['The Haber process uses a low temperature because that gives the best yield.', 'A low temperature would give a high yield far too slowly. About 450 °C is a compromise between yield and rate.'],
    ],
    worked: {
      q: 'Explain why ammonia is collected by upward delivery and not over water.',
      steps: [
        'Ammonia is extremely soluble in water, so it cannot be collected over water.',
        'It is less dense than air, so it rises and collects at the top of an inverted container.',
        'It is therefore collected by upward delivery (downward displacement of air).',
      ],
    },
    key: [
      'Sulfur dioxide and oxides of nitrogen cause acid rain. Carbon dioxide and methane are greenhouse gases. Carbon monoxide is toxic.',
      'Nitrates and phosphates washed into waterways cause eutrophication.',
      'Hard water contains [[Ca^2+]] or [[Mg^2+]] ions. Temporary hardness is removed by boiling; permanent hardness by washing soda or ion exchange.',
      'Ammonia is mainly used to make fertilisers; sulfuric acid for fertilisers, detergents and car batteries.',
    ],
    check: {
      q: 'In the Contact process, why is sulfur trioxide absorbed in concentrated sulfuric acid instead of water?',
      a: 'Its direct reaction with water is so exothermic that it produces a mist of sulfuric acid droplets that is hard to condense. Absorbing it in concentrated acid gives oleum, which is then diluted safely.',
    },
  },
  {
    topic: 'C4',
    see: 'Add a few drops of one colourless solution to another and a coloured solid appears from nowhere. Each ion has its own signature.',
    picture:
      'A precipitate forms when two ions that make an insoluble compound meet in solution. So every test has an ionic story: name the two ions that came together and you have explained the observation.',
    symbols:
      'With sodium hydroxide: [[Cu^2+]] blue precipitate; [[Fe^2+]] green; [[Fe^3+]] red-brown; [[Ca^2+]] white, insoluble in excess; [[Al^3+]], [[Zn^2+]] and [[Pb^2+]] white, soluble in excess. Chloride: [[Ag+ + Cl- -> AgCl]] (white). Sulfate: [[Ba^2+ + SO4^2- -> BaSO4]] (white).',
    traps: [
      ['Writing the inference in the observation column.', 'Record what you SEE first ("white precipitate, soluble in excess"), then infer the ion. Never write "zinc is present" as an observation.'],
      ['"The solution went cloudy" is enough.', 'Give the colour of the precipitate and whether it dissolves in excess reagent - that is where the marks are.'],
    ],
    worked: {
      q: 'A solution gives a white precipitate with sodium hydroxide that dissolves in excess. With aqueous ammonia it gives a white precipitate that does NOT dissolve in excess. Identify the possible cations and suggest a further test.',
      steps: [
        'White and soluble in excess sodium hydroxide: [[Al^3+]], [[Zn^2+]] or [[Pb^2+]].',
        'Insoluble in excess aqueous ammonia rules out [[Zn^2+]], leaving [[Al^3+]] or [[Pb^2+]].',
        'Add potassium iodide solution: a bright yellow precipitate shows [[Pb^2+]]; no precipitate shows [[Al^3+]].',
      ],
    },
    key: [
      'Aqueous ammonia: [[Cu^2+]] gives a blue precipitate that dissolves in excess to a deep blue solution; [[Zn^2+]] white, soluble in excess.',
      'Ammonium ions: warm with sodium hydroxide; ammonia gas turns damp red litmus blue.',
      'Halides with acidified silver nitrate: chloride white, bromide cream, iodide yellow. Carbonates effervesce with acid.',
      'Gases: hydrogen pops; oxygen relights a glowing splint; carbon dioxide turns limewater milky; chlorine bleaches damp litmus.',
    ],
    check: {
      q: 'A solution gives a white precipitate with acidified barium nitrate. Which ion is present? Write the ionic equation.',
      a: 'Sulfate ions. [[Ba^2+ + SO4^2- -> BaSO4]].',
    },
  },
];

export const LESSON_BY_TOPIC: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.topic, l]));

export const phetUrl = (slug: string) => `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_en.html`;
