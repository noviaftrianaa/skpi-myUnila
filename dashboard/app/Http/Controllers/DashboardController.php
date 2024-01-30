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
		return view('content.pages.pages-home');
	}

	public function times_higher_education_ranking()
	{
		$title = 'Times Higher Education Ranking';

		$TheWur = dom_xpath(
				'https://www.timeshighereducation.com/world-university-rankings/university-lampung',
				'/html/body/div[4]/div/section/div/div/div[1]/div/div/div[1]/div/section/div/div/div[4]/div/div/div[1]/span'
			);

        $dataTheWur['rank_by_world'] = trim(str_replace('th', '', $TheWur[0]->textContent));
        $dataTheWur['rank_by_impact'] = trim(str_replace('th', '', $TheWur[1]->textContent));
        $dataTheWur['rank_by_asian'] = trim(str_replace('th', '', $TheWur[2]->textContent));

		return view('content.pages.pages-times-higher-education-ranking');
	}

	public function qs_world_university_ranking()
	{
		$title = 'QS World University Ranking';

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

		return view('content.pages.pages-qs-world-university-ranking', compact('title','dataQsWordUniversity'));
	}

	public function green_metric_ranking()
	{
		$title = 'Green Metric Ranking';
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

		return view('content.pages.pages-green-metric', compact('title','dataGreenmetric'));
	}

    public function webometrics_ranking()
    {
        $title = 'Webometrics Ranking';

        $webometrics = dom_xpath(
            'https://www.webometrics.info/en/Asia/Indonesia',
			'/html'
        );
        dd($webometrics);

        return view('content.pages.pages-webometrics-ranking', compact('title','dataWebometrics'));
    }

}
