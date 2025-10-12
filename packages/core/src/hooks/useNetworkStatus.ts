/**
 * useNetworkStatus Hook
 * Tracks network connectivity status
 */

import { useState, useEffect } from 'react'

/**
 * Network status information
 */
export interface NetworkStatus {
  online: boolean
  since?: Date
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

/**
 * Hook for tracking network connectivity status
 *
 * @returns Current network status
 *
 * @example
 * ```tsx
 * const network = useNetworkStatus()
 *
 * return (
 *   <div>
 *     Status: {network.online ? 'Online' : 'Offline'}
 *     {network.effectiveType && ` (${network.effectiveType})`}
 *   </div>
 * )
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    since: new Date(),
  }))

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    const updateNetworkStatus = () => {
      const online = navigator.onLine
      const newStatus: NetworkStatus = {
        online,
        since: new Date(),
      }

      // Add Network Information API data if available
      const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection

      if (connection) {
        newStatus.effectiveType = connection.effectiveType
        newStatus.downlink = connection.downlink
        newStatus.rtt = connection.rtt
        newStatus.saveData = connection.saveData
      }

      setStatus(newStatus)
    }

    const handleOnline = () => updateNetworkStatus()
    const handleOffline = () => updateNetworkStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for connection changes if Network Information API is available
    const connection = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return status
}
