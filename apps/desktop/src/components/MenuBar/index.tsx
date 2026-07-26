import { commandRegistry } from '@/commands'
import { DropdownMenu } from 'radix-ui'
import { memo, useCallback } from 'react'
import { type MenuDef, type MenuItemDef, menuBarData } from './menuData'

function MenuBarItem({ menu }: { menu: MenuDef }) {
  const handleItemClick = useCallback((item: MenuItemDef) => {
    if (item.handler) {
      item.handler()
    } else if (item.commandId) {
      commandRegistry.execute(item.commandId)
    }
  }, [])

  const renderItem = (item: MenuItemDef, depth = 0) => {
    if (item.separatorBefore && item.id.includes('sep')) {
      return <DropdownMenu.Separator key={item.id} className="mf-menubar-separator" />
    }

    if (item.children && item.children.length > 0) {
      return (
        <DropdownMenu.Sub key={item.id}>
          <DropdownMenu.SubTrigger className="mf-menubar-item mf-menubar-subtrigger">
            <span>{item.label}</span>
            <i className="ri-arrow-right-s-line mf-menubar-subtrigger-icon" aria-hidden="true" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent className="mf-menubar-content" sideOffset={4} alignOffset={-4}>
              {item.children.map((child) => renderItem(child, depth + 1))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      )
    }

    return (
      <DropdownMenu.Item
        key={item.id}
        className="mf-menubar-item"
        disabled={item.disabled}
        onSelect={() => handleItemClick(item)}
      >
        <span className="mf-menubar-item-label">{item.label}</span>
        {item.shortcut && (
          <span className="mf-menubar-item-shortcut">{item.shortcut}</span>
        )}
      </DropdownMenu.Item>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="mf-menubar-trigger">
        {menu.label}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mf-menubar-content" sideOffset={4} align="start">
          {menu.items.map((item) => renderItem(item))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const MenuBar = memo(() => {
  return (
    <div className="mf-menubar" data-tauri-drag-region>
      <div className="mf-menubar-menus">
        {menuBarData.map((menu) => (
          <MenuBarItem key={menu.id} menu={menu} />
        ))}
      </div>
    </div>
  )
})

MenuBar.displayName = 'MenuBar'
