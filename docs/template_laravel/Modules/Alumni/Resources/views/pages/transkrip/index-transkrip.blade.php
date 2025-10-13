@extends('alumni::layouts.master')

@section('content')

<div class="container-fluid py-4">
    <div class="page-header min-height-100 border-radius-xl mt-4">
        <div class="col-lg-12">
            <div class="card h-100">
              <div class="card-header pb-0 p-3">
                <div class="row">
                  <div class="col-6 d-flex align-items-center">
                    <h6 class="mb-0">Transkrip Akademik</h6>
                  </div>
                  <div class="col-6 text-end">
                    <button class="btn btn-outline-primary btn-sm"><i class="fa fa-download"></i></button>
                  </div>
                </div>
              </div>
              <div class="card-body p-3 pb-0">
                <ul class="list-group">
                  
                <table class="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Mata Kuliah</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">SKS</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">HM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1.</td>
                        <td>Algoritma dan Pemrograman 1</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>2.</td>
                        <td>Bahasa Indonesia</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>3.</td>
                        <td>Bahasa Inggris</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>4.</td>
                        <td>Fisika Dasar</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>5.</td>
                        <td>Kalkulus 1</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>6.</td>
                        <td>Pendidikan Agama Islam</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>7.</td>
                        <td>Pendidikan Pancasila</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>8.</td>
                        <td>Pengantar Teknologi Informasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>9.</td>
                        <td>Probabilitas Statistik</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">C+</td>
                      </tr>
                      <tr>
                        <td>10.</td>
                        <td>Algoritma dan Pemrograman 2</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>11.</td>
                        <td>Bahasa Inggris Teknik</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">C+</td>
                      </tr>
                      <tr>
                        <td>12.</td>
                        <td>Dasar Elektronika</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>13.</td>
                        <td>Kalkulus 2</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">C</td>
                      </tr>
                      <tr>
                        <td>14.</td>
                        <td>Logika</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>15.</td>
                        <td>Metode Numerik</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>16.</td>
                        <td>Pendidikan Kewarganegaraan</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>17.</td>
                        <td>Praktikum Algoritma dan Pemrograman 1</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>18.</td>
                        <td>Praktikum Fisika Dasar</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>19.</td>
                        <td>Sistem Informasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>20.</td>
                        <td>Antarmuka dan Peripheral</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>21.</td>
                        <td>Interaksi Manusia dan Komputer</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>22.</td>
                        <td>Kecerdasan Buatan</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>23.</td>
                        <td>Matematika Diskrit</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>24.</td>
                        <td>Praktikum Dasar Elektronika</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>25.</td>
                        <td>Praktikum Struktur Data</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>26.</td>
                        <td>Rekayasa Perangkat Lunak</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>27.</td>
                        <td>Sistem Operasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>28.</td>
                        <td>Embedded System</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>29.</td>
                        <td>Jaringan Komputer</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>30.</td>
                        <td>Kewirausahaan</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">C</td>
                      </tr>
                      <tr>
                        <td>31.</td>
                        <td>Organisasi dan Arsitektur Komputer</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">C</td>
                      </tr>
                      <tr>
                        <td>32.</td>
                        <td>Pemrograman Berorientasi Objek</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>33.</td>
                        <td>Praktikum Embedded System</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>34.</td>
                        <td>Praktikum Rekayasa Perangkat Lunak</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>35.</td>
                        <td>Sistem Basis Data</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>36.</td>
                        <td>Teori Bahasa dan Automata</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>37</td>
                        <td>Ekonomi Teknik</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>38.</td>
                        <td>Etika Profesi</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>39.</td>
                        <td>Keamanan Sistem Informasi</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>40.</td>
                        <td>Manajemen Proyek Teknologi Informasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">C</td>
                      </tr>
                      <tr>
                        <td>41.</td>
                        <td>Pemrograman Web</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>42.</td>
                        <td>Pengolahan Citra</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>43.</td>
                        <td>Praktikum Jaringan Komputer</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>44.</td>
                        <td>Praktikum Sistem Basis Data</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B+</td>
                      </tr>
                      <tr>
                        <td>45.</td>
                        <td>Sistem Paralel dan Terdistribusi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>46.</td>
                        <td>Tata Kelola Teknologi Informasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>47.</td>
                        <td>E-Bussiness</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>48.</td>
                        <td>Internet of Things</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>49.</td>
                        <td>Metodologi Penelitian</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>50.</td>
                        <td>Mobile Computing</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>51.</td>
                        <td>Praktek Kerja Lapangan</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>52.</td>
                        <td>Praktikum Keamanan Sistem Informasi</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>53.</td>
                        <td>Praktikum Pemrograman Web</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">C</td>
                      </tr>
                      <tr>
                        <td>54.</td>
                        <td>Semantik Web</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>55.</td>
                        <td>Sistem Informasi Geografis</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>56.</td>
                        <td>Data Mining</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>57.</td>
                        <td>KKN Tematik</td>
                        <td class="align-middle text-center">2</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>58.</td>
                        <td>Proyek Teknologi Informasi</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">B</td>
                      </tr>
                      <tr>
                        <td>59</td>
                        <td>Web Framework</td>
                        <td class="align-middle text-center">3</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>60</td>
                        <td>Seminar Hasil</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>61.</td>
                        <td>Seminar Usul</td>
                        <td class="align-middle text-center">1</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                      <tr>
                        <td>62.</td>
                        <td>Skripsi</td>
                        <td class="align-middle text-center">4</td>
                        <td class="align-middle text-center">A</td>
                      </tr>
                    </tbody>
                    </table>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
