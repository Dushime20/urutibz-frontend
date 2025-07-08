import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Badge,
  AIBadge,
  VerificationBadge,
  TrustScore,
  CurrencySelector,
  LanguageSelector,
  ProductCard,
  CategoryCard,
} from '../components/ui/DesignSystem';
import { Camera, Laptop, Wrench, Dumbbell, Home, Car } from 'lucide-react';

const DesignSystemShowcase: React.FC = () => {
  const currencies = [
    { code: 'USD', symbol: '$', flag: '🇺🇸' },
    { code: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
    { code: 'KES', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'UGX', symbol: 'USh', flag: '🇺🇬' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="content-grid max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-platform-dark-grey mb-4">
            UrutiBz Design System
          </h1>
          <p className="text-lg text-platform-grey">
            AI-Powered International Peer-to-Peer Rental Platform
          </p>
        </div>

        {/* Color Palette */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Color Palette</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-active rounded-platform mb-2"></div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-platform-grey">#00AAA9</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-active-dark rounded-platform mb-2"></div>
                <p className="text-sm font-medium">Active Dark</p>
                <p className="text-xs text-platform-grey">#003232</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-platform-grey rounded-platform mb-2"></div>
                <p className="text-sm font-medium">Platform Grey</p>
                <p className="text-xs text-platform-grey">#888888</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-platform-dark-grey rounded-platform mb-2"></div>
                <p className="text-sm font-medium">Dark Grey</p>
                <p className="text-xs text-platform-grey">#535353</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-platform-light-grey rounded-platform mb-2"></div>
                <p className="text-sm font-medium">Light Grey</p>
                <p className="text-xs text-platform-grey">#DEDEDE</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Buttons</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Variants</h3>
                <div className="space-y-2">
                  <Button variant="primary" className="w-full">Primary</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                  <Button variant="danger" className="w-full">Danger</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sizes</h3>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">Small</Button>
                  <Button size="md" className="w-full">Medium</Button>
                  <Button size="lg" className="w-full">Large</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">States</h3>
                <div className="space-y-2">
                  <Button className="w-full">Normal</Button>
                  <Button loading className="w-full">Loading</Button>
                  <Button disabled className="w-full">Disabled</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Form Elements */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Form Elements</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />
                <Input
                  label="Error Example"
                  type="text"
                  placeholder="This field has an error"
                  error="This field is required"
                />
              </div>
              <div className="space-y-4">
                <Select
                  label="Select Option"
                  options={selectOptions}
                />
                <div className="space-y-2">
                  <label className="form-label">International Selectors</label>
                  <div className="flex space-x-2">
                    <CurrencySelector currencies={currencies} />
                    <LanguageSelector languages={languages} />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Badges</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Status Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="grey">Grey</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Special Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <AIBadge>AI Recommended</AIBadge>
                  <VerificationBadge verified={true}>Verified</VerificationBadge>
                  <VerificationBadge verified={false}>Pending</VerificationBadge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Trust Score */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Trust Score</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <TrustScore score={95} />
              <TrustScore score={78} />
              <TrustScore score={45} />
            </div>
          </CardBody>
        </Card>

        {/* Category Cards */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Category Cards</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <CategoryCard
                icon={<Camera className="w-8 h-8" />}
                title="Photography"
                count={1234}
              />
              <CategoryCard
                icon={<Laptop className="w-8 h-8" />}
                title="Electronics"
                count={856}
              />
              <CategoryCard
                icon={<Wrench className="w-8 h-8" />}
                title="Tools"
                count={642}
              />
              <CategoryCard
                icon={<Dumbbell className="w-8 h-8" />}
                title="Sports"
                count={423}
              />
              <CategoryCard
                icon={<Home className="w-8 h-8" />}
                title="Home"
                count={789}
              />
              <CategoryCard
                icon={<Car className="w-8 h-8" />}
                title="Vehicles"
                count={312}
              />
            </div>
          </CardBody>
        </Card>

        {/* Product Cards */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Product Cards</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCard
                image="/assets/img/cars/car-1.jpg"
                title="Canon EOS R5 Camera"
                price="$50/day"
                rating={4.8}
                location="Kigali, Rwanda"
                aiRecommended={true}
              />
              <ProductCard
                image="/assets/img/cars/car-2.jpg"
                title="MacBook Pro 16-inch"
                price="$35/day"
                rating={4.9}
                location="Nairobi, Kenya"
                aiRecommended={false}
              />
              <ProductCard
                image="/assets/img/cars/car-3.jpg"
                title="Professional Drill Set"
                price="$15/day"
                rating={4.6}
                location="Kampala, Uganda"
                aiRecommended={true}
              />
            </div>
          </CardBody>
        </Card>

        {/* Typography */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Typography</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1 - Outfit Bold</h1>
                <p className="text-sm text-platform-grey">40px / 48px line-height</p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold">Heading 2 - Outfit Semibold</h2>
                <p className="text-sm text-platform-grey">32px / 42px line-height</p>
              </div>
              <div>
                <h3 className="text-2xl font-medium">Heading 3 - Outfit Medium</h3>
                <p className="text-sm text-platform-grey">24px / 32px line-height</p>
              </div>
              <div>
                <p className="text-base">Body text - Inter Regular (16px / 24px line-height)</p>
              </div>
              <div>
                <p className="text-sm text-platform-grey">Small text - Inter Regular (14px / 20px line-height)</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
