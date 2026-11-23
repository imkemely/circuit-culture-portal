// Form fields with inline, per-field errors (D2: "Validation: Inline, per field").
// Errors show once the field has been touched, so a fresh form isn't all red.

function errorProps(id, error, showError) {
  const visible = Boolean(showError && error)
  return {
    visible,
    inputProps: {
      'aria-invalid': visible || undefined,
      'aria-describedby': visible ? `${id}-error` : undefined,
    },
  }
}

export function TextField({ id, label, required, error, showError, className = '', ...inputProps }) {
  const { visible, inputProps: aria } = errorProps(id, error, showError)
  return (
    <div className={`cc-field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input id={id} required={required} {...aria} {...inputProps} />
      {visible && <p id={`${id}-error`} className="cc-field-error">{error}</p>}
    </div>
  )
}

export function SelectField({ id, label, required, error, showError, options, placeholder, className = '', ...selectProps }) {
  const { visible, inputProps: aria } = errorProps(id, error, showError)
  return (
    <div className={`cc-field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select id={id} required={required} {...aria} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {visible && <p id={`${id}-error`} className="cc-field-error">{error}</p>}
    </div>
  )
}
