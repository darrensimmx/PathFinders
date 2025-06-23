export default function FormInput({
  id, 
  label, 
  value, 
  onChange,
  type = "text",
  required = true,
  disabled = false,
  placeholder = "",
  className="",
}) 
{
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-white"> {label} </label>
      <input 
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white" />
    </div>
  )
}