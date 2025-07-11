import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import DemoNavigationSection from '../components/sections/DemoNavigationSection';
import CategorySection from '../components/sections/CategorySection';
import FeatureSection from '../components/sections/FeatureSection';
import FeaturedRentalsSection from '../components/sections/FeaturedRentalsSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import PricingSection from '../components/sections/PricingSection';
import BlogSection from '../components/sections/BlogSection';
import FaqSection from '../components/sections/FaqSection';
import AllCategoriesSection from '../components/sections/AllCategoriesSection';
// import CTASection from '../components/sections/CTASection';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <DemoNavigationSection />
      <CategorySection />
      <FeaturedRentalsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <AllCategoriesSection />
      <FeatureSection />
      <PricingSection />
      <BlogSection />
      <FaqSection />
      {/* <CTASection /> */}
    </div>
  );
};

export default HomePage;
