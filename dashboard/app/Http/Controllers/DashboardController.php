<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class DashboardController extends Controller
{
	public function index()
	{
    $pageConfigs = ['myLayout' => 'horizontal'];
		return view('content.pages.pages-home', ['pageConfigs' => $pageConfigs]);
	}

  public function programstudi()
  {
    $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.kode_prodi,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        sms.soft_delete
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    ");

    return \DataTables::of($data)->addIndexColumn()->make(true);
  }

  public function mahasiswa()
  {
    $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        (
          SELECT
            COUNT(pd.id_pd)
          FROM
            pdrd.reg_pd AS reg
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd=reg.id_pd AND pd.soft_delete = 0
          WHERE
            reg.soft_delete = 0
            AND pd.id_stat_mhs = 'A'
            AND pd.id_kewarganegaraan = 'ID'
            AND reg.id_sms=sms.id_sms
        ) AS nasional,
        (
          SELECT
            COUNT(pd.id_pd)
          FROM
            pdrd.reg_pd AS reg
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd=reg.id_pd AND pd.soft_delete = 0
          WHERE
            reg.soft_delete = 0
            AND pd.id_stat_mhs = 'A'
            AND pd.id_kewarganegaraan != 'ID'
            AND reg.id_sms=sms.id_sms
        ) AS internasional
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    ");

    return \DataTables::of($data)->addIndexColumn()->make(true);
  }

  public function dosen()
  {
    $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        jenjang.nm_jenj_didik,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 12
            AND ptk.id_sms=sms.id_sms
        ) AS pns_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 12
            AND ptk.id_sms=sms.id_sms
        ) AS pns_wanita,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 12
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 12
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_wanita
      FROM
        pdrd.sms AS sms
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
      WHERE
        sms.kode_prodi IS NOT NULL
        AND sms.soft_delete = 0
      ORDER BY
        sms.nm_lemb,
        jenjang.nm_jenj_didik ASC
    ");

    return \DataTables::of($data)->addIndexColumn()->make(true);
  }

  public function tendik()
  {
    $data = \DB::SELECT("
      SELECT
        sms.id_sms,
        sms.nm_lemb,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS pns_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) < 88
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS pns_wanita,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'L'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_pria,
        (
          SELECT
            COUNT(sdm.id_sdm)
          FROM
            pdrd.reg_ptk AS ptk
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm=ptk.id_sdm AND sdm.soft_delete=0
          WHERE
            ptk.soft_delete = 0
            AND LEFT(sdm.nidn, 2) IN (88,89)
            AND sdm.jk = 'P'
            AND sdm.id_jns_sdm = 13
            AND ptk.id_sms=sms.id_sms
        ) AS kontrak_wanita
      FROM
        pdrd.sms AS sms
      WHERE
        sms.soft_delete = 0
        AND sms.id_jns_sms NOT IN (2,3)
      ORDER BY
        sms.id_jns_sms,
        sms.nm_lemb ASC
    ");

    return \DataTables::of($data)->addIndexColumn()->make(true);
  }

	public function times_higher_education_ranking()
	{
		$title = 'Times Higher Education Ranking';
    $pageConfigs = ['myLayout' => 'horizontal'];

		$TheWur = dom_xpath(
				'https://www.timeshighereducation.com/world-university-rankings/university-lampung',
				'/html/body/div[4]/div/section/div/div/div[1]/div/div/div[1]/div/section/div/div/div[4]/div/div/div[1]/span'
			);

        $dataTheWur['rank_by_world'] = trim(str_replace('th', '', $TheWur[0]->textContent));
        $dataTheWur['rank_by_impact'] = trim(str_replace('th', '', $TheWur[1]->textContent));
        $dataTheWur['rank_by_asian'] = trim(str_replace('th', '', $TheWur[2]->textContent));

		return view('content.pages.pages-times-higher-education-ranking', [
      'pageConfigs' => $pageConfigs,
      'title' => $title,
      'dataTheWur' => $dataTheWur
    ]);
	}

	public function qs_world_university_ranking()
	{
		$title = 'QS World University Ranking';
    $pageConfigs = ['myLayout' => 'horizontal'];

		$QsWorld = dom_xpath(
			'https://www.topuniversities.com/universities/university-lampung',
			'//*[@id="wur-tab"]/div'
		);
		$dataQsWordUniversity['rank_by_world'] = substr($QsWorld[0]->textContent, 1);
		$QsAsian = dom_xpath(
			'https://www.topuniversities.com/universities/university-lampung',
			'//*[@id="item-514"]/div'
		);
		$dataQsWordUniversity['rank_by_asia'] = substr($QsAsian[0]->textContent, 1);
		$QsAsean = dom_xpath(
			'https://www.topuniversities.com/universities/university-lampung',
			'//*[@id="item-4088"]/div'
		);
		$dataQsWordUniversity['rank_by_asean'] = substr($QsAsean[0]->textContent, 2);

		return view('content.pages.pages-qs-world-university-ranking', [
      'pageConfigs' => $pageConfigs,
      'title' => $title,
      'dataQsWordUniversity' => $dataQsWordUniversity
    ]);
	}

	public function green_metric_ranking()
	{
		$title = 'Green Metric Ranking';
    $pageConfigs = ['myLayout' => 'horizontal'];
    $year = date('Y')-1;

    $GreenmetricWorld = dom_xpath(
        "https://greenmetric.ui.ac.id/rankings/overall-rankings-{$year}",
        '//table/tbody'
    )[0]->getElementsByTagName('tr');

    foreach ($GreenmetricWorld as $singleTable) {
        $td = $singleTable->getElementsByTagName('td');
        if (trim($td[1]->textContent) === "Lampung University") {
        $dataGreenmetric['rank_by_world'] = $td[0]->textContent;
        $dataGreenmetric['total_score'] = $td[3]->textContent;
        break;
        }
    }

    $GreenmetricIndo = dom_xpath(
        "https://greenmetric.ui.ac.id/rankings/ranking-by-country-{$year}/Indonesia",
        '//table/tbody'
    )[0]->getElementsByTagName('tr');

    foreach ($GreenmetricIndo as $singleTable) {
        $td = $singleTable->getElementsByTagName('td');
        if (trim($td[1]->textContent) === "Lampung University") {
        $dataGreenmetric['rank_by_indonesian'] = $td[0]->textContent;
        break;
        }
    }

    $GreenmetricIndo = dom_xpath(
        "https://greenmetric.ui.ac.id/rankings/ranking-by-region-{$year}/asia",
        '//table/tbody'
    )[0]->getElementsByTagName('tr');

    foreach ($GreenmetricIndo as $singleTable) {
        $td = $singleTable->getElementsByTagName('td');
        if (trim($td[1]->textContent) === "Lampung University") {
        $dataGreenmetric['rank_by_asian'] = $td[0]->textContent;
        break;
        }
    }

		return view('content.pages.pages-green-metric', [
      'pageConfigs' => $pageConfigs,
      'title' => $title,
      'dataGreenmetric' => $dataGreenmetric
    ]);
	}

    public function webometrics_ranking()
    {
        $title = 'Webometrics Ranking';
        $pageConfigs = ['myLayout' => 'horizontal'];

        $dataWebometrics = [];

        return view('content.pages.pages-webometrics-ranking', [
          'pageConfigs' => $pageConfigs,
          'title' => $title,
          'dataWebometrics' => $dataWebometrics
        ]);
    }

}
