@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6>Data Alumni</h6>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Pekerjaan</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tahun Masuk</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tahun Lulus</th>
                    
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div>
                          <img src="../assets/img/girl.png" class="avatar avatar-sm me-3" alt="user1">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">Aprily Ayu Anbar</h6>
                          <p class="text-xs text-secondary mb-0">aprilyayu2204@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p class="text-xs font-weight-bold mb-0">Web Developer</p>
                      <p class="text-xs text-secondary mb-0">Staff</p>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">2015</span>
                      </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">2020</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div>
                          <img src="../assets/img/girl.png" class="avatar avatar-sm me-3" alt="user2">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">Zuliana Nur Fadhlila</h6>
                          <p class="text-xs text-secondary mb-0">zuliana@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">Web Developer</p>
                        <p class="text-xs text-secondary mb-0">Staff</p>
                      </td>
                      <td class="align-middle text-center">
                          <span class="text-secondary text-xs font-weight-bold">2015</span>
                        </td>
                      <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">2020</span>
                      </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div>
                          <img src="../assets/img/boy.png" class="avatar avatar-sm me-3" alt="user3">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">Mizar Zulmi Ramadhan</h6>
                          <p class="text-xs text-secondary mb-0">mizar@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">Web Developer</p>
                        <p class="text-xs text-secondary mb-0">Staff</p>
                      </td>
                      <td class="align-middle text-center">
                          <span class="text-secondary text-xs font-weight-bold">2017</span>
                        </td>
                      <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">2021</span>
                      </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div>
                          <img src="../assets/img/boy.png" class="avatar avatar-sm me-3" alt="user4">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">Rio Ananda Putra</h6>
                          <p class="text-xs text-secondary mb-0">rio@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p class="text-xs font-weight-bold mb-0">Programator</p>
                      <p class="text-xs text-secondary mb-0">Developer</p>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">2017</span>
                      </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">2021</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div>
                          <img src="../assets/img/boy.png" class="avatar avatar-sm me-3" alt="user5">
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">Tegar Wisnu Pambudi</h6>
                          <p class="text-xs text-secondary mb-0">tegar@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p class="text-xs font-weight-bold mb-0">Manager</p>
                      <p class="text-xs text-secondary mb-0">Executive</p>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">2017</span>
                      </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">2021</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
