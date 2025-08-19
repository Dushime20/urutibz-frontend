# Admin Settings Management Guide

## Overview

The Admin Settings Management system provides comprehensive control over platform configuration, security settings, notification preferences, and system parameters. This guide explains how to use the admin settings interface effectively.

## Accessing Admin Settings

1. Navigate to the Admin Dashboard
2. Click on the "Settings" tab in the sidebar navigation
3. The settings interface will load with four main categories

## Settings Categories

### 1. Platform Settings

**Basic Information**
- **Site Name**: The display name of your platform
- **Site Description**: A brief description of your platform
- **Contact Email**: Primary support email address
- **Support Phone**: Customer support phone number

**Regional Settings**
- **Default Currency**: Primary currency for transactions (USD, RWF, EUR, GBP)
- **Default Language**: Primary language for the platform (English, French, Kinyarwanda, Swahili)
- **Timezone**: Server timezone setting (Africa/Kigali, UTC, etc.)

**Platform Features**
- **Max Images Per Product**: Maximum number of images allowed per product listing
- **Max Products Per User**: Maximum number of products a user can list
- **Maintenance Mode**: Enable/disable platform access during maintenance
- **Enable User Registration**: Allow new users to register
- **Auto-approve Products**: Automatically approve new product listings

**Verification Settings**
- **Require Email Verification**: Force email verification for new users
- **Require Phone Verification**: Force phone verification for new users
- **Require KYC Verification**: Force KYC verification for users

### 2. Security Settings

**Authentication Settings**
- **Session Timeout**: Hours before automatic logout
- **Max Login Attempts**: Maximum failed login attempts before lockout
- **Minimum Password Length**: Minimum required password length
- **Require Two-Factor Authentication**: Enable 2FA for all users

**File Upload Security**
- **Max File Size**: Maximum file size in MB for uploads
- **Allowed File Types**: Comma-separated list of allowed file extensions
- **Enable CAPTCHA**: Enable CAPTCHA for forms

**Audit & Monitoring**
- **Enable Audit Logging**: Log all administrative actions
- **Data Retention**: Number of days to retain audit logs
- **IP Whitelist**: Allowed IP addresses (one per line)

### 3. Notification Settings

**Email Notifications**
- **Enable Email Notifications**: Master toggle for email notifications
- **Booking Notifications**: Notify users about booking events
- **Payment Notifications**: Notify users about payment events
- **Review Notifications**: Notify users about review events

**SMS & Push Notifications**
- **Enable SMS Notifications**: Enable SMS notifications
- **Enable Push Notifications**: Enable push notifications

**Admin Alerts**
- **Enable Admin Alerts**: Notify administrators of important events
- **System Maintenance Alerts**: Alert about system maintenance

### 4. System Settings

**Cache Settings**
- **Enable Caching**: Enable system caching for performance
- **Cache Timeout**: Cache duration in seconds

**Backup Settings**
- **Enable Automatic Backups**: Enable automated system backups
- **Backup Frequency**: How often to perform backups (hourly, daily, weekly, monthly)

**System Monitoring**
- **API Rate Limit**: Maximum API requests per hour per user
- **Max Concurrent Users**: Maximum number of simultaneous users
- **Log Level**: System logging level (error, warn, info, debug)
- **Enable Debug Mode**: Enable debug mode for development

## API Endpoints

### Fetch Settings
```
GET /api/v1/admin/settings
```

### Update Settings
```
PUT /api/v1/admin/settings
```

### Reset Settings
```
POST /api/v1/admin/settings/reset
```

### System Health
```
GET /api/v1/admin/system/health
```

### System Logs
```
GET /api/v1/admin/system/logs?level=info&limit=100
```

### Clear Cache
```
POST /api/v1/admin/system/cache/clear
```

### Trigger Backup
```
POST /api/v1/admin/system/backup
```

## Best Practices

### Security
1. **Regular Updates**: Keep security settings up to date
2. **Strong Passwords**: Enforce minimum password length of 8+ characters
3. **Two-Factor Authentication**: Enable 2FA for enhanced security
4. **Audit Logging**: Keep audit logs enabled for compliance
5. **IP Whitelisting**: Use IP whitelisting for admin access

### Performance
1. **Caching**: Enable caching for better performance
2. **Rate Limiting**: Set appropriate API rate limits
3. **File Size Limits**: Set reasonable file upload limits
4. **Backup Frequency**: Schedule regular backups

### User Experience
1. **Maintenance Mode**: Use maintenance mode for updates
2. **Notification Preferences**: Configure appropriate notification settings
3. **Language Support**: Set appropriate default language
4. **Currency**: Set appropriate default currency

## Troubleshooting

### Common Issues

**Settings Not Saving**
- Check authentication token
- Verify API endpoint accessibility
- Check browser console for errors

**Performance Issues**
- Review cache settings
- Check API rate limits
- Monitor system logs

**Security Concerns**
- Review audit logs
- Check IP whitelist
- Verify authentication settings

### Error Messages

- **"Failed to fetch settings"**: API connectivity issue
- **"Failed to update settings"**: Permission or validation error
- **"Failed to reset settings"**: Server-side error

## Configuration Examples

### Production Environment
```json
{
  "platform": {
    "maintenanceMode": false,
    "registrationEnabled": true,
    "emailVerificationRequired": true,
    "kycRequired": true
  },
  "security": {
    "sessionTimeout": 24,
    "maxLoginAttempts": 5,
    "passwordMinLength": 8,
    "requireTwoFactor": true,
    "enableAuditLog": true
  },
  "system": {
    "cacheEnabled": true,
    "backupEnabled": true,
    "logLevel": "info",
    "debugMode": false
  }
}
```

### Development Environment
```json
{
  "platform": {
    "maintenanceMode": false,
    "registrationEnabled": true,
    "emailVerificationRequired": false,
    "kycRequired": false
  },
  "security": {
    "sessionTimeout": 48,
    "maxLoginAttempts": 10,
    "passwordMinLength": 6,
    "requireTwoFactor": false,
    "enableAuditLog": true
  },
  "system": {
    "cacheEnabled": false,
    "backupEnabled": false,
    "logLevel": "debug",
    "debugMode": true
  }
}
```

## Support

For technical support with admin settings:
1. Check the system logs for detailed error information
2. Verify API endpoint accessibility
3. Contact the development team with specific error messages
4. Review the audit logs for any suspicious activity

## Updates

This settings system is designed to be extensible. New settings categories and options can be added by:
1. Updating the TypeScript interfaces
2. Adding new API endpoints
3. Extending the UI components
4. Updating this documentation 