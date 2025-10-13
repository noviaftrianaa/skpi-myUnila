/**
 * Formatter Utilities
 * Helper functions untuk format data (tanggal, angka, currency, dll)
 */

/**
 * Format tanggal ke bahasa Indonesia
 * @param date - Date object atau string ISO
 * @param format - 'short' | 'long' | 'full'
 * @returns String tanggal yang sudah diformat
 *
 * @example
 * formatDate(new Date(), 'short') // "1 Jan 2025"
 * formatDate(new Date(), 'long') // "1 Januari 2025"
 * formatDate(new Date(), 'full') // "Senin, 1 Januari 2025"
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    year: 'numeric',
  };

  if (format === 'full') {
    options.weekday = 'long';
  }

  return new Intl.DateTimeFormat('id-ID', options).format(dateObj);
}

/**
 * Format angka dengan separator ribuan
 * @param num - Angka yang akan diformat
 * @returns String angka dengan separator
 *
 * @example
 * formatNumber(1000) // "1.000"
 * formatNumber(1234567) // "1.234.567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format angka ke currency (Rupiah)
 * @param amount - Jumlah uang
 * @param withSymbol - Tampilkan simbol Rp atau tidak
 * @returns String currency
 *
 * @example
 * formatCurrency(50000) // "Rp 50.000"
 * formatCurrency(50000, false) // "50.000"
 */
export function formatCurrency(amount: number, withSymbol = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  return withSymbol ? formatted : formatted.replace('Rp', '').trim();
}

/**
 * Format persentase
 * @param value - Nilai persentase (0-100 atau 0-1)
 * @param fromDecimal - Apakah input dalam bentuk desimal (0-1)?
 * @param decimals - Jumlah desimal yang ditampilkan
 * @returns String persentase
 *
 * @example
 * formatPercentage(75) // "75%"
 * formatPercentage(0.75, true) // "75%"
 * formatPercentage(75.5, false, 1) // "75.5%"
 */
export function formatPercentage(
  value: number,
  fromDecimal = false,
  decimals = 0
): string {
  const percentage = fromDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format file size (bytes ke KB, MB, GB)
 * @param bytes - Ukuran dalam bytes
 * @returns String ukuran file yang readable
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(1073741824) // "1 GB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text dengan ellipsis
 * @param text - Text yang akan dipotong
 * @param maxLength - Panjang maksimal
 * @returns Text yang sudah dipotong
 *
 * @example
 * truncateText("Hello World", 5) // "Hello..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format nama (capitalize first letter of each word)
 * @param name - Nama yang akan diformat
 * @returns Nama yang sudah diformat
 *
 * @example
 * formatName("john doe") // "John Doe"
 * formatName("JANE SMITH") // "Jane Smith"
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format phone number Indonesia
 * @param phone - Nomor telepon
 * @returns Nomor telepon yang sudah diformat
 *
 * @example
 * formatPhoneNumber("081234567890") // "0812-3456-7890"
 * formatPhoneNumber("+6281234567890") // "+62 812-3456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('62')) {
    // Format: +62 812-3456-7890
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
  } else {
    // Format: 0812-3456-7890
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
}

/**
 * Format NIM/NIP
 * @param identifier - NIM atau NIP
 * @returns Identifier yang sudah diformat
 *
 * @example
 * formatIdentifier("1234567890") // "1234567890"
 */
export function formatIdentifier(identifier: string): string {
  return identifier.replace(/\s/g, '');
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 * @param date - Date object atau string ISO
 * @returns String waktu relatif
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 jam yang lalu"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
  return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`;
}
