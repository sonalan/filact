/**
 * UserAvatar Component
 * Displays user avatar with fallback to initials
 */

import type { User } from './types'

/**
 * UserAvatar props
 */
export interface UserAvatarProps {
  /** User information */
  user: User

  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** Custom class name */
  className?: string

  /** Show online indicator */
  showOnline?: boolean

  /** Whether user is online */
  isOnline?: boolean
}

/**
 * Get initials from user name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg' | 'xl'): {
  avatar: string
  text: string
  online: string
} {
  const sizes = {
    sm: {
      avatar: 'w-8 h-8',
      text: 'text-xs',
      online: 'w-2 h-2',
    },
    md: {
      avatar: 'w-10 h-10',
      text: 'text-sm',
      online: 'w-2.5 h-2.5',
    },
    lg: {
      avatar: 'w-12 h-12',
      text: 'text-base',
      online: 'w-3 h-3',
    },
    xl: {
      avatar: 'w-16 h-16',
      text: 'text-lg',
      online: 'w-4 h-4',
    },
  }

  return sizes[size]
}

/**
 * UserAvatar Component
 */
export function UserAvatar({
  user,
  size = 'md',
  className = '',
  showOnline = false,
  isOnline = false,
}: UserAvatarProps) {
  const { avatar, text, online } = getSizeClasses(size)
  const initials = getInitials(user.name)

  return (
    <div className={`relative inline-block ${className}`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${avatar} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${avatar} rounded-full bg-blue-600 text-white flex items-center justify-center font-medium ${text}`}
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 block ${online} rounded-full ring-2 ring-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  )
}
