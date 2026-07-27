import { commandRegistry } from '@/commands'
import { EVENT } from '@/constants'
import { EditorViewType } from '@/constants/editorViewType'
import { getFileNameFromPath } from '@/helper/filesys'
import bus from '@/helper/eventBus'
import { addEmptyEditorTab, addExistingMarkdownFileEdit } from '@/services/editor-file'
import { currentWindow } from '@/services/windows'
import useAppSettingStore from '@/stores/useAppSettingStore'
import useEditorStore from '@/stores/useEditorStore'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { emitTo } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { openUrl } from '@tauri-apps/plugin-opener'
import { toast } from 'zens'

function getActiveEditorCtx() {
  const { activeId, getEditorCtx } = useEditorStore.getState()
  if (!activeId) return undefined
  return getEditorCtx(activeId)
}

function execEditorCmd(commandName: string, attrs?: Record<string, unknown>) {
  const ctx = getActiveEditorCtx()
  if (!ctx) return
  const commands = ctx.commands as Record<string, ((a?: unknown) => boolean) | undefined>
  const fn = commands[commandName]
  if (typeof fn === 'function') {
    fn(attrs)
    ctx.view?.focus()
  }
}

function getExtFromPath(path: string): string {
  const fileName = getFileNameFromPath(path) || ''
  const dotIdx = fileName.lastIndexOf('.')
  return dotIdx >= 0 ? fileName.slice(dotIdx + 1) : 'md'
}

export function registerMenuCommands(): () => void {
  const disposables: { dispose: () => void }[] = []
  const reg = (id: string, handler: (...args: unknown[]) => unknown) => {
    disposables.push(commandRegistry.registerCommand({ id, handler }))
  }

  /* File */
  reg('app_newFile', () => addEmptyEditorTab())
  reg('app_newWindow', () => invoke('create_new_window', {}))
  reg('app_openFile', async () => {
    const file = await open({
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
      fileAccessMode: 'scoped',
    })
    if (typeof file !== 'string') return
    await invoke<boolean>('save_security_bookmark', { path: file })
    const fileName = getFileNameFromPath(file) || 'new-file.md'
    await addExistingMarkdownFileEdit({ fileName, ext: getExtFromPath(file), path: file })
  })
  reg('app_saveAs', () => { bus.emit(EVENT.app_save) })
  reg('app_exportHtml', () => bus.emit('editor_export_html'))
  reg('app_exportImage', () => bus.emit('editor_export_image'))
  reg('app_quit', () => currentWindow.close())

  /* Edit */
  reg('editor_undo', () => execEditorCmd('undo'))
  reg('editor_redo', () => execEditorCmd('redo'))
  reg('editor_cut', () => { document.execCommand('cut') })
  reg('editor_copy', () => { document.execCommand('copy') })
  reg('editor_paste', () => { document.execCommand('paste') })
  reg('editor_selectAll', () => { document.execCommand('selectAll') })
  reg('app_find', () => commandRegistry.execute('app_findReplaceEditor'))
  reg('app_replace', () => commandRegistry.execute('app_findReplaceEditor'))
  reg('app_convertText_tw', () => toast.info('简繁转换功能开发中'))
  reg('app_convertText_hk', () => toast.info('简繁转换功能开发中'))
  reg('app_convertText_cn', () => toast.info('简繁转换功能开发中'))

  /* Paragraph */
  reg('editor_heading1', () => execEditorCmd('toggleHeading', { level: 1 }))
  reg('editor_heading2', () => execEditorCmd('toggleHeading', { level: 2 }))
  reg('editor_heading3', () => execEditorCmd('toggleHeading', { level: 3 }))
  reg('editor_heading4', () => execEditorCmd('toggleHeading', { level: 4 }))
  reg('editor_heading5', () => execEditorCmd('toggleHeading', { level: 5 }))
  reg('editor_heading6', () => execEditorCmd('toggleHeading', { level: 6 }))
  reg('editor_orderedList', () => execEditorCmd('toggleList', { kind: 'ordered' }))
  reg('editor_bulletList', () => execEditorCmd('toggleList', { kind: 'bullet' }))
  reg('editor_taskList', () => execEditorCmd('toggleList', { kind: 'task' }))
  reg('editor_blockquote', () => execEditorCmd('toggleBlockquote'))
  reg('editor_codeblock', () => execEditorCmd('toggleCodeBlock'))
  reg('editor_insertTable', () => execEditorCmd('insertTable', { rows: 3, cols: 3 }))
  reg('editor_hr', () => execEditorCmd('insertHr'))

  /* Format */
  reg('editor_bold', () => execEditorCmd('toggleStrong'))
  reg('editor_italic', () => execEditorCmd('toggleEmphasis'))
  reg('editor_underline', () => execEditorCmd('toggleUnderline'))
  reg('editor_strikethrough', () => execEditorCmd('toggleDelete'))
  reg('editor_inlineCode', () => execEditorCmd('toggleCodeText'))
  reg('editor_link', () => execEditorCmd('toggleLink'))
  reg('editor_insertImage', () => execEditorCmd('requestImageInsert'))
  reg('editor_clearFormat', () => execEditorCmd('clearFormat'))

  /* View */
  reg('app_viewWysiwyg', () => bus.emit('editor_toggle_type', undefined, EditorViewType.WYSIWYG))
  reg('app_viewSource', () => bus.emit('editor_toggle_type', undefined, EditorViewType.SOURCECODE))
  reg('app_viewPreview', () => bus.emit('editor_toggle_type', undefined, EditorViewType.PREVIEW))
  reg('app_toggleTypewriter', () => {
    const ctx = getActiveEditorCtx()
    if (!ctx) return
    const commands = ctx.commands as Record<string, ((a?: unknown) => boolean) | undefined>
    if (typeof commands.toggleTypewriterScroll === 'function') {
      const { settingData, setSettingData } = useAppSettingStore.getState()
      const next = !(settingData?.editor_typewriter_scroll ?? false)
      commands.toggleTypewriterScroll(next)
      setSettingData({ ...settingData, editor_typewriter_scroll: next })
      ctx.view?.focus()
    }
  })

  const ZOOM_STEP = 0.1
  const getCurZoom = (): number => {
    const { settingData } = useAppSettingStore.getState()
    return Number(settingData?.webview_zoom) || 1.0
  }
  const applyZoom = (newZoom: number) => {
    const clamped = Math.min(3.0, Math.max(0.5, Math.round(newZoom * 100) / 100))
    getCurrentWebview().setZoom(clamped)
    const { settingData, setSettingData } = useAppSettingStore.getState()
    const next = { ...settingData, webview_zoom: String(clamped) }
    setSettingData(next)
    invoke('save_app_conf', { data: next, label: 'markflowy' }).catch(() => {})
  }
  reg('app_zoomIn', () => applyZoom(getCurZoom() + ZOOM_STEP))
  reg('app_zoomOut', () => applyZoom(getCurZoom() - ZOOM_STEP))
  reg('app_zoomReset', () => applyZoom(1.0))

  /* Image */
  reg('editor_insertImageUrl', () => execEditorCmd('requestImageInsert'))
  reg('app_uploadAllImages', () => toast.info('批量上传图片功能开发中'))
  reg('app_openImageSetting', () => { commandRegistry.execute(EVENT.app_openSetting) })

  /* Help */
  reg('app_about', () => { emitTo(currentWindow.label, EVENT.app_about) })
  reg('app_checkUpdate', async () => {
    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const update = await check()
      if (update) { toast.success(`发现新版本: ${update.version}`) }
      else { toast.info('当前已是最新版本') }
    } catch { toast.error('检查更新失败') }
  })
  reg('app_openHomepage', () => openUrl('https://github.com/drl990114/MarkFlowy'))
  reg('app_openFeedback', () => openUrl('https://github.com/drl990114/MarkFlowy/issues'))

  return () => { for (const d of disposables) d.dispose() }
}
