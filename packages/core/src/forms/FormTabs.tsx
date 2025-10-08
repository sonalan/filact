/**
 * FormTabs Component
 * Tabs component for organizing form sections
 */

import { useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Tab item interface
 */
export interface FormTab {
  /** Tab identifier */
  id: string

  /** Tab label */
  label: string

  /** Tab content */
  content: ReactNode

  /** Whether tab is disabled */
  disabled?: boolean

  /** Tab icon */
  icon?: ReactNode
}

/**
 * Form tabs props
 */
export interface FormTabsProps {
  /** Tab items */
  tabs: FormTab[]

  /** Default active tab */
  defaultTab?: string

  /** Active tab (controlled) */
  activeTab?: string

  /** Tab change handler */
  onTabChange?: (tabId: string) => void

  /** Custom className */
  className?: string

  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * FormTabs Component
 */
export function FormTabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
  orientation = 'horizontal',
}: FormTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTab = controlledActiveTab || internalActiveTab
  const isVertical = orientation === 'vertical'

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return

    setInternalActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={`${isVertical ? 'flex gap-6' : ''} ${className}`}>
      {/* Tab Headers */}
      <div
        className={`
          ${isVertical ? 'flex flex-col border-r border-gray-200 pr-4 min-w-[200px]' : 'border-b border-gray-200'}
        `}
      >
        <div className={`flex ${isVertical ? 'flex-col gap-1' : 'gap-4'}`}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            const isDisabled = tab.disabled

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id, tab.disabled)}
                disabled={isDisabled}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${isVertical ? 'text-left rounded-md' : 'border-b-2'}
                  ${isActive
                    ? isVertical
                      ? 'bg-blue-50 text-blue-700'
                      : 'border-blue-600 text-blue-600'
                    : isVertical
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-selected={isActive}
                aria-disabled={isDisabled}
                role="tab"
              >
                <div className="flex items-center gap-2">
                  {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`${isVertical ? 'flex-1' : 'mt-6'}`} role="tabpanel">
        {activeTabContent}
      </div>
    </div>
  )
}
