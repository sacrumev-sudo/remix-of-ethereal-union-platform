import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирует дату в российском формате ДД.ММ.ГГГГ
 */
export function formatDateRu(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return '-';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Форматирует дату и время в российском формате ДД.ММ.ГГГГ, ЧЧ:ММ
 */
export function formatDateTimeRu(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return '-';
  
  const datePart = formatDateRu(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${datePart}, ${hours}:${minutes}`;
}
