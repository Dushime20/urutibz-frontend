import { RiskProfile, CreateRiskProfileRequest } from '../../../types/riskManagement';

// CSV Import/Export
export interface CSVProfile {
  productId: string;
  categoryId: string;
  riskLevel: string;
  insurance: string;
  inspection: string;
  minCoverage: string;
  inspectionTypes: string;
  complianceDeadlineHours: string;
  riskFactors: string;
  mitigationStrategies: string;
  enforcementLevel: string;
  autoEnforcement: string;
  gracePeriodHours: string;
}

export const convertProfilesToCSV = (profiles: RiskProfile[]): string => {
  const headers = [
    'productId',
    'categoryId', 
    'riskLevel',
    'insurance',
    'inspection',
    'minCoverage',
    'inspectionTypes',
    'complianceDeadlineHours',
    'riskFactors',
    'mitigationStrategies',
    'enforcementLevel',
    'autoEnforcement',
    'gracePeriodHours'
  ];

  const csvRows = [headers.join(',')];

  profiles.forEach(profile => {
    const row = [
      profile.productId,
      profile.categoryId,
      profile.riskLevel,
      profile.mandatoryInsurance ? 'true' : 'false',
      profile.mandatoryInspection ? 'true' : 'false',
      profile.minCoverage?.toString() || '0',
      profile.inspectionTypes?.types?.join(';') || '',
      profile.complianceDeadlineHours?.toString() || '24',
      profile.riskFactors?.map(f => f.name || f).join(';') || '',
      profile.mitigationStrategies?.strategies?.join(';') || '',
      profile.enforcementLevel || 'moderate',
      profile.autoEnforcement ? 'true' : 'false',
      profile.gracePeriodHours?.toString() || '48'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

export const parseCSVToProfiles = (csvContent: string): CreateRiskProfileRequest[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const profiles: CreateRiskProfileRequest[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
    }

    const profile: any = {};
    headers.forEach((header, index) => {
      profile[header] = values[index];
    });

    // Convert CSV data to proper format
    const convertedProfile: CreateRiskProfileRequest = {
      productId: profile.productId,
      categoryId: profile.categoryId,
      riskLevel: profile.riskLevel as any,
      mandatoryRequirements: {
        insurance: profile.insurance === 'true',
        inspection: profile.inspection === 'true',
        minCoverage: parseInt(profile.minCoverage) || 0,
        inspectionTypes: profile.inspectionTypes ? profile.inspectionTypes.split(';').filter(Boolean) : [],
        complianceDeadlineHours: parseInt(profile.complianceDeadlineHours) || 24
      },
      riskFactors: profile.riskFactors ? profile.riskFactors.split(';').filter(Boolean) : [],
      mitigationStrategies: profile.mitigationStrategies ? profile.mitigationStrategies.split(';').filter(Boolean) : [],
      enforcementLevel: profile.enforcementLevel as any,
      autoEnforcement: profile.autoEnforcement === 'true',
      gracePeriodHours: parseInt(profile.gracePeriodHours) || 48
    };

    profiles.push(convertedProfile);
  }

  return profiles;
};

// JSON Import/Export
export const convertProfilesToJSON = (profiles: RiskProfile[]): string => {
  const jsonProfiles = profiles.map(profile => ({
    productId: profile.productId,
    categoryId: profile.categoryId,
    riskLevel: profile.riskLevel,
    mandatoryRequirements: {
      insurance: profile.mandatoryInsurance || false,
      inspection: profile.mandatoryInspection || false,
      minCoverage: profile.minCoverage || 0,
      inspectionTypes: profile.inspectionTypes?.types || [],
      complianceDeadlineHours: profile.complianceDeadlineHours || 24
    },
    riskFactors: profile.riskFactors?.map(f => f.name || f) || [],
    mitigationStrategies: profile.mitigationStrategies?.strategies || [],
    enforcementLevel: profile.enforcementLevel || 'moderate',
    autoEnforcement: profile.autoEnforcement || false,
    gracePeriodHours: profile.gracePeriodHours || 48
  }));

  return JSON.stringify({ profiles: jsonProfiles }, null, 2);
};

export const parseJSONToProfiles = (jsonContent: string): CreateRiskProfileRequest[] => {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('JSON must contain a "profiles" array');
    }

    return data.profiles.map((profile: any) => ({
      productId: profile.productId,
      categoryId: profile.categoryId,
      riskLevel: profile.riskLevel,
      mandatoryRequirements: {
        insurance: Boolean(profile.mandatoryRequirements?.insurance),
        inspection: Boolean(profile.mandatoryRequirements?.inspection),
        minCoverage: Number(profile.mandatoryRequirements?.minCoverage) || 0,
        inspectionTypes: Array.isArray(profile.mandatoryRequirements?.inspectionTypes) 
          ? profile.mandatoryRequirements.inspectionTypes 
          : [],
        complianceDeadlineHours: Number(profile.mandatoryRequirements?.complianceDeadlineHours) || 24
      },
      riskFactors: Array.isArray(profile.riskFactors) ? profile.riskFactors : [],
      mitigationStrategies: Array.isArray(profile.mitigationStrategies) ? profile.mitigationStrategies : [],
      enforcementLevel: profile.enforcementLevel || 'moderate',
      autoEnforcement: Boolean(profile.autoEnforcement),
      gracePeriodHours: Number(profile.gracePeriodHours) || 48
    }));
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// File operations
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

// Validation
export const validateProfileData = (profile: CreateRiskProfileRequest): string[] => {
  const errors: string[] = [];

  if (!profile.productId.trim()) {
    errors.push('Product ID is required');
  }

  if (!profile.categoryId.trim()) {
    errors.push('Category ID is required');
  }

  if (!profile.riskLevel) {
    errors.push('Risk level is required');
  }

  if (profile.mandatoryRequirements.minCoverage < 0) {
    errors.push('Minimum coverage must be non-negative');
  }

  if (profile.mandatoryRequirements.complianceDeadlineHours < 0) {
    errors.push('Compliance deadline must be non-negative');
  }

  if (profile.gracePeriodHours < 0) {
    errors.push('Grace period must be non-negative');
  }

  // Allow empty arrays - no validation required for inspectionTypes, riskFactors, or mitigationStrategies

  return errors;
};

export const validateBulkData = (profiles: CreateRiskProfileRequest[]): { valid: CreateRiskProfileRequest[]; errors: Array<{ index: number; errors: string[] }> } => {
  const valid: CreateRiskProfileRequest[] = [];
  const errors: Array<{ index: number; errors: string[] }> = [];

  profiles.forEach((profile, index) => {
    const profileErrors = validateProfileData(profile);
    if (profileErrors.length === 0) {
      valid.push(profile);
    } else {
      errors.push({ index, errors: profileErrors });
    }
  });

  return { valid, errors };
};

// Template generation
export const generateCSVTemplate = (): string => {
  const headers = [
    'productId',
    'categoryId',
    'riskLevel',
    'insurance',
    'inspection',
    'minCoverage',
    'inspectionTypes',
    'complianceDeadlineHours',
    'riskFactors',
    'mitigationStrategies',
    'enforcementLevel',
    'autoEnforcement',
    'gracePeriodHours'
  ];

  const sampleRow = [
    '403eb546-56bf-4b2e-987d-6bb05a09cadd',
    'photography-equipment',
    'high',
    'true',
    'true',
    '25000',
    'pre_rental;post_rental',
    '12',
    'High value item;Fragile equipment',
    'Comprehensive insurance;Professional inspections',
    'strict',
    'true',
    '24'
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
};

export const generateJSONTemplate = (): string => {
  return JSON.stringify({
    profiles: [
      {
        productId: "403eb546-56bf-4b2e-987d-6bb05a09cadd",
        categoryId: "photography-equipment",
        riskLevel: "high",
        mandatoryRequirements: {
          insurance: true,
          inspection: true,
          minCoverage: 25000,
          inspectionTypes: ["pre_rental", "post_rental"],
          complianceDeadlineHours: 12
        },
        riskFactors: ["High value item", "Fragile equipment"],
        mitigationStrategies: ["Comprehensive insurance", "Professional inspections"],
        enforcementLevel: "strict",
        autoEnforcement: true,
        gracePeriodHours: 24
      }
    ]
  }, null, 2);
};
