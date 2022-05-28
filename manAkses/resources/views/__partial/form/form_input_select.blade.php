<div class="form-group row">
    <label for="{{ $fieldname }}" class="col-sm-{{ !is_null($column)?$column:2 }} col-form-label">{!! $label.($required==true?'<span style="color:red;"> *</span>':null) !!}</label>
    <div class="col-sm-{{ !is_null($column)?(12-$column):10 }}">
        <select name="{{ $fieldname }}" id="{{ $fieldname }}" class="form-control{{($errors->has($fieldname)?" is-invalid":"")}}"
                @if($required==true)
                required
            @endif
            {{ ($attr?$attr:"") }}>
            @if($default==true)
                <option value="" selected>-Pilih-</option>
            @endif
            @foreach($list as $key=>$value)
                <option value="{{ $key }}" {{ ((!is_null($data)||@old($fieldname))?(($key==((!is_null($data))?$data:((@old($fieldname))?old($fieldname):"")))?"selected":""):"") }}>
                    {{ $value }}
                </option>
            @endforeach
        </select>
        @if($errors->has($fieldname))
            <div class="invalid-feedback">
                {{ $errors->first($fieldname) }}
            </div>
        @endif
        @if(!is_null($helper))
            <span class="text-danger">
                {{ $helper }}
            </span>
        @endif
    </div>
</div>
