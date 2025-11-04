/**
 * Admin Configuration
 * 
 * This file contains the list of admin emails who have access to the admin dashboard.
 * Only app makers/admins should be added to this list.
 * 
 * IMPORTANT: Replace 'admin@example.com' with your actual admin email(s).
 * You can add multiple admin emails to the array.
 */

export const ADMIN_EMAILS = [
  'jeet8patel1970@gmail.com',  
  'sagarjobanputra1997@gmail.com',
  'zeel10538@gmail.com' 
    // Replace with your actual admin email
  // Add more admin emails here, for example:
  // 'another-admin@example.com',
  // 'manager@example.com',
];

/**
 * Check if an email is an admin email
 * @param {string} email - Email to check
 * @returns {boolean} - True if email is in admin list
 */
export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

/**
 * Get all admin emails
 * @returns {string[]} - Array of admin emails
 */
export function getAdminEmails() {
  return [...ADMIN_EMAILS];
}
