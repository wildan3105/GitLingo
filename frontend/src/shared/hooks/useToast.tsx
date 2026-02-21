/**
 * Toast Context and Hook
 * Global toast notification system using React Context
 */

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import { Toast, ToastContainer, type ToastType } from '../components/Toast'

// Toast data structure
export type ToastData = {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Toast state
type ToastState = {
  toasts: ToastData[]
}

// Actions
type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastData }
  | { type: 'REMOVE_TOAST'; payload: string }

// Context type
type ToastContextType = {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  dismissToast: (id: string) => void
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Reducer
function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      }
    default:
      return state
  }
}

// Initial state
const initialState: ToastState = {
  toasts: [],
}

// Provider props
export type ToastProviderProps = {
  children: ReactNode
  /** Position of toast container */
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  /** Default duration in milliseconds */
  defaultDuration?: number
}

/**
 * Toast Provider Component
 *
 * Wraps the app to provide global toast notification functionality
 *
 * @example
 * ```typescript
 * <ToastProvider position="top-right" defaultDuration={3000}>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({
  children,
  position = 'top-right',
  defaultDuration = 3000,
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialState)

  // Show a new toast
  const showToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const duration = toast.duration ?? defaultDuration

      // Add toast
      dispatch({
        type: 'ADD_TOAST',
        payload: { ...toast, id, duration },
      })

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_TOAST', payload: id })
        }, duration)
      }
    },
    [defaultDuration]
  )

  // Dismiss a toast manually
  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer position={position}>
        {state.toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={dismissToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast functionality
 *
 * @returns Toast context with showToast and dismissToast functions
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { showToast } = useToast()
 *
 *   const handleClick = () => {
 *     showToast({
 *       type: 'success',
 *       message: 'Operation completed!',
 *       duration: 3000
 *     })
 *   }
 *
 *   return <button onClick={handleClick}>Show Toast</button>
 * }
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextType {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
