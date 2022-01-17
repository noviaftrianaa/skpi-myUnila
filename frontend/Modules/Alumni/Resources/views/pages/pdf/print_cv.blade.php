<!DOCTYPE html>
<html>
<head>
	<title>Curriculum_Vitae_Aprily</title>
  <style>
    * {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  height: 1200px;
  font-size: 62.5%;
  font-family: Raleway, sans-serif;
}

hr {
  margin: 1.5rem 1rem;
  height: 1px;
  color: #FF6600;
}

.line {
  margin: 1.5rem 1rem;
  height: 1px;
  display: block;
  background: #D0D0D0;
}

.clearfix {
  clear: both;
}

.rect-blue {
  width: 100%;
  height: 16px;
  background: #1C4D98;
}

.rect-orange {
  width: 100%;
  height: 5px;
  margin-top: 4px;
  background: #FF6600;
}

.logo {
  position: absolute;
  width: 3rem;
  left: 27.5%;
  top: 0;
}

header {
  position: fixed;
  width: 100%;
}

footer {
  height: 25px;
  line-height: 25px;
  text-align: right;
  padding-right: 1rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #1C4D98;
  color: white;
}

.content-wrapper {
  width: 100%;
  height: auto;
  display: inline-block;
  
  font-size: 11pt;
  margin-top: .5rem;
  padding-top: 1.5rem;
}

.content-wrapper .bio {
  width: 30%;
  height: 1140px;
  border-right: 1px solid #D0D0D0;
}

.content-wrapper .story {
  width: 70%;
  font-size: 16px;

  padding: 1.5rem .5rem 0 1.5rem;
}

.content-wrapper > :not(:last-child) {
  float: left;
}

.content-wrapper .clearfix {
  clear: both;
}

/* BIO */

.bio h2 {
  font-size: 14pt;
  margin-top: .5rem;
  margin-left: 1.5rem;
  display: inline-block;
  border-bottom: 1px solid #FF6600;
}

/* to centering image in floating div, it has to be wrap inside a container div */
/* margin 0 auto will not work directly to image */
.bio__photo {
  margin: 2rem auto;
  
  width: 10rem;
  height: 13.34rem;
  position:relative;
}

.bio__photo div {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.bio__name {
  font-size: 18pt;
  font-weight: bold;
  margin: auto 1.5rem;
}

.bio__field {
  margin: 1.5rem 1.5rem 0 1.5rem;
}

.bio__field:last-child {
  margin-bottom: 1.5rem;
}

.bio__field p {
  font-weight: bold;
}

/* Story */

.story__title {
  margin-bottom: 1.5rem;
}

.story__title .title {
  padding-right: 1rem;
  display: inline;
  background: white;
    
  font-weight: bold;
}

.story__title .line {
  margin-top: -10px;
  display: block;
  border-bottom: 2px solid #FF6600; 
}

.story__section {
   margin-bottom: 1.5rem;
}

.story__section:last-child {
   margin-bottom: 0;
}

.story__section h4 {
  font-size: 11pt;
  margin-left: 1rem;
  margin-bottom: .25rem;
}

.story__section h4 {
  margin-top: 1rem;
}

.table {
/*   font-weight: bold; */
}

.table .row .column {
  float: left;
}

.table .row .column:first-child {
  width: 30%;
  text-align: center;
}

.table .row .column:last-child {
  width: 70%;
}

/* table */

/* reset table */
table,
thead,
tbody,
tfoot,
tr,
th,
td {
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
  border: none;
  border-collapse: inherit;
  border-spacing: 0;
  border-color: inherit;
  text-align: left;
  font-weight: inherit;
}

table {
  border: none;
  width: 100%;
  padding: 0 1rem;
  font-size: 11pt;
}

table tr:nth-of-type(odd) {
  background: #eee;
}

table tr td:first-child {
  width: 30%;
  text-align: center;
  padding: 3px;
  font-weight: bold;
}

table tr td:last-child {
  width: 70%;
  padding-left: 1rem;
}
  </style>
  </head>
  <body>
    <header>
      <div class="rect-blue"></div>
      <div class="rect-orange"></div>
      
    </header>
    <div class="content-wrapper">
      <div class="bio">
          <h2>Curriculum Vitae</h2>
         <div class="bio__photo">
  <!--          <img src="https://picsum.photos/200/300" alt=""> -->
           <div style="background-image: url('../assets/img/ily.jpe')">
             
           </div>
         </div>
        <div class="bio__name">Aprily Ayu Anbar</div>
        <div class="bio__field">
          <label>Tempat/Tanggal Lahir</label>
          <p>Bandar Lampung, 22 April 1997</p>
        </div>
        <div class="bio__field">
          <label>Jenis Kelamin</label>
          <p>Perempuan</p>
        </div>
        <div class="bio__field">
          <label>Agama</label>
          <p>Islam</p>
        </div>
        <div class="bio__field">
          <label>Alamat Rumah</label>
          <p>Jalan MS BatuBara no. 38/40 Kupang Teba, TBU, Bandar Lampung</p>
        </div>
        <div class="bio__field">
          <label>Alamat Email</label>
          <p>aprily@gmail.com </p>
        </div>
        <div class="bio__field">
          <label>NIK</label>
          <p>1223456789045</p>
        </div>
        <div class="line"></div>
      </div>
      <div class="story">
        
  <!--  jenjang pendidikan      -->
  <div class="story__section">
    <div class="story__title">
      <div class="title">
        Riwayat Pendidikan
       </div>
     <div class="line"></div>
   </div>
   
   <table>
     <tr>
       <td>2003 - 2009</td>
       <td>SDN 2 Rawa Laut</td>
     </tr>
     <tr>
       <td>2009 - 2012</td>
       <td>SMPN 1 Bandar Lampung</td>
     </tr>
     <tr>
      <td>2012 - 2015</td>
      <td>SMAN 10 Bandar Lampung</td>
    </tr>
    <tr>
      <td>2015 - 2020</td>
      <td>Universitas Lampung</td>
    </tr>
   </table>
 </div>
        
  <!--   riwayat jabatan   -->
        <div class="story__section">
           <div class="story__title">
             <div class="title">
               Riwayat Pekerjaan
              </div>
            <div class="line"></div>
          </div>
          <table>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>
        
  <!--   penelitian     -->
        <div class="story__section">
           <div class="story__title">
             <div class="title">
               Pelatihan
              </div>
            <div class="line"></div>
          </div>
          <table>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>

       <!--   organisasi     -->
        <div class="story__section">
          <div class="story__title">
            <div class="title">
              Riwayat Organisasi
             </div>
           <div class="line"></div>
         </div>
         <table>
           <tr>
             <td></td>
             <td></td>
           </tr>
           <tr>
             <td></td>
             <td></td>
           </tr>
           <tr>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
          </tr>
         </table>
       </div>
      </div>
      <div class="clearfix"></div>
    </div>
    <footer>
      Dibuat oleh <b>PDUT UNILA</b> pada Mon 3 Desember 11:37 WIB 2022
    </footer>
  </body> 
</html>
              
           