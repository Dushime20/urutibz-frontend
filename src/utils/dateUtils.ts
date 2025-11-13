/**
 * Date formatting utilities
 * All dates from backend are displayed in UTC format: "YYYY-MM-DD HH:mm:ss UTC"
 */

/**
 * Format date as UTC: "2025-11-10 19:30:00 UTC"
 * This displays the UTC time regardless of timezone offset in database
 * 
 * @param dateString - Date string from backend (may include timezone offset like +02)
 * @returns Formatted date string in UTC format: "YYYY-MM-DD HH:mm:ss UTC"
 */
export const formatDateUTC = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Get UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date as UTC date only: "2025-11-10 UTC"
 * 
 * @param dateString - Date string from backend
 * @returns Formatted date string in UTC format: "YYYY-MM-DD UTC"
 */
export const formatDateOnlyUTC = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Get UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day} UTC`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date as UTC time only: "19:30:00 UTC"
 * 
 * @param dateString - Date string from backend
 * @returns Formatted time string in UTC format: "HH:mm:ss UTC"
 */
export const formatTimeOnlyUTC = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Get UTC components
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds} UTC`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

