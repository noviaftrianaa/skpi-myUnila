<?php
if (!function_exists('dom_xpath')) {
  function dom_xpath($url, $path)
  {
    try {
      $httpClient = new \GuzzleHttp\Client(['verify' => false]);
      $response = $httpClient->get($url);
      $htmlString = (string) $response->getBody();
      libxml_use_internal_errors(true);
      $doc = new DOMDocument();
      $doc->loadHTML($htmlString);
      $xpath = new DOMXPath($doc);

      return $xpath->evaluate($path);
    } catch (Exception $e) {
      return $e;
    }
  }
}
