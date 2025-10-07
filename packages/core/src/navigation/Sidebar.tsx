/**
 * Sidebar Navigation Component
 * Displays navigation items for resources and custom pages
 */

import { useState, useMemo } from 'react'
import type { NavigationItem } from '../panel/types'
import { usePanel } from '../panel/PanelProvider'

/**
 * Sidebar props
 */
export interface SidebarProps {
  /** Current active path */
  activePath?: string

  /** Collapsed state */
  collapsed?: boolean

  /** Collapse toggle handler */
  onCollapse?: (collapsed: boolean) => void

  /** Sidebar position */
  position?: 'left' | 'right'

  /** Custom className */
  className?: string

  /** Show icons */
  showIcons?: boolean

  /** Show labels */
  showLabels?: boolean

  /** Custom navigation items */
  items?: NavigationItem[]
}

/**
 * Sidebar Navigation Component
 */
export function Sidebar({
  activePath = '',
  collapsed = false,
  onCollapse,
  position = 'left',
  className = '',
  showIcons = true,
  showLabels = true,
  items: customItems,
}: SidebarProps) {
  const { config, resources } = usePanel()

  // Build navigation items from resources and custom items
  const navigationItems = useMemo(() => {
    const items: NavigationItem[] = []

    // Add custom navigation items
    if (customItems) {
      items.push(...customItems)
    } else if (config.navigation?.customItems) {
      items.push(...config.navigation.customItems)
    }

    // Add resource navigation items
    if (config.navigation?.groupResources !== false) {
      // Group by resource group or use default
      const grouped = new Map<string, NavigationItem[]>()

      resources.forEach((resource) => {
        const group = resource.navigation?.group || 'Resources'
        if (!grouped.has(group)) {
          grouped.set(group, [])
        }

        const item: NavigationItem = {
          name: resource.model.name,
          label: resource.model.label || resource.model.name,
          path: `${config.path || ''}/${resource.model.endpoint}`,
          icon: resource.navigation?.icon,
          order: resource.navigation?.order,
          badge: resource.navigation?.badge,
          badgeColor: resource.navigation?.badgeColor,
        }

        grouped.get(group)!.push(item)
      })

      // Add grouped items
      grouped.forEach((groupItems, groupName) => {
        // Sort items by order
        groupItems.sort((a, b) => (a.order || 0) - (b.order || 0))

        if (groupName === 'Resources' && grouped.size === 1) {
          // Don't group if there's only one group
          items.push(...groupItems)
        } else {
          items.push({
            name: groupName,
            label: groupName,
            path: '',
            children: groupItems,
          })
        }
      })
    } else {
      // Add resources as flat list
      resources.forEach((resource) => {
        items.push({
          name: resource.model.name,
          label: resource.model.label || resource.model.name,
          path: `${config.path || ''}/${resource.model.endpoint}`,
          icon: resource.navigation?.icon,
          order: resource.navigation?.order,
        })
      })
    }

    // Sort by order if specified
    if (config.navigation?.order) {
      items.sort((a, b) => {
        const aIndex = config.navigation!.order!.indexOf(a.name)
        const bIndex = config.navigation!.order!.indexOf(b.name)
        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    }

    return items
  }, [resources, config, customItems])

  const sidebarWidth = collapsed ? 'w-16' : 'w-64'
  const positionClass = position === 'right' ? 'right-0' : 'left-0'

  return (
    <aside
      className={`${sidebarWidth} ${positionClass} fixed top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${className}`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && config.branding?.name && (
          <div className="flex items-center gap-2">
            {config.branding.logo && (
              typeof config.branding.logo === 'string' ? (
                <img src={config.branding.logo} alt={config.branding.name} className="h-8 w-8" />
              ) : (
                config.branding.logo
              )
            )}
            <span className="font-semibold text-lg">{config.branding.name}</span>
          </div>
        )}

        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((item) => (
          <NavigationItemComponent
            key={item.name}
            item={item}
            activePath={activePath}
            collapsed={collapsed}
            showIcons={showIcons}
            showLabels={showLabels}
          />
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && config.branding?.footer && (
        <div className="h-12 border-t border-gray-200 flex items-center justify-center px-4 text-xs text-gray-500">
          {typeof config.branding.footer === 'string' ? (
            <span>{config.branding.footer}</span>
          ) : (
            config.branding.footer
          )}
        </div>
      )}
    </aside>
  )
}

/**
 * Individual navigation item component
 */
interface NavigationItemComponentProps {
  item: NavigationItem
  activePath: string
  collapsed: boolean
  showIcons: boolean
  showLabels: boolean
  depth?: number
}

function NavigationItemComponent({
  item,
  activePath,
  collapsed,
  showIcons,
  showLabels,
  depth = 0,
}: NavigationItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = activePath === item.path
  const hasChildren = item.children && item.children.length > 0

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const paddingLeft = depth > 0 ? `pl-${4 + depth * 4}` : 'pl-4'

  return (
    <div>
      <a
        href={item.path || '#'}
        onClick={hasChildren ? (e) => { e.preventDefault(); handleClick() } : undefined}
        className={`
          flex items-center gap-3 px-4 py-2.5 transition-colors
          ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}
          ${collapsed && !hasChildren ? 'justify-center' : ''}
          ${paddingLeft}
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        {showIcons && item.icon && (
          <span className="flex-shrink-0 w-5 h-5">
            {item.icon}
          </span>
        )}

        {showLabels && !collapsed && (
          <span className="flex-1 font-medium text-sm">{item.label}</span>
        )}

        {!collapsed && item.badge && (
          <span
            className={`
              px-2 py-0.5 text-xs font-semibold rounded-full
              ${item.badgeColor === 'primary' ? 'bg-blue-100 text-blue-700' : ''}
              ${item.badgeColor === 'success' ? 'bg-green-100 text-green-700' : ''}
              ${item.badgeColor === 'warning' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${item.badgeColor === 'danger' ? 'bg-red-100 text-red-700' : ''}
              ${!item.badgeColor ? 'bg-gray-100 text-gray-700' : ''}
            `}
          >
            {item.badge}
          </span>
        )}

        {hasChildren && !collapsed && (
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </a>

      {/* Nested children */}
      {hasChildren && isExpanded && !collapsed && (
        <div>
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.name}
              item={child}
              activePath={activePath}
              collapsed={collapsed}
              showIcons={showIcons}
              showLabels={showLabels}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
