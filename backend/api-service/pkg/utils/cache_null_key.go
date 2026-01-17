package utils

func IntPtrVal(v *int) interface{} {
	if v == nil {
		return "null"
	}
	return *v
}
