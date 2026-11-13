// Which visual breakdown each lesson shows, and which lab bench goes with it.
import type { ReactNode } from 'react';
import { ElectrolysisBench, IonTestsBench, MetalsBench, RatesBench } from '../lab/benches';
import { AtomVisual, BondingVisual, ChromatographyVisual, EnergyProfileVisual, GroupTrendVisual, MoleMapVisual, ParticlesVisual, PhScaleVisual, RedoxVisual } from './basic';
import { BlastFurnaceVisual, GasCollectionVisual } from './inorganic';
import { ColumnVisual, HydrocarbonVisual, OrganicFamilyVisual } from './organic';

export interface LessonVisual {
  title: string;
  render: () => ReactNode;
  /** A bench in the virtual lab that lets the learner take this further. */
  lab?: { id: string; label: string };
}

export const VISUALS: Record<string, LessonVisual> = {
  A1: { title: 'See the particles move', render: () => <ParticlesVisual /> },
  A2: { title: 'Watch a mixture separate', render: () => <ChromatographyVisual /> },
  A3: { title: 'Build an atom', render: () => <AtomVisual /> },
  A4: { title: 'Compare the shells', render: () => <GroupTrendVisual />, lab: { id: 'displacement', label: 'Test halogen displacement in the lab' } },
  A5: { title: 'See the three kinds of bonding', render: () => <BondingVisual />, lab: { id: 'elements', label: 'Combine elements in the lab' } },
  A6: { title: 'The mole map', render: () => <MoleMapVisual /> },
  A7: { title: 'Explore the pH scale', render: () => <PhScaleVisual />, lab: { id: 'titration', label: 'Run a titration in the lab' } },
  A8: { title: 'Follow the electrons', render: () => <RedoxVisual />, lab: { id: 'displacement', label: 'Try displacement reactions in the lab' } },
  A9: { title: 'Run an electrolysis cell', render: () => <ElectrolysisBench /> },
  A10: { title: 'Run the marble and acid experiment', render: () => <RatesBench /> },
  A11: { title: 'Read an energy profile', render: () => <EnergyProfileVisual /> },
  B1: { title: 'Draw the molecules', render: () => <HydrocarbonVisual /> },
  B2: { title: 'Spot the functional group', render: () => <OrganicFamilyVisual /> },
  B3: { title: 'Inside the fractionating tower', render: () => <ColumnVisual /> },
  C1: { title: 'Test the metals', render: () => <MetalsBench />, lab: { id: 'displacement', label: 'Try displacement reactions in the lab' } },
  C2: { title: 'Inside the blast furnace', render: () => <BlastFurnaceVisual />, lab: { id: 'electrolysis', label: 'See aluminium extraction in the lab' } },
  C3: { title: 'Collecting and testing gases', render: () => <GasCollectionVisual /> },
  C4: { title: 'Run the ion tests', render: () => <IonTestsBench /> },
};
