/**
 * Validator Utilities
 * Helper functions untuk validasi form dan data
 */

/**
 * Validasi email
 * @param email - Email yang akan divalidasi
 * @returns Boolean apakah email valid
 *
 * @example
 * isValidEmail("test@unila.ac.id") // true
 * isValidEmail("invalid-email") // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validasi email Unila (harus @unila.ac.id atau @students.unila.ac.id)
 * @param email - Email yang akan divalidasi
 * @returns Boolean apakah email Unila valid
 *
 * @example
 * isValidUnilaEmail("mahasiswa@students.unila.ac.id") // true
 * isValidUnilaEmail("dosen@unila.ac.id") // true
 * isValidUnilaEmail("user@gmail.com") // false
 */
export function isValidUnilaEmail(email: string): boolean {
  const unilaEmailRegex = /^[^\s@]+@(students\.)?unila\.ac\.id$/;
  return unilaEmailRegex.test(email);
}

/**
 * Validasi NIM (Nomor Induk Mahasiswa)
 * Format: 10 digit angka
 * @param nim - NIM yang akan divalidasi
 * @returns Boolean apakah NIM valid
 *
 * @example
 * isValidNIM("1234567890") // true
 * isValidNIM("12345") // false
 */
export function isValidNIM(nim: string): boolean {
  const nimRegex = /^\d{10}$/;
  return nimRegex.test(nim);
}

/**
 * Validasi NIP (Nomor Induk Pegawai)
 * Format: 18 digit angka
 * @param nip - NIP yang akan divalidasi
 * @returns Boolean apakah NIP valid
 *
 * @example
 * isValidNIP("199001012020121001") // true
 * isValidNIP("12345") // false
 */
export function isValidNIP(nip: string): boolean {
  const nipRegex = /^\d{18}$/;
  return nipRegex.test(nip);
}

/**
 * Validasi nomor telepon Indonesia
 * @param phone - Nomor telepon yang akan divalidasi
 * @returns Boolean apakah nomor telepon valid
 *
 * @example
 * isValidPhoneNumber("081234567890") // true
 * isValidPhoneNumber("+6281234567890") // true
 * isValidPhoneNumber("12345") // false
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validasi password
 * Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
 * @param password - Password yang akan divalidasi
 * @returns Boolean apakah password valid
 *
 * @example
 * isValidPassword("Password123") // true
 * isValidPassword("weak") // false
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
 * @param password - Password yang akan dicek kekuatannya
 * @returns Object dengan score (0-4) dan label
 *
 * @example
 * getPasswordStrength("weak") // { score: 0, label: "Sangat Lemah" }
 * getPasswordStrength("Password123!") // { score: 4, label: "Sangat Kuat" }
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
 * @param url - URL yang akan divalidasi
 * @returns Boolean apakah URL valid
 *
 * @example
 * isValidURL("https://unila.ac.id") // true
 * isValidURL("not-a-url") // false
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
 * @param str - String yang akan divalidasi
 * @returns Boolean apakah string kosong
 *
 * @example
 * isEmpty("   ") // true
 * isEmpty("text") // false
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validasi panjang string
 * @param str - String yang akan divalidasi
 * @param min - Panjang minimal
 * @param max - Panjang maksimal
 * @returns Boolean apakah panjang string valid
 *
 * @example
 * isValidLength("hello", 3, 10) // true
 * isValidLength("hi", 3, 10) // false
 */
export function isValidLength(str: string, min: number, max?: number): boolean {
  const length = str.length;
  if (length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
}

/**
 * Validasi file type
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types
 * @returns Boolean apakah file type valid
 *
 * @example
 * isValidFileType(file, ['image/jpeg', 'image/png']) // true/false
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validasi file size
 * @param file - File object
 * @param maxSizeInMB - Ukuran maksimal dalam MB
 * @returns Boolean apakah file size valid
 *
 * @example
 * isValidFileSize(file, 5) // true if file <= 5MB
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validasi tahun akademik (format: 2023/2024)
 * @param tahun - Tahun akademik yang akan divalidasi
 * @returns Boolean apakah tahun akademik valid
 *
 * @example
 * isValidAcademicYear("2023/2024") // true
 * isValidAcademicYear("2023") // false
 */
export function isValidAcademicYear(tahun: string): boolean {
  const regex = /^\d{4}\/\d{4}$/;
  if (!regex.test(tahun)) return false;

  const [year1, year2] = tahun.split('/').map(Number);
  return year2 === year1 + 1;
}

/**
 * Validasi IPK (0.00 - 4.00)
 * @param ipk - IPK yang akan divalidasi
 * @returns Boolean apakah IPK valid
 *
 * @example
 * isValidIPK(3.75) // true
 * isValidIPK(4.5) // false
 */
export function isValidIPK(ipk: number): boolean {
  return ipk >= 0 && ipk <= 4.0;
}

/**
 * Validasi SKS (Satuan Kredit Semester)
 * @param sks - SKS yang akan divalidasi
 * @param maxSKS - SKS maksimal yang diperbolehkan
 * @returns Boolean apakah SKS valid
 *
 * @example
 * isValidSKS(24, 24) // true
 * isValidSKS(30, 24) // false
 */
export function isValidSKS(sks: number, maxSKS = 24): boolean {
  return sks >= 0 && sks <= maxSKS && Number.isInteger(sks);
}

/**
 * Sanitize input untuk mencegah XSS
 * @param input - Input yang akan disanitize
 * @returns String yang sudah disanitize
 *
 * @example
 * sanitizeInput("<script>alert('xss')</script>") // "&lt;script&gt;alert('xss')&lt;/script&gt;"
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validasi apakah angka dalam range tertentu
 * @param num - Angka yang akan divalidasi
 * @param min - Nilai minimal
 * @param max - Nilai maksimal
 * @returns Boolean apakah angka dalam range
 *
 * @example
 * isInRange(5, 1, 10) // true
 * isInRange(15, 1, 10) // false
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}
