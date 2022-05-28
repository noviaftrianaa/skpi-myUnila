<div class="form-group row">
    <label for="{{ $fieldname }}" class="col-sm-2 col-form-label">{!! $label.($required==true?'<span style="color:red;"> *</span>':null) !!}</label>
    <div class="col-sm-10">
        <textarea name="{{ $fieldname }}" id="{{ $fieldname }}" rows="5" class="form-control{{($errors->has($fieldname)?" is-invalid":"")}}" placeholder="{{ $label }}"
            @if($required==true)
                required
            @endif
                {{ ($attr?$attr:"") }}>{{ (!is_null($data))?$data:old($fieldname) }}</textarea>
        @if($errors->has($fieldname))
            <div class="invalid-feedback">
                {{ $errors->first($fieldname) }}
            </div>
        @endif
    </div>
</div>
