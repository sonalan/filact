/**
 * Action Builders
 * Factory functions for creating action configurations
 */

import type { ReactNode } from 'react'
import type { BaseModel } from '../types/resource'
import type {
  ButtonActionConfig,
  LinkActionConfig,
  ActionGroupConfig,
  BulkAction,
  ActionVariant,
  ActionSize,
  ModalConfig,
  ConfirmationConfig,
  Action,
} from '../types/action'

/**
 * Base action builder with common properties
 */
abstract class BaseActionBuilder<TConfig, TModel extends BaseModel = BaseModel> {
  protected config: Partial<TConfig>

  constructor(id: string, label: string | ((record?: TModel, selected?: TModel[]) => string)) {
    this.config = {
      id,
      label,
    } as Partial<TConfig>
  }

  label(label: string | ((record?: TModel, selected?: TModel[]) => string)): this {
    ;(this.config as any).label = label
    return this
  }

  icon(icon: ReactNode | ((record?: TModel, selected?: TModel[]) => ReactNode)): this {
    ;(this.config as any).icon = icon
    return this
  }

  variant(variant: ActionVariant): this {
    ;(this.config as any).variant = variant
    return this
  }

  size(size: ActionSize): this {
    ;(this.config as any).size = size
    return this
  }

  color(color: string): this {
    ;(this.config as any).color = color
    return this
  }

  tooltip(tooltip: string): this {
    ;(this.config as any).tooltip = tooltip
    return this
  }

  visible(visible: boolean | ((record?: TModel, selected?: TModel[]) => boolean)): this {
    ;(this.config as any).visible = visible
    return this
  }

  disabled(disabled: boolean | ((record?: TModel, selected?: TModel[]) => boolean)): this {
    ;(this.config as any).disabled = disabled
    return this
  }

  requiresConfirmation(requires = true): this {
    ;(this.config as any).requiresConfirmation = requires
    return this
  }

  confirmation(
    config: ConfirmationConfig | ((record?: TModel, selected?: TModel[]) => ConfirmationConfig)
  ): this {
    ;(this.config as any).confirmation = config
    ;(this.config as any).requiresConfirmation = true
    return this
  }

  modal(config: ModalConfig): this {
    ;(this.config as any).modal = config
    return this
  }

  shortcut(shortcut: string): this {
    ;(this.config as any).shortcut = shortcut
    return this
  }

  className(className: string): this {
    ;(this.config as any).className = className
    return this
  }

  abstract build(): TConfig
}

/**
 * Button action builder
 */
export class ButtonActionBuilder<TModel extends BaseModel = BaseModel> extends BaseActionBuilder<
  ButtonActionConfig<TModel>,
  TModel
> {
  constructor(
    id: string,
    label: string,
    onClick: (record?: TModel, selected?: TModel[]) => void | Promise<void>
  ) {
    super(id, label)
    ;(this.config as any).type = 'button'
    ;(this.config as any).onClick = onClick
  }

  showLoading(show = true): this {
    ;(this.config as any).showLoading = show
    return this
  }

  build(): ButtonActionConfig<TModel> {
    return this.config as ButtonActionConfig<TModel>
  }
}

/**
 * Link action builder
 */
export class LinkActionBuilder<TModel extends BaseModel = BaseModel> extends BaseActionBuilder<
  LinkActionConfig<TModel>,
  TModel
> {
  constructor(id: string, label: string, href: string | ((record?: TModel) => string)) {
    super(id, label)
    ;(this.config as any).type = 'link'
    ;(this.config as any).href = href
  }

  newTab(newTab = true): this {
    ;(this.config as any).newTab = newTab
    return this
  }

  build(): LinkActionConfig<TModel> {
    return this.config as LinkActionConfig<TModel>
  }
}

/**
 * Action group builder
 */
export class ActionGroupBuilder<TModel extends BaseModel = BaseModel> {
  private config: Partial<ActionGroupConfig<TModel>>

  constructor(id: string, label: string) {
    this.config = {
      id,
      label,
      actions: [],
    }
  }

  icon(icon: ReactNode): this {
    this.config.icon = icon
    return this
  }

  actions(actions: Action<TModel>[]): this {
    this.config.actions = actions
    return this
  }

  visible(visible: boolean | ((record?: TModel, selected?: TModel[]) => boolean)): this {
    this.config.visible = visible
    return this
  }

  build(): ActionGroupConfig<TModel> {
    if (!this.config.actions || this.config.actions.length === 0) {
      throw new Error('Action group must have at least one action')
    }
    return this.config as ActionGroupConfig<TModel>
  }
}

/**
 * Bulk action builder
 */
export class BulkActionBuilder<TModel extends BaseModel = BaseModel> {
  private config: Partial<BulkAction<TModel>>

  constructor(id: string, label: string, action: (selected: TModel[]) => void | Promise<void>) {
    this.config = {
      id,
      label,
      action,
    }
  }

  label(label: string | ((selected: TModel[]) => string)): this {
    this.config.label = label
    return this
  }

  icon(icon: ReactNode | ((selected: TModel[]) => ReactNode)): this {
    this.config.icon = icon
    return this
  }

  variant(variant: ActionVariant): this {
    this.config.variant = variant
    return this
  }

  requiresConfirmation(requires = true): this {
    this.config.requiresConfirmation = requires
    return this
  }

  confirmation(config: ConfirmationConfig | ((selected: TModel[]) => ConfirmationConfig)): this {
    this.config.confirmation = config
    this.config.requiresConfirmation = true
    return this
  }

  visible(visible: boolean | ((selected: TModel[]) => boolean)): this {
    this.config.visible = visible
    return this
  }

  disabled(disabled: boolean | ((selected: TModel[]) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  build(): BulkAction<TModel> {
    if (!this.config.action) {
      throw new Error('Bulk action must have an action handler')
    }
    return this.config as BulkAction<TModel>
  }
}

/**
 * Factory functions for creating action builders
 */
export const ButtonAction = {
  make: <TModel extends BaseModel = BaseModel>(
    id: string,
    label: string,
    onClick: (record?: TModel, selected?: TModel[]) => void | Promise<void>
  ) => new ButtonActionBuilder<TModel>(id, label, onClick),
}

export const LinkAction = {
  make: <TModel extends BaseModel = BaseModel>(
    id: string,
    label: string,
    href: string | ((record?: TModel) => string)
  ) => new LinkActionBuilder<TModel>(id, label, href),
}

export const ActionGroup = {
  make: <TModel extends BaseModel = BaseModel>(id: string, label: string) =>
    new ActionGroupBuilder<TModel>(id, label),
}

export const BulkAction = {
  make: <TModel extends BaseModel = BaseModel>(
    id: string,
    label: string,
    action: (selected: TModel[]) => void | Promise<void>
  ) => new BulkActionBuilder<TModel>(id, label, action),
}
