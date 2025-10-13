@extends('mahasiswa::layouts.master')
@section('title', 'Bimbingan')

@section('css')
<style>

.chat-messages {
    display: flex;
    flex-direction: column;
    max-height: 800px;
    overflow-y: scroll
}

.chat-message-left,
.chat-message-right {
    display: flex;
    flex-shrink: 0
}

.chat-message-left {
    margin-right: auto
}

.chat-message-right {
    flex-direction: row-reverse;
    margin-left: auto
}
.py-3 {
    padding-top: 1rem!important;
    padding-bottom: 1rem!important;
}
.px-4 {
    padding-right: 1.5rem!important;
    padding-left: 1.5rem!important;
}
.flex-grow-0 {
    flex-grow: 0!important;
}
.border-top {
    border-top: 1px solid #dee2e6!important;
}
</style>
@stop

@section('content')
<div class="container-fluid py-4">
    <main class="content">
            <div class="card">
                <h5 class="card-header d-flex justify-content-between align-items-center"> Pesan Bimbingan </h5>
                <div class="row g-0">
                    <div class="col-12 col-lg-5 col-xl-3 border-right">
                        <div class="px-4 d-none d-md-block">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <input type="text" class="form-control my-3" placeholder="Search...">
                                </div>
                            </div>
                        </div>

                        <a href="#" class="list-group-item list-group-item-action border-0">
                            <div class="badge bg-success float-right">1</div>
                            <div class="d-flex align-items-start">
                                <img src="https://bootdey.com/img/Content/avatar/avatar5.png" class="rounded-circle mr-3" alt="Vanessa Tucker" width="40" height="40">
                                <div class="flex-grow-1">
                                    INDRIYANTO
                                    <div class="small"><span class="fas fa-circle chat-online"></span>196211271986031003</div>
                                </div>
                            </div>
                        </a>

                        <hr class="d-block d-lg-none mt-1 mb-0">
                    </div>
                    <div class="col-12 col-lg-7 col-xl-9">


                        <div class="position-relative">
                            <div class="chat-messages p-4">

                                <div class="chat-message-right pb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:33 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                        <div class="font-weight-bold mb-1">You</div>
                                        Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
                                    </div>
                                </div>

                                <div class="chat-message-left pb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar3.png" class="rounded-circle mr-1" alt="INDRIYANTO" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:34 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                        <div class="font-weight-bold mb-1">INDRIYANTO</div>
                                        Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
                                    </div>
                                </div>

                                <div class="chat-message-right mb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:35 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                        <div class="font-weight-bold mb-1">You</div>
                                        Cum ea graeci tractatos.
                                    </div>
                                </div>

                                <div class="chat-message-right mb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:41 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                        <div class="font-weight-bold mb-1">You</div>
                                        Morbi finibus, lorem id placerat ullamcorper, nunc enim ultrices massa, id dignissim metus urna eget purus.
                                    </div>
                                </div>

                                <div class="chat-message-left pb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar3.png" class="rounded-circle mr-1" alt="INDRIYANTO" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:42 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                        <div class="font-weight-bold mb-1">INDRIYANTO</div>
                                        Sed pulvinar, massa vitae interdum pulvinar, risus lectus porttitor magna, vitae commodo lectus mauris et velit.
                                        Proin ultricies placerat imperdiet. Morbi varius quam ac venenatis tempus.
                                    </div>
                                </div>

                                <div class="chat-message-right mb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:43 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                        <div class="font-weight-bold mb-1">You</div>
                                        Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
                                    </div>
                                </div>

                                <div class="chat-message-left pb-4">
                                    <div>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar3.png" class="rounded-circle mr-1" alt="INDRIYANTO" width="40" height="40">
                                        <div class="text-muted small text-nowrap mt-2">2:44 am</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                        <div class="font-weight-bold mb-1">INDRIYANTO</div>
                                        Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="flex-grow-0 py-3 px-4 border-top">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Type your message">
                                <button class="btn bg-gradient-primary">Send</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

    </main>

</div>
@endsection
