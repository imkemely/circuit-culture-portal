import { SelectField, TextField } from './fields'
import { COUNTRIES, US_STATES } from '../lib/usStates'

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s.code, label: s.code }))
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }))

// Shared by the shipping address (SCR-02) and the billing address (SCR-03).
// `section` is "shipping" or "billing" for browser autofill.
export default function AddressFields({ section, values, errors, touched, onChange, onBlur, includePhone }) {
  const field = (name, autoComplete) => ({
    id: `${section}-${name}`,
    value: values[name],
    error: errors[name],
    showError: touched[name],
    autoComplete: `${section} ${autoComplete}`,
    onChange: (e) => onChange(name, e.target.value),
    onBlur: () => onBlur(name),
  })

  return (
    <div className="cc-grid">
      <TextField label="First name" required maxLength={40} {...field('firstName', 'given-name')} />
      <TextField label="Last name" required maxLength={40} {...field('lastName', 'family-name')} />
      <TextField className="cc-span-2" label="Address line 1" required maxLength={100} {...field('line1', 'address-line1')} />
      <TextField className="cc-span-2" label="Address line 2 (apt, suite)" maxLength={100} {...field('line2', 'address-line2')} />
      <TextField label="City" required maxLength={50} {...field('city', 'address-level2')} />
      <SelectField label="State" required placeholder="Select" options={STATE_OPTIONS} {...field('state', 'address-level1')} />
      <TextField label="ZIP code" required inputMode="numeric" maxLength={10} {...field('zip', 'postal-code')} />
      <SelectField label="Country" required options={COUNTRY_OPTIONS} {...field('country', 'country')} />
      {includePhone && (
        <TextField label="Phone" required type="tel" maxLength={20} {...field('phone', 'tel')} />
      )}
    </div>
  )
}
