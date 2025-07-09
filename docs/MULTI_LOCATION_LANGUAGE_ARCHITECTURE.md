# Multi-Location and Multi-Language Architecture

## Overview
Uruti eRental is designed as a scalable peer-to-peer rental platform that supports multiple locations and languages to facilitate expansion across different regions and markets.

## Multi-Location Management

### Location Structure
Each location in the platform includes:
- **Basic Info**: Name, country, timezone, currency
- **Geographic Data**: Coordinates for mapping and geolocation
- **Analytics**: Users, items, bookings, and revenue per location
- **Status**: Active/Inactive for operational control

### Location Features
1. **Location-Aware Filtering**: Admin can filter all data by specific locations
2. **Regional Analytics**: Separate metrics for each operational location
3. **Currency Management**: Each location supports its local currency
4. **Timezone Handling**: Proper time zone support for bookings and notifications

### Implementation Benefits
- **Scalability**: Easy expansion to new cities/countries
- **Localized Management**: Region-specific administration
- **Performance**: Location-based data partitioning
- **Compliance**: Local regulations and requirements

## Multi-Language Support

### Language Structure
Each language includes:
- **Language Code**: ISO standard language codes (en, rw, fr, sw)
- **Display Names**: Both English and native language names
- **Completion Status**: Translation progress tracking
- **Default Language**: Primary language fallback
- **Regional Flags**: Visual identification

### Language Features
1. **Translation Management**: Track completion percentage for each language
2. **Dynamic Language Switching**: Real-time language changes in admin panel
3. **Fallback System**: Default to English if translation missing
4. **Progress Tracking**: Monitor translation completion status

### Implementation Strategy
- **Key-Value Translation System**: Use translation keys for all UI text
- **Lazy Loading**: Load translations on demand for performance
- **Version Control**: Track translation updates and changes
- **Quality Assurance**: Review system for translation accuracy

## Technical Architecture

### Database Design
```sql
-- Locations Table
CREATE TABLE locations (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  country VARCHAR(50),
  timezone VARCHAR(50),
  currency VARCHAR(3),
  coordinates JSON,
  status ENUM('Active', 'Inactive'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Languages Table
CREATE TABLE languages (
  id INT PRIMARY KEY,
  code VARCHAR(5),
  name VARCHAR(50),
  native_name VARCHAR(50),
  flag VARCHAR(10),
  status ENUM('Active', 'In Progress', 'Inactive'),
  completeness INT,
  is_default BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Translations Table
CREATE TABLE translations (
  id INT PRIMARY KEY,
  language_code VARCHAR(5),
  translation_key VARCHAR(255),
  translation_value TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Items with Location
CREATE TABLE items (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  location_id INT,
  owner_id INT,
  category VARCHAR(50),
  price DECIMAL(10,2),
  currency VARCHAR(3),
  status ENUM('Active', 'Under Review', 'Inactive'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
```

### Frontend Implementation

#### Location Management
```typescript
// Location Context
interface LocationContextType {
  currentLocation: Location;
  allLocations: Location[];
  switchLocation: (locationId: number) => void;
  getUsersByLocation: (locationId: number) => User[];
  getItemsByLocation: (locationId: number) => Item[];
}

// Location Filtering
const useLocationFilter = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  const filterByLocation = (data: any[], locationField: string = 'location') => {
    if (selectedLocation === 'all') return data;
    return data.filter(item => item[locationField] === selectedLocation);
  };
  
  return { selectedLocation, setSelectedLocation, filterByLocation };
};
```

#### Language Management
```typescript
// Translation Hook
const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };
  
  const changeLanguage = async (languageCode: string) => {
    const newTranslations = await loadTranslations(languageCode);
    setTranslations(newTranslations);
    setCurrentLanguage(languageCode);
  };
  
  return { t, currentLanguage, changeLanguage };
};

// Translation Context
interface TranslationContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  t: (key: string, fallback?: string) => string;
  changeLanguage: (code: string) => Promise<void>;
  isLoading: boolean;
}
```

## Admin Dashboard Features

### Location Management
- **Real-time Statistics**: View metrics for each location
- **Location Comparison**: Compare performance across locations
- **Regional Settings**: Configure location-specific settings
- **Expansion Planning**: Analytics for new location decisions

### Language Management
- **Translation Progress**: Track completion for each language
- **Translation Editor**: In-app translation management
- **Quality Control**: Review and approve translations
- **Export/Import**: Bulk translation file management

## Best Practices

### Performance Optimization
1. **Lazy Loading**: Load location/language data on demand
2. **Caching**: Cache translations and location data
3. **CDN Distribution**: Serve translations from regional CDNs
4. **Database Indexing**: Optimize queries with proper indexes

### User Experience
1. **Auto-Detection**: Detect user location and language preferences
2. **Graceful Fallbacks**: Handle missing translations gracefully
3. **Consistent UI**: Maintain UI consistency across languages
4. **Cultural Adaptation**: Consider cultural differences in design

### Maintenance
1. **Regular Updates**: Keep location and translation data current
2. **Monitoring**: Track usage patterns by location and language
3. **Backup Strategy**: Regular backups of translation data
4. **Version Control**: Track changes to translations and locations

## Future Enhancements

### Advanced Features
1. **AI Translation**: Automated translation suggestions
2. **Voice Support**: Multi-language voice interfaces
3. **Cultural Customization**: Location-specific UI adaptations
4. **Real-time Collaboration**: Live translation editing

### Scaling Considerations
1. **Microservices**: Separate location and translation services
2. **Federation**: Distributed location management
3. **Edge Computing**: Location-aware edge deployments
4. **Global Load Balancing**: Route users to nearest data centers

This architecture provides a solid foundation for scaling Uruti eRental across multiple markets while maintaining excellent user experience and administrative control.
