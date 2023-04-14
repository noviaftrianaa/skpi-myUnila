<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class Iku1Export implements FromView, WithTitle, ShouldAutoSize
{
    public function __construct($thn_iku, $data)
    {
        $this->thn_iku = $thn_iku;
        $this->data = $data;
    }
    
    /**
     * @return Builder
     */
    public function view(): View
    {
        $thn_iku = $this->thn_iku;
        $data = $this->data;
        return view('dashboard.export.iku1', compact('thn_iku','data'));
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'LAPORAN IKU 1 UNIVERSITAS LAMPUNG';
    }
}
