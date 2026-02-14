import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options })
}

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
