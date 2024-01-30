<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
      $pageConfigs = ['myLayout' => 'vertical'];
      return view('content.main.dashboard', compact('pageConfigs'));
    }
}
