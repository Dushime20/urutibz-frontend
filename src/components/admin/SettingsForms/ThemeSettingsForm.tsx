import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Sun, 
  Moon, 
  Type, 
  CornerUpLeft, 
  Zap,
  Eye,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import type { ThemeSettings } from '../../../types/adminSettings.types';
import { useTheme } from '../../../contexts/ThemeContext';

interface ThemeSettingsFormProps {
  // Deprecated. Component now uses ThemeContext; props are ignored if provided.
  settings?: ThemeSettings;
  onUpdate?: (updates: Partial<ThemeSettings>) => Promise<void>;
  isLoading?: boolean;
}

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = () => {
  const { theme, applyTheme, updateTheme, resetTheme, isSaving } = useTheme();
  const [formData, setFormData] = useState<ThemeSettings>(theme);
  const [showPreview, setShowPreview] = useState(false);

  // applyTheme comes from ThemeContext

  // Sync with ThemeContext theme changes
  useEffect(() => {
    setFormData(theme);
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Handle form field changes
  const handleChange = (field: keyof ThemeSettings, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Always reflect changes immediately in the UI
    applyTheme(newData);
    
    // Persist mode toggle instantly so dark/light applies globally without Save
    if (field === 'mode') {
      updateTheme({ mode: value });
    }
  };

  // Handle form submission via ThemeContext
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTheme(formData);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  // Reset to defaults via ThemeContext
  const handleReset = async () => {
    if (confirm('Reset theme to default values?')) {
      try {
        await resetTheme();
      } catch (error) {
        console.error('Failed to reset theme:', error);
      }
    }
  };

  // Export theme configuration
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: formData,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import theme configuration
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        if (importData.theme) {
          setFormData(importData.theme);
          await onUpdate(importData.theme);
          // Apply the imported theme after successful update
          applyTheme(importData.theme);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Failed to import theme configuration');
      }
    };
    reader.readAsText(file);
  };


  const fontFamilies = [
    // Modern sans-serifs
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Nunito', 'Nunito Sans',
    'Manrope', 'DM Sans', 'Work Sans', 'Rubik', 'Cabin', 'Karla', 'Mulish', 'Raleway', 'Quicksand', 'Urbanist',
    'Space Grotesk', 'Plus Jakarta Sans', 'Outfit', 'Public Sans', 'Noto Sans', 'Heebo', 'Hind', 'IBM Plex Sans',
    // Humanist/geometric
    'Fira Sans', 'Asap', 'Barlow', 'Exo 2', 'Maven Pro', 'Questrial', 'Titillium Web', 'Catamaran', 'Sora',
    // Serif options
    'Merriweather', 'Playfair Display', 'Noto Serif', 'Lora', 'Cormorant Garamond',
    // Display/branding friendly
    'Bebas Neue', 'Oswald', 'Archivo', 'Jost', 'Anton'
  ];

  return (
    <div className="space-y-8">
      {/* Theme Mode */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Theme Mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun, description: 'Always use light theme' },
            { value: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark theme' },
            { value: 'auto', label: 'Auto', icon: Monitor, description: 'Follow system preference' },
          ].map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              onClick={() => handleChange('mode', value)}
              className={`p-4 rounded-lg transition-colors text-left ${
                formData.mode === value
                  ? 'border-2 border-my-primary bg-blue-50 dark:bg-blue-900/50'
                  : 'border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                formData.mode === value
                  ? 'text-my-primary dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300'
              }`} />
              <div className={`font-medium ${
                formData.mode === value
                  ? 'text-my-primary dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-300'
              }`}>{label}</div>
              <div className={`text-sm ${
                formData.mode === value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 opacity-75'
              }`}>{description}</div>
            </button>
          ))}
        </div>
      </div>


      {/* Typography */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Type className="w-5 h-5 mr-2" />
          Typography
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Family
            </label>
            <select
              value={formData.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size
            </label>
            <select
              value={formData.fontSize}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="14px">Small (14px)</option>
              <option value="16px">Medium (16px)</option>
              <option value="18px">Large (18px)</option>
              <option value="20px">Extra Large (20px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout & Spacing */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CornerUpLeft className="w-5 h-5 mr-2" />
          Layout & Spacing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Border Radius
            </label>
            <select
              value={formData.borderRadius}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="0px">None (0px)</option>
              <option value="4px">Small (4px)</option>
              <option value="8px">Medium (8px)</option>
              <option value="12px">Large (12px)</option>
              <option value="16px">Extra Large (16px)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Spacing
            </label>
            <select
              value={formData.spacing}
              onChange={(e) => handleChange('spacing', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>

      {/* Animations & Effects */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Animations & Effects
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.animations}
              onChange={(e) => handleChange('animations', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable animations and transitions
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.transitions}
              onChange={(e) => handleChange('transitions', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable smooth transitions
            </span>
          </label>
        </div>
      </div>

   

      {/* Theme Preview */}
      {showPreview && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Theme Preview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Preview */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Secondary</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: formData.accentColor }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accent</span>
                </div>
              </div>
            </div>
            
            {/* Component Preview */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Components</h4>
              <div className="space-y-3">
                <button 
                  className="px-4 py-2 rounded-lg text-white transition-colors"
                  style={{ 
                    backgroundColor: formData.primaryColor,
                    borderRadius: formData.borderRadius
                  }}
                >
                  Primary Button
                </button>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: formData.surfaceColor,
                    borderColor: formData.borderColor,
                    color: formData.textColor,
                    borderRadius: formData.borderRadius
                  }}
                >
                  <div className="font-medium mb-2">Card Component</div>
                  <div className="text-sm opacity-75">This is how your theme will look</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showPreview
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <button
            onClick={handleExport}
            className="bg-my-primary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-my-primary hover:bg-opacity-80 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSettingsForm;
