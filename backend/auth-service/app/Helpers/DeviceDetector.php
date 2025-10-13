<?php

namespace App\Helpers;

class DeviceDetector
{
    /**
     * Parse user agent string and extract device information.
     */
    public static function parse(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'device_type' => 'unknown',
                'browser' => 'unknown',
                'platform' => 'unknown',
                'os' => 'unknown',
            ];
        }

        return [
            'device_type' => self::detectDeviceType($userAgent),
            'browser' => self::detectBrowser($userAgent),
            'platform' => self::detectPlatform($userAgent),
            'os' => self::detectOS($userAgent),
        ];
    }

    /**
     * Detect device type from user agent.
     */
    private static function detectDeviceType(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*mobile))/i', $userAgent)) {
            return 'tablet';
        }

        if (preg_match('/mobile|ip(hone|od)|android|blackberry|opera mini|windows phone/i', $userAgent)) {
            return 'mobile';
        }

        return 'web';
    }

    /**
     * Detect browser from user agent.
     */
    private static function detectBrowser(string $userAgent): string
    {
        $browsers = [
            'edg' => 'Edge',
            'chrome' => 'Chrome',
            'safari' => 'Safari',
            'firefox' => 'Firefox',
            'opera' => 'Opera',
            'msie' => 'Internet Explorer',
            'trident' => 'Internet Explorer',
        ];

        $userAgent = strtolower($userAgent);

        foreach ($browsers as $key => $browser) {
            if (strpos($userAgent, $key) !== false) {
                return $browser;
            }
        }

        return 'Unknown';
    }

    /**
     * Detect platform/OS from user agent.
     */
    private static function detectPlatform(string $userAgent): string
    {
        $platforms = [
            'windows nt 10' => 'Windows 10',
            'windows nt 11' => 'Windows 11',
            'windows nt 6.3' => 'Windows 8.1',
            'windows nt 6.2' => 'Windows 8',
            'windows nt 6.1' => 'Windows 7',
            'windows nt 6.0' => 'Windows Vista',
            'windows nt 5.1' => 'Windows XP',
            'mac os x' => 'macOS',
            'macintosh' => 'macOS',
            'linux' => 'Linux',
            'ubuntu' => 'Ubuntu',
            'android' => 'Android',
            'iphone' => 'iOS',
            'ipad' => 'iOS',
            'ipod' => 'iOS',
        ];

        $userAgent = strtolower($userAgent);

        foreach ($platforms as $key => $platform) {
            if (strpos($userAgent, $key) !== false) {
                return $platform;
            }
        }

        return 'Unknown';
    }

    /**
     * Detect OS from user agent (alias for platform).
     */
    private static function detectOS(string $userAgent): string
    {
        return self::detectPlatform($userAgent);
    }

    /**
     * Get location from IP address (basic version).
     * In production, you might want to use a service like MaxMind GeoIP2.
     */
    public static function getLocationFromIp(?string $ipAddress): ?string
    {
        if (empty($ipAddress) || $ipAddress === '127.0.0.1' || $ipAddress === '::1') {
            return 'localhost';
        }

        // TODO: Implement actual IP geolocation
        // For now, return null
        // You can integrate with services like:
        // - MaxMind GeoIP2
        // - ip-api.com
        // - ipstack.com

        return null;
    }
}
