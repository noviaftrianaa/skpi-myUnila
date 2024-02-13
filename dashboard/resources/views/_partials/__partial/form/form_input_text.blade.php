<div class="form-group row">
    <label for="{{ $fieldname }}" class="col-sm-{{ !is_null($column)?$column:2 }} col-form-label">{!! $label.($required==true?'<span style="color:red;"> *</span>':null) !!}</label>
    <div class="col-sm-{{ !is_null($column)?(12-$column):10 }}">
        <input name="{{ $fieldname }}" id="{!! $fieldname.(!is_null($id)?' '.$id:null) !!}" type="{{ $type }}" class="form-control{!! (!is_null($class)?' '.$class:null) !!}{{($errors->has($fieldname)?" is-invalid":"")}}" value="{{ (!is_null($data))?$data:old($fieldname) }}" placeholder="{!! $placeholder !!}"
               @if($required==true)
               required
               @endif
               @if($readonly==true)
               readonly
            @endif
            {{ ($attr?$attr:"") }}
        @if($prop)
            @foreach($prop AS $key=>$value)
                {{ $key.'='.$value.'' }}
                @endforeach
            @endif
        >
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
