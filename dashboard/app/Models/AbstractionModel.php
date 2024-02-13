<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Auth, Input, Storage, File;

class AbstractionModel extends Model
{
    use HasFactory;
    public static $get_name_column = [];

    public function __construct($value=null, array $attributes = array())
    {
        parent::__construct($attributes);
        $this->set_fillable();
    }

    public function set_fillable()
    {
        $this->fillable = $this->get_all_columns();
    }

    public function get_all_columns($table='')
    {
        $table = $table == '' ? $this->get_schema_table()['table'] : $table;
        $columns = DB::table('information_schema.columns')
            ->select('column_name')
            ->where('table_name', $table)
            ->get();
        $arr = [];
        foreach($columns as $r)
            $arr[] = $r->column_name;
        return $arr;
    }

    public function get_schema_table($table='')
    {
        $table = ($table=='')? $this->getTable():$table;
        $e = explode('.', $table);
        $table_schema = $e[0];
        $table_name = $e[1];
        return [
            'schema' => $table_schema,
            'table' => $table_name,
        ];
    }

    public function prepare(array $input)
    {
        // melakukan pengecekan type primary-key
        $cek = $this->getConnection()->getDoctrineColumn($this->table, $this->primaryKey)->getType()->getName();

        // lakukan pengecekan jika ada Input yang tidak diisi, otomatis di set NULL
        foreach($input as $key => $val)
        {
            if($val == '' && $val!==0)
                $input[$key] = null;

            if(!isset($input['_method'])){
                $input['_method'] = "POST";
            }
        }

        $fillable = $this->fillable;

        // melakukan pengisian field primaryKey secara otomatis
        if($input['_method']=="POST" && ($cek == "guid" || $cek == "string")) {
            if(!array_key_exists($this->primaryKey, $input))
            {
                $input[$this->primaryKey] = guid();
            }
        }

        // pengubahan isian default password menjadi bcrypt
        if(array_key_exists('password', $input)){
            $input['password'] = password_gen($input['password']);
        };

        // pengubahan isian default nama pengguna menjadi uppercase
        if(array_key_exists('nm_akun', $input)){
            $input['nm_akun'] = strtoupper($input['nm_akun']);
        };

        // pengubahan isian default nama pengawas menjadi uppercase
        if(array_key_exists('nama_pengawas', $input)){
            $input['nama_pengawas'] = ucwords(strtolower($input['nama_pengawas']));
        };
        if(array_key_exists('nama', $input)){
            $input['nama'] = ucwords(strtolower($input['nama']));
        };
        if(array_key_exists('nm_pengguna', $input)){
            $input['nm_pengguna'] = ucwords(strtolower($input['nm_pengguna']));
        };
        if(array_key_exists('nm_pd', $input)){
            $input['nm_pd'] = ucwords(strtolower($input['nm_pd']));
        };
        if(array_key_exists('nm_sdm', $input)){
            $input['nm_sdm'] = ucwords(strtolower($input['nm_sdm']));
        };

        // pengisian kolom secara default ketika proses create data baru
        if($input['_method']=='POST'){
            if(in_array('create_date', $fillable))
                $input['create_date'] = config('mp.exp_data_row.create_date');

            if(in_array('tgl_create', $fillable))
                $input['tgl_create'] = config('mp.exp_data_row.create_date');

            if(in_array('created_date', $fillable))
                $input['created_date'] = config('mp.exp_data_row.create_date');

            if (in_array('last_update', $fillable))
                $input['last_update'] = config('mp.exp_data_row.last_update');

            if (in_array('last_sync', $fillable))
                $input['last_sync'] = config('mp.exp_data_row.last_sync');

            if(in_array('id_creator', $fillable))
                $input['id_creator'] = (Auth::check())?getIDUser():(isset($input['id_akun'])?$input['id_akun'] : guid());

            if (!array_key_exists('id_updater', $input)) {
                if (in_array('id_updater', $fillable))
                    $input['id_updater'] = (Auth::check()) ? getIDUser() : (isset($input['id_akun'])?$input['id_akun'] : guid());
            }

            if(in_array('expired_date', $fillable))
                $input['expired_date'] = null;
        }
        if($input['_method']=='PUT' || $input['_method']=='PATCH') {
            if (in_array('last_update', $fillable))
                $input['last_update'] = config('mp.exp_data_row.last_update');

            if (in_array('last_sync', $fillable))
                $input['last_sync'] = config('mp.exp_data_row.last_sync');

            if (!array_key_exists('id_updater', $input)) {
                if (in_array('id_updater', $fillable))
                    $input['id_updater'] = (Auth::check()) ? getIDUser() : (isset($input['id_akun'])?$input['id_akun'] : guid());
            }
        }

        if(!array_key_exists('_method', $input))
        {
            if(($key = array_search($this->primaryKey, $this->fillable)) !== false) {
                unset($this->fillable[$key]);
            }
        }

//        unset($input['_method']);

        return $input;
    }

    protected $table;

    protected $primaryKey;

    protected $fillable = [];

    public $timestamps = false;
    public $incrementing = false;

    public function drop()
    {
        $fillable = $this->fillable;
        $params = [];
        $params['last_update'] = config('mp.exp_data_row.last_update');

        if(in_array('expired_date', $fillable))
            $params['expired_date'] =  currDateTime();

        if(in_array('soft_delete', $fillable))
            $params['soft_delete'] =  1;

        if(in_array('id_updater', $fillable))
            $params['id_updater'] = getIDUser();

        $this->update($params);
        return true;
    }
}
