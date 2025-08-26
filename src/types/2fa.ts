export interface TwoFactorSetupResponse {
  success: boolean;
  data: {
    qrCode: string;
    backupCodes: string[];
    secret: string;
  };
}

export interface TwoFactorStatusResponse {
  success: boolean;
  data: {
    enabled: boolean;
    verified: boolean;
    hasSecret: boolean;
    hasBackupCodes: boolean;
  };
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  data: {
    token?: string;
    message: string;
  };
}

export interface TwoFactorBackupVerifyRequest {
  backupCode: string;
}

export interface TwoFactorSetupRequest {
  // Empty for now, but can be extended if needed
}

export interface TwoFactorDisableRequest {
  code: string; // Current 2FA code to confirm disable
}

export interface TwoFactorDisableResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface TwoFactorBackupCodesResponse {
  success: boolean;
  data: {
    backupCodes: string[];
    message: string;
  };
}

export interface TwoFactorState {
  enabled: boolean;
  verified: boolean;
  hasSecret: boolean;
  hasBackupCodes: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TwoFactorSetupFormData {
  code: string;
}

export interface TwoFactorVerificationFormData {
  code: string;
}

export interface TwoFactorBackupFormData {
  backupCode: string;
}

export interface TwoFactorDisableFormData {
  code: string;
}
