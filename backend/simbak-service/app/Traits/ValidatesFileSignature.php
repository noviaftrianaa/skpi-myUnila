<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;

/**
 * Trait ValidatesFileSignature
 *
 * Validasi magic number (file signature) — pastikan byte awal file sesuai
 * dengan MIME type yang dideklarasikan. Cegah serangan polyglot / MIME
 * spoofing (mis. .php disamarkan sbg .pdf via Content-Type header).
 *
 * Reference signatures:
 *   PDF       : 25 50 44 46 ("%PDF")
 *   JPEG      : FF D8 FF
 *   PNG       : 89 50 4E 47 0D 0A 1A 0A
 *   GIF       : 47 49 46 38 ("GIF8")
 *   ZIP/DOCX  : 50 4B 03 04 ("PK..")
 *   DOC (OLE) : D0 CF 11 E0 A1 B1 1A E1
 *
 * Usage:
 *   use ValidatesFileSignature;
 *
 *   if (!$this->validateFileSignature($file, ['application/pdf'])) {
 *       return error;
 *   }
 */
trait ValidatesFileSignature
{
    /**
     * Validasi file signature terhadap allowed MIME types.
     *
     * @param UploadedFile|string $fileOrPath UploadedFile object atau path string
     * @param array $allowedMimes Whitelist MIME types yang accepted
     * @return bool true kalau magic number match dengan salah satu MIME di whitelist
     */
    protected function validateFileSignature($fileOrPath, array $allowedMimes): bool
    {
        $path = $fileOrPath instanceof UploadedFile
            ? $fileOrPath->getRealPath()
            : (string) $fileOrPath;

        $handle = @fopen($path, 'rb');
        if (!$handle) {
            return false;
        }
        $header = fread($handle, 16);
        fclose($handle);

        if ($header === false || strlen($header) < 4) {
            return false;
        }

        foreach ($allowedMimes as $mime) {
            if ($this->matchesSignature($header, $mime)) {
                return true;
            }
        }
        return false;
    }

    private function matchesSignature(string $header, string $mime): bool
    {
        return match ($mime) {
            'application/pdf' => substr($header, 0, 4) === '%PDF',
            'image/jpeg', 'image/jpg' => substr($header, 0, 3) === "\xFF\xD8\xFF",
            'image/png' => substr($header, 0, 8) === "\x89PNG\r\n\x1A\n",
            'image/gif' => substr($header, 0, 4) === "GIF8",
            // ZIP / DOCX / XLSX / PPTX (OOXML pakai ZIP container)
            'application/zip',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                => substr($header, 0, 4) === "PK\x03\x04",
            // Legacy Office (OLE2)
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.ms-powerpoint'
                => substr($header, 0, 8) === "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1",
            default => false,
        };
    }
}
