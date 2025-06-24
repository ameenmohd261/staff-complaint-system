import moment from 'moment';

/**
 * Format date with moment.js
 * @param {string} date - Date string to format
 * @param {string} format - Format string (default: 'MMM DD, YYYY')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Format date with time
 * @param {string} date - Date string to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return moment(date).format('MMM DD, YYYY HH:mm');
};

/**
 * Calculate time difference between two dates in a human readable format
 * @param {string} startDate - Start date
 * @param {string} endDate - End date (defaults to now)
 * @returns {string} Human readable time difference
 */
export const getTimeDifference = (startDate, endDate = null) => {
  if (!startDate) return '';
  
  const start = moment(startDate);
  const end = endDate ? moment(endDate) : moment();
  
  return start.from(end);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length (default: 100)
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return `${text.substring(0, length)}...`;
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Extract initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate random color
 * @returns {string} Random color hex code
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if object is empty
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Get browser locale
 * @returns {string} Browser locale
 */
export const getBrowserLocale = () => {
  return navigator.language || navigator.userLanguage || 'en-US';
};

/**
 * Calculate days between two dates
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {number} Number of days
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days');
};