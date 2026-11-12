import React from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { VibeBanner } from '../components/home/VibeBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { BestsellerGrid } from '../components/home/BestsellerGrid';
import { CigarFeature } from '../components/home/CigarFeature';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-black min-h-screen">
      <HeroSlider />
      <VibeBanner />
      <CategoryGrid />
      <BestsellerGrid />
      <CigarFeature />
    </div>
  );
};

