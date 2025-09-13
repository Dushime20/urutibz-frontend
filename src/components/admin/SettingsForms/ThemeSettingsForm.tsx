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

interface ThemeSettingsFormProps {
  settings: ThemeSettings;
  onUpdate: (updates: Partial<ThemeSettings>) => Promise<void>;
  isLoading: boolean;
  theme: ThemeSettings;
}

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ThemeSettings>(settings);
  const [showPreview, setShowPreview] = useState(false);

  // Apply theme to the UI
  const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--surface-color', theme.surfaceColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--font-size', theme.fontSize);
    root.style.setProperty('--border-radius', theme.borderRadius);
    
    // Apply dark/light mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
      body.classList.remove('dark');
    } else {
      // For 'auto', check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    }
    
    console.log('Theme applied:', theme);
  };

  // Update form data when settings change
  useEffect(() => {
    setFormData(settings);
    // Apply theme when settings are loaded
    applyTheme(settings);
  }, [settings]);

  // Handle form field changes
  const handleChange = (field: keyof ThemeSettings, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Apply preview immediately if preview mode is enabled
    if (showPreview) {
      applyTheme(newData);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      // Apply theme after successful update
      applyTheme(formData);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (confirm('Reset theme to default values?')) {
      const defaultTheme: ThemeSettings = {
        mode: 'auto',
        primaryColor: '#0d9488',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        surfaceColor: '#f8fafc',
        textColor: '#1e293b',
        borderColor: '#e2e8f0',
        fontFamily: 'Inter',
        fontSize: '16px',
        borderRadius: '8px',
        spacing: 'comfortable',
        animations: true,
        transitions: true,
      };
      setFormData(defaultTheme);
      try {
        await onUpdate(defaultTheme);
        // Apply the default theme after successful update
        applyTheme(defaultTheme);
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
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Nunito'
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
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                formData.mode === value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                formData.mode === value
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              <div className={`font-medium ${
                formData.mode === value
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-900 dark:text-white'
              }`}>{label}</div>
              <div className={`text-sm ${
                formData.mode === value
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-600 dark:text-gray-400'
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
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
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
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
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <button
            onClick={handleExport}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSettingsForm;
