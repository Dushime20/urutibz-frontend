import React, { useState, useCallback } from 'react';
import { RiskLevel } from '../../../types/riskManagement';

interface FormData {
  productId: string;
  categoryId: string;
  riskLevel: RiskLevel;
  mandatoryRequirements: {
    insurance: boolean;
    inspection: boolean;
    minCoverage: number;
    inspectionTypes: string[];
    complianceDeadlineHours: number;
  };
  riskFactors: string[];
  mitigationStrategies: string[];
  enforcementLevel: 'lenient' | 'moderate' | 'strict' | 'very_strict';
  autoEnforcement: boolean;
  gracePeriodHours: number;
}

interface ValidationErrors {
  [key: string]: string;
}

interface UseRiskProfileFormOptions {
  initialData?: Partial<FormData>;
  onValidationChange?: (isValid: boolean) => void;
}

interface UseRiskProfileFormReturn {
  data: FormData;
  errors: ValidationErrors;
  isValid: boolean;
  updateField: (field: keyof FormData, value: any) => void;
  updateMandatoryRequirements: (field: keyof FormData['mandatoryRequirements'], value: any) => void;
  toggleArrayItem: (field: 'riskFactors' | 'mitigationStrategies' | 'inspectionTypes', item: string) => void;
  validate: () => boolean;
  reset: () => void;
  setData: (data: FormData) => void;
}

const getDefaultFormData = (): FormData => ({
  productId: '',
  categoryId: '',
  riskLevel: RiskLevel.MEDIUM,
  mandatoryRequirements: {
    insurance: true,
    inspection: true,
    minCoverage: 10000,
    inspectionTypes: ['pre_rental', 'post_rental'],
    complianceDeadlineHours: 24
  },
  riskFactors: ['High value item'],
  mitigationStrategies: ['Comprehensive insurance'],
  enforcementLevel: 'moderate',
  autoEnforcement: true,
  gracePeriodHours: 48
});

export const useRiskProfileForm = (options: UseRiskProfileFormOptions = {}): UseRiskProfileFormReturn => {
  const { initialData, onValidationChange } = options;

  const [data, setData] = useState<FormData>(() => ({
    ...getDefaultFormData(),
    ...initialData
  }));
  const [errors, setErrors] = useState<ValidationErrors>({});

  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Product ID validation
    if (!data.productId.trim()) {
      newErrors.productId = 'Product ID is required';
    } else if (!isValidUUID(data.productId)) {
      newErrors.productId = 'Product ID must be a valid UUID';
    }

    // Category ID validation
    if (!data.categoryId.trim()) {
      newErrors.categoryId = 'Category ID is required';
    } else if (!isValidUUID(data.categoryId)) {
      newErrors.categoryId = 'Category ID must be a valid UUID';
    }

    // Min coverage validation
    if (!data.mandatoryRequirements.minCoverage || data.mandatoryRequirements.minCoverage < 0) {
      newErrors.minCoverage = 'Minimum coverage must be a positive number';
    }

    // Compliance deadline validation
    if (!data.mandatoryRequirements.complianceDeadlineHours || data.mandatoryRequirements.complianceDeadlineHours < 0) {
      newErrors.complianceDeadlineHours = 'Compliance deadline must be a positive number';
    }

    // Grace period validation
    if (!data.gracePeriodHours || data.gracePeriodHours < 0) {
      newErrors.gracePeriodHours = 'Grace period must be a positive number';
    }

    // Allow empty arrays - no validation required for inspectionTypes, riskFactors, or mitigationStrategies

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange?.(isValid);
    return isValid;
  }, [data, onValidationChange]);

  const updateField = useCallback((field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const updateMandatoryRequirements = useCallback((field: keyof FormData['mandatoryRequirements'], value: any) => {
    setData(prev => ({
      ...prev,
      mandatoryRequirements: {
        ...prev.mandatoryRequirements,
        [field]: value
      }
    }));

    // Clear specific error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const toggleArrayItem = useCallback((field: 'riskFactors' | 'mitigationStrategies' | 'inspectionTypes', item: string) => {
    setData(prev => {
      const currentArray = field === 'inspectionTypes' 
        ? prev.mandatoryRequirements.inspectionTypes
        : prev[field];
      
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      if (field === 'inspectionTypes') {
        return {
          ...prev,
          mandatoryRequirements: {
            ...prev.mandatoryRequirements,
            inspectionTypes: newArray
          }
        };
      } else {
        return {
          ...prev,
          [field]: newArray
        };
      }
    });

    // Clear specific error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const reset = useCallback(() => {
    setData(getDefaultFormData());
    setErrors({});
  }, []);

  const handleSetData = useCallback((newData: FormData) => {
    setData(newData);
    setErrors({});
  }, []);

  // Auto-validate when data changes
  React.useEffect(() => {
    validate();
  }, [data, validate]);

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0,
    updateField,
    updateMandatoryRequirements,
    toggleArrayItem,
    validate,
    reset,
    setData: handleSetData
  };
};
