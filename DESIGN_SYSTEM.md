# UrutiBz Design System Documentation

## Overview
This design system provides a comprehensive set of components, tokens, and guidelines for building the UrutiBz AI-powered international peer-to-peer rental platform.

## Core Principles

### 1. Consistency
- Unified visual language across all interfaces
- Predictable interaction patterns
- Consistent spacing and typography

### 2. Accessibility
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation support
- Screen reader friendly

### 3. International Support
- Multi-language typography
- Currency and date formatting
- Cultural color considerations
- RTL language preparation

### 4. AI Integration
- Clear AI indicators and badges
- Transparency in AI recommendations
- Confidence scoring visualization
- Smart interaction patterns

## Color System

### Primary Colors
- **Active**: `rgb(0, 170, 169)` / `#00AAA9` - Main brand color
- **Active Dark**: `rgb(0, 50, 50)` / `#003232` - Darker variant for emphasis
- **Platform Grey**: `rgb(136, 136, 136)` / `#888888` - Body text and secondary elements
- **Platform Dark Grey**: `rgb(83, 83, 83)` / `#535353` - Headings and primary text
- **Platform Light Grey**: `rgb(222, 222, 222)` / `#DEDEDE` - Borders and backgrounds

### Status Colors
- **Error**: `rgb(235, 0, 0)` / `#EB0000` - Error states and warnings
- **Success**: `#22c55e` - Success states and confirmations
- **Warning**: `#f59e0b` - Warning states and cautions

### Usage Guidelines
- Use **Active** for primary actions, links, and brand elements
- Use **Active Dark** for hover states and emphasis
- Use **Platform Grey** for secondary text and icons
- Use **Platform Dark Grey** for primary text and headings
- Use **Platform Light Grey** for borders, dividers, and subtle backgrounds

## Typography

### Font Stack
- **Primary**: Outfit (headings, UI elements)
- **Secondary**: Inter (body text, forms)
- **Fallback**: system-ui, sans-serif

### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (UI elements)
- **Semibold**: 600 (headings, important text)
- **Bold**: 700 (emphasis, titles)

### Type Scale
```css
/* Headings */
h1: 2.5rem (40px) / 1.2 line-height
h2: 2rem (32px) / 1.3 line-height
h3: 1.5rem (24px) / 1.4 line-height
h4: 1.25rem (20px) / 1.5 line-height
h5: 1.125rem (18px) / 1.5 line-height
h6: 1rem (16px) / 1.5 line-height

/* Body */
Large: 1.125rem (18px) / 1.6 line-height
Base: 1rem (16px) / 1.5 line-height
Small: 0.875rem (14px) / 1.4 line-height
XSmall: 0.75rem (12px) / 1.3 line-height
```

## Spacing System

### Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Usage
- Use consistent spacing for margins and padding
- Follow the 8px grid system
- Use larger spacing for section separation
- Use smaller spacing for related elements

## Components

### Buttons

#### Primary Button
```jsx
<Button variant="primary" size="md">
  Primary Action
</Button>
```
- Use for primary actions
- Maximum one per section
- High contrast and emphasis

#### Secondary Button
```jsx
<Button variant="secondary" size="md">
  Secondary Action
</Button>
```
- Use for secondary actions
- Can have multiple per section
- Lower emphasis than primary

#### Outline Button
```jsx
<Button variant="outline" size="md">
  Outline Action
</Button>
```
- Use for tertiary actions
- Good for ghost-like actions
- Maintains brand connection

### Cards

#### Basic Card
```jsx
<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

#### Interactive Card
```jsx
<Card interactive>
  <CardBody>
    <h3>Interactive Card</h3>
    <p>Hover and click interactions</p>
  </CardBody>
</Card>
```

### Forms

#### Input Field
```jsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error="Please enter a valid email"
/>
```

#### Select Field
```jsx
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'rw', label: 'Rwanda' },
    { value: 'ke', label: 'Kenya' }
  ]}
/>
```

### Badges

#### Status Badge
```jsx
<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

#### AI Badge
```jsx
<AIBadge>AI Recommended</AIBadge>
```

#### Verification Badge
```jsx
<VerificationBadge verified={true}>
  ID Verified
</VerificationBadge>
```

### International Components

#### Currency Selector
```jsx
<CurrencySelector
  currencies={[
    { code: 'USD', symbol: '$', flag: '🇺🇸' },
    { code: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
    { code: 'KES', symbol: 'KSh', flag: '🇰🇪' }
  ]}
/>
```

#### Language Selector
```jsx
<LanguageSelector
  languages={[
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ]}
/>
```

### Product Components

#### Product Card
```jsx
<ProductCard
  image="/path/to/image.jpg"
  title="Canon EOS R5"
  price="$50/day"
  rating={4.8}
  location="Kigali, Rwanda"
  aiRecommended={true}
/>
```

#### Category Card
```jsx
<CategoryCard
  icon={<CameraIcon />}
  title="Photography"
  count={1234}
/>
```

### Trust & Security

#### Trust Score
```jsx
<TrustScore score={95} />
```

#### Security Indicator
```jsx
<div className="security-indicator">
  <ShieldIcon className="w-4 h-4 mr-1" />
  SSL Secured
</div>
```

## Layout Guidelines

### Grid System
- Use the responsive grid: `grid-responsive`
- Content container: `content-grid`
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Responsive Design
- Mobile-first approach
- Touch-friendly interface (44px minimum touch targets)
- Flexible typography and spacing
- Optimized images and assets

## Animation Guidelines

### Micro-interactions
- Button hover states: 200ms ease-in-out
- Card hover effects: 200ms ease-in-out
- Loading states: Smooth, non-intrusive

### Page Transitions
- Fade in: 300ms ease-in-out
- Slide up: 300ms ease-out
- Scale in: 200ms ease-out

### Performance
- Use CSS transforms for animations
- Avoid animating properties that cause reflow
- Respect user preferences for reduced motion

## Accessibility Guidelines

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Never rely solely on color to convey information

### Keyboard Navigation
- All interactive elements must be focusable
- Logical tab order
- Visible focus indicators
- Escape key support for modals

### Screen Readers
- Proper semantic HTML
- ARIA labels and descriptions
- Alternative text for images
- Status updates for dynamic content

## AI Integration Guidelines

### AI Indicators
- Always label AI-generated content
- Provide confidence scores when relevant
- Allow users to provide feedback
- Explain AI recommendations

### Transparency
- Clear "Why this recommendation?" explanations
- Confidence levels (High, Medium, Low)
- Option to disable AI features
- Human override capabilities

## International Considerations

### Localization
- Text expansion (allow 30% more space)
- Number and date formatting
- Currency symbol placement
- Time zone considerations

### Cultural Sensitivity
- Color meanings vary by culture
- Icon interpretations
- Reading patterns (LTR vs RTL)
- Cultural imagery and symbols

## Development Guidelines

### CSS Classes
- Use semantic class names
- Follow BEM methodology when needed
- Prefer utility classes for simple styles
- Group related styles in components

### Component Structure
- Single responsibility principle
- Composable and reusable
- Proper prop typing with TypeScript
- Consistent naming conventions

### Performance
- Optimize bundle size
- Lazy load components when appropriate
- Use CSS-in-JS sparingly
- Minimize runtime style calculations

## Testing Guidelines

### Visual Testing
- Cross-browser compatibility
- Device testing (mobile, tablet, desktop)
- High contrast mode
- Zoom testing (up to 200%)

### Accessibility Testing
- Screen reader testing
- Keyboard navigation
- Color contrast validation
- ARIA attribute verification

### Performance Testing
- Load time optimization
- Animation performance
- Memory usage monitoring
- Network throttling tests

## Maintenance

### Updates
- Regular accessibility audits
- Performance monitoring
- User feedback integration
- Design system evolution

### Documentation
- Keep examples up to date
- Document breaking changes
- Provide migration guides
- Version control for components

---

## Quick Reference

### CSS Variables
```css
:root {
  --color-active: rgb(0, 170, 169);
  --color-active-dark: rgb(0, 50, 50);
  --font-primary: 'Outfit', 'Inter', sans-serif;
  --border-radius-md: 12px;
  --spacing-md: 1rem;
  --transition-medium: 250ms ease-in-out;
}
```

### Tailwind Classes
```css
/* Colors */
.text-active
.bg-active
.border-active

/* Typography */
.font-outfit
.font-inter

/* Spacing */
.p-md (padding: 1rem)
.m-lg (margin: 1.5rem)

/* Borders */
.rounded-platform (border-radius: 12px)
```

### Component Imports
```jsx
import {
  Button,
  Card,
  Input,
  Badge,
  AIBadge,
  ProductCard,
  CategoryCard
} from '../components/ui/DesignSystem';
```
