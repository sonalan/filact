/**
 * Panel Component
 * Main panel component that renders the complete admin interface
 */

import type { ReactNode } from 'react'
import { PanelProvider } from './PanelProvider'
import type { PanelConfig } from './types'

/**
 * Panel component props
 */
export interface PanelProps {
  /** Panel configuration */
  config: PanelConfig

  /** Custom children (optional) */
  children?: ReactNode
}

/**
 * Main Panel component
 *
 * This component sets up the panel context and renders the admin interface.
 * It handles authentication, routing, layout, and navigation.
 *
 * @example
 * ```tsx
 * import { Panel, createPanel } from '@filact/core'
 *
 * const panel = createPanel('admin', 'Admin Panel')
 *   .provider(restProvider)
 *   .resources([userResource, postResource])
 *   .build()
 *
 * function App() {
 *   return <Panel config={panel} />
 * }
 * ```
 */
export function Panel({ config, children }: PanelProps) {
  return (
    <PanelProvider config={config}>
      {children || <DefaultPanelContent />}
    </PanelProvider>
  )
}

/**
 * Default panel content when no children provided
 * This will be replaced with the actual layout, navigation, and routing
 */
function DefaultPanelContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Panel Initialized
              </h2>
              <p className="text-gray-600">
                The panel layout and routing will be added in the next steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
