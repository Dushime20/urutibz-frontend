import React, { useEffect, useState } from 'react';
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
import { useToast } from '../contexts/ToastContext';
import { fetchAllProducts } from './admin/service/api'; // adjust path if needed

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;
    fetchAllProducts(token).then(result => {
      setProducts(result.data || []);
    });
  }, []);

  return (
    <div className="space-y-0">
      <HeroSection />
      <DemoNavigationSection />
      <CategorySection />
      <FeaturedRentalsSection products={products} />
      <HowItWorksSection />
      <TestimonialsSection />
      <AllCategoriesSection />
      <FeatureSection />
      <PricingSection />
      <BlogSection />
      <FaqSection />
      {/* <CTASection /> */}
      <button
        onClick={() => {
          showToast('This is a global success toast!', 'success');
          setTimeout(() => showToast('This is a global error toast!', 'error'), 2000);
        }}
        style={{ margin: '2rem', padding: '1rem 2rem', background: '#01aaa7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Show Toast Example
      </button>
    </div>
  );
};

export default HomePage;
