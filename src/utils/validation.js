export function validatePhone(phone) {
  const digits = phone.replace(/[^0-9]/g, "")
  if (digits.length !== 10) {
    return "Phone number must be exactly 10 digits"
  }
  return null
}

export function phoneInputHandler(e, setter) {
  const val = e.target.value.replace(/[^0-9]/g, "")
  if (val.length <= 10) setter(val)
}