/**
 * Validator Utilities
 * Helper functions untuk validasi form dan data
 */

/**
 * Validasi email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validasi email Unila (harus @unila.ac.id atau @students.unila.ac.id)
 */
export function isValidUnilaEmail(email: string): boolean {
  const unilaEmailRegex = /^[^\s@]+@(students\.)?unila\.ac\.id$/;
  return unilaEmailRegex.test(email);
}

/**
 * Validasi NIM (Nomor Induk Mahasiswa)
 * Format: 10 digit angka
 */
export function isValidNIM(nim: string): boolean {
  const nimRegex = /^\d{10}$/;
  return nimRegex.test(nim);
}

/**
 * Validasi NIP (Nomor Induk Pegawai)
 * Format: 18 digit angka
 */
export function isValidNIP(nip: string): boolean {
  const nipRegex = /^\d{18}$/;
  return nipRegex.test(nip);
}

/**
 * Validasi nomor telepon Indonesia
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validasi password
 * Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
 */
export function isValidPassword(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return minLength && hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Get password strength
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const finalScore = Math.min(score, 4);

  return {
    score: finalScore,
    label: labels[finalScore],
  };
}

/**
 * Validasi URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validasi apakah string kosong atau hanya whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validasi panjang string
 */
export function isValidLength(str: string, min: number, max?: number): boolean {
  const length = str.length;
  if (length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
}

/**
 * Validasi file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validasi file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validasi tahun akademik (format: 2023/2024)
 */
export function isValidAcademicYear(tahun: string): boolean {
  const regex = /^\d{4}\/\d{4}$/;
  if (!regex.test(tahun)) return false;

  const [year1, year2] = tahun.split('/').map(Number);
  return year2 === year1 + 1;
}

/**
 * Validasi IPK (0.00 - 4.00)
 */
export function isValidIPK(ipk: number): boolean {
  return ipk >= 0 && ipk <= 4.0;
}

/**
 * Validasi SKS (Satuan Kredit Semester)
 */
export function isValidSKS(sks: number, maxSKS = 24): boolean {
  return sks >= 0 && sks <= maxSKS && Number.isInteger(sks);
}

/**
 * Sanitize input untuk mencegah XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof document === 'undefined') return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validasi apakah angka dalam range tertentu
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}
