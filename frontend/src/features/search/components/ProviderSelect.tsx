/**
 * ProviderSelect Component
 * Dropdown for selecting git provider (currently only GitHub is supported)
 */

import { Select } from '../../../shared/components/Select'

export type ProviderSelectProps = {
  /** Current provider value */
  value: string
  /** Handler for value changes */
  onChange: (value: string) => void
  /** Disabled state for entire select */
  disabled?: boolean
}

/**
 * Available git providers
 * Only GitHub is currently supported, others are coming soon
 */
const PROVIDERS = [
  { value: 'github', label: 'GitHub', disabled: false },
  { value: 'gitlab', label: 'GitLab (Coming soon)', disabled: true },
  { value: 'bitbucket', label: 'Bitbucket (Coming soon)', disabled: true },
] as const

export function ProviderSelect({ value, onChange, disabled = false }: ProviderSelectProps) {
  return (
    <Select
      label="Provider"
      value={value}
      options={PROVIDERS}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
