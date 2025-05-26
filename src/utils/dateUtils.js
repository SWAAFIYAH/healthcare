// src/utils/dateUtils.js
import { format, parseISO, addDays, differenceInDays, isToday, isPast, isFuture } from 'date-fns';

/**
 * Format a date string to a more readable format
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @param {string} formatStr - Format string for date-fns
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, formatStr = 'MMM d, yyyy') => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

/**
 * Format time from 24-hour format to 12-hour format
 * @param {string} timeStr - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format with AM/PM
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    // Create a date object using the time string
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr;
  }
};

/**
 * Calculate days until a date
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @returns {number} Number of days from today
 */
export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  try {
    const targetDate = parseISO(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(targetDate, today);
  } catch (error) {
    console.error('Error calculating days until:', error);
    return null;
  }
};

/**
 * Get relative time description for a date
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @returns {string} Relative description (Today, Tomorrow, X days away, etc.)
 */
export const getRelativeTimeDescription = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const days = daysUntil(dateStr);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1) return `In ${days} days`;
    if (days < -1) return `${Math.abs(days)} days ago`;
    
    return formatDate(dateStr);
  } catch (error) {
    console.error('Error getting relative time description:', error);
    return formatDate(dateStr);
  }
};

/**
 * Check if a date is in the past
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @returns {boolean} True if date is in the past
 */
export const isDatePast = (dateStr) => {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isPast(date);
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @returns {boolean} True if date is in the future
 */
export const isDateFuture = (dateStr) => {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isFuture(date);
  } catch (error) {
    console.error('Error checking if date is future:', error);
    return false;
  }
};

/**
 * Check if a date is today
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @returns {boolean} True if date is today
 */
export const isDateToday = (dateStr) => {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isToday(date);
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Format a datetime (combining date and time)
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @param {string} timeStr - Time in 24-hour format (HH:MM)
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return '';
  
  const dateFormatted = formatDate(dateStr);
  if (!timeStr) return dateFormatted;
  
  const timeFormatted = formatTime(timeStr);
  return `${dateFormatted} at ${timeFormatted}`;
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} Today's date as ISO string
 */
export const getTodayISO = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Add days to a date and return ISO format
 * @param {string} dateStr - ISO date string format (YYYY-MM-DD)
 * @param {number} days - Number of days to add
 * @returns {string} New date in ISO format
 */
export const addDaysToDate = (dateStr, days) => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    const newDate = addDays(date, days);
    return format(newDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error adding days to date:', error);
    return dateStr;
  }
};