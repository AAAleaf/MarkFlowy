export interface MenuItemDef {
  id: string
  label: string
  /** i18n key — if provided, overrides label at render time */
  i18nKey?: string
  /** Command id to execute when clicked */
  commandId?: string
  /** Keyboard shortcut display string, e.g. "Ctrl+S" */
  shortcut?: string
  /** Submenu items */
  children?: MenuItemDef[]
  /** Render a separator before this item */
  separatorBefore?: boolean
  /** Whether the item is a toggle (shows checkmark) */
  toggle?: boolean
  /** Custom handler — if provided, called instead of commandId */
  handler?: () => void
  /** Whether the item is disabled */
  disabled?: boolean
}

export interface MenuDef {
  id: string
  label: string
  i18nKey?: string
  /** Access key underline letter, e.g. "F" for 文件(F) */
  accessKey?: string
  items: MenuItemDef[]
}

export const menuBarData: MenuDef[] = [
  {
    id: 'file',
    label: '文件',
    i18nKey: 'menubar.file',
    accessKey: 'F',
    items: [
      { id: 'file_new', label: '新建文件', i18nKey: 'menubar.file.new', commandId: 'app_newFile', shortcut: 'Ctrl+N' },
      { id: 'file_new_window', label: '新建窗口', i18nKey: 'menubar.file.new_window', commandId: 'app_newWindow', shortcut: 'Ctrl+Shift+N' },
      { id: 'file_open', label: '打开文件...', i18nKey: 'menubar.file.open', commandId: 'app_openFile', shortcut: 'Ctrl+O' },
      { id: 'file_open_folder', label: '打开文件夹...', i18nKey: 'menubar.file.open_folder', commandId: 'app_openFolder', shortcut: 'Ctrl+Shift+O' },
      { id: 'file_sep1', label: '', separatorBefore: true },
      { id: 'file_save', label: '保存', i18nKey: 'menubar.file.save', commandId: 'app_save', shortcut: 'Ctrl+S' },
      { id: 'file_save_as', label: '另存为...', i18nKey: 'menubar.file.save_as', commandId: 'app_saveAs', shortcut: 'Ctrl+Shift+S' },
      { id: 'file_sep2', label: '', separatorBefore: true },
      {
        id: 'file_export',
        label: '导出',
        i18nKey: 'menubar.file.export',
        children: [
          { id: 'file_export_html', label: '导出为 HTML', i18nKey: 'menubar.file.export_html', commandId: 'app_exportHtml' },
          { id: 'file_export_image', label: '导出为图片', i18nKey: 'menubar.file.export_image', commandId: 'app_exportImage' },
        ],
      },
      { id: 'file_sep3', label: '', separatorBefore: true },
      { id: 'file_settings', label: '偏好设置', i18nKey: 'menubar.file.settings', commandId: 'app_openSetting', shortcut: 'Ctrl+,' },
      { id: 'file_sep4', label: '', separatorBefore: true },
      { id: 'file_quit', label: '退出', i18nKey: 'menubar.file.quit', commandId: 'app_quit', shortcut: 'Ctrl+Q' },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    i18nKey: 'menubar.edit',
    accessKey: 'E',
    items: [
      { id: 'edit_undo', label: '撤销', i18nKey: 'menubar.edit.undo', commandId: 'editor_undo', shortcut: 'Ctrl+Z' },
      { id: 'edit_redo', label: '重做', i18nKey: 'menubar.edit.redo', commandId: 'editor_redo', shortcut: 'Ctrl+Y' },
      { id: 'edit_sep1', label: '', separatorBefore: true },
      { id: 'edit_cut', label: '剪切', i18nKey: 'menubar.edit.cut', commandId: 'editor_cut', shortcut: 'Ctrl+X' },
      { id: 'edit_copy', label: '复制', i18nKey: 'menubar.edit.copy', commandId: 'editor_copy', shortcut: 'Ctrl+C' },
      { id: 'edit_paste', label: '粘贴', i18nKey: 'menubar.edit.paste', commandId: 'editor_paste', shortcut: 'Ctrl+V' },
      { id: 'edit_select_all', label: '全选', i18nKey: 'menubar.edit.select_all', commandId: 'editor_selectAll', shortcut: 'Ctrl+A' },
      { id: 'edit_sep2', label: '', separatorBefore: true },
      { id: 'edit_find', label: '查找', i18nKey: 'menubar.edit.find', commandId: 'app_find', shortcut: 'Ctrl+F' },
      { id: 'edit_replace', label: '替换', i18nKey: 'menubar.edit.replace', commandId: 'app_replace', shortcut: 'Ctrl+H' },
      { id: 'edit_sep3', label: '', separatorBefore: true },
      {
        id: 'edit_convert',
        label: '简繁转换',
        i18nKey: 'menubar.edit.convert',
        children: [
          { id: 'edit_convert_tw', label: '转为繁体 (台湾)', commandId: 'app_convertText_tw' },
          { id: 'edit_convert_hk', label: '转为繁体 (香港)', commandId: 'app_convertText_hk' },
          { id: 'edit_convert_cn', label: '转为简体', commandId: 'app_convertText_cn' },
        ],
      },
    ],
  },
  {
    id: 'paragraph',
    label: '段落',
    i18nKey: 'menubar.paragraph',
    accessKey: 'P',
    items: [
      {
        id: 'para_heading',
        label: '标题',
        i18nKey: 'menubar.paragraph.heading',
        children: [
          { id: 'para_h1', label: '标题 1', commandId: 'editor_heading1', shortcut: 'Ctrl+1' },
          { id: 'para_h2', label: '标题 2', commandId: 'editor_heading2', shortcut: 'Ctrl+2' },
          { id: 'para_h3', label: '标题 3', commandId: 'editor_heading3', shortcut: 'Ctrl+3' },
          { id: 'para_h4', label: '标题 4', commandId: 'editor_heading4', shortcut: 'Ctrl+4' },
          { id: 'para_h5', label: '标题 5', commandId: 'editor_heading5', shortcut: 'Ctrl+5' },
          { id: 'para_h6', label: '标题 6', commandId: 'editor_heading6', shortcut: 'Ctrl+6' },
        ],
      },
      { id: 'para_sep1', label: '', separatorBefore: true },
      { id: 'para_ol', label: '有序列表', i18nKey: 'menubar.paragraph.ordered_list', commandId: 'editor_orderedList', shortcut: 'Ctrl+Shift+O' },
      { id: 'para_ul', label: '无序列表', i18nKey: 'menubar.paragraph.unordered_list', commandId: 'editor_bulletList', shortcut: 'Ctrl+Shift+U' },
      { id: 'para_task', label: '任务列表', i18nKey: 'menubar.paragraph.task_list', commandId: 'editor_taskList', shortcut: 'Ctrl+Shift+T' },
      { id: 'para_sep2', label: '', separatorBefore: true },
      { id: 'para_quote', label: '引用', i18nKey: 'menubar.paragraph.quote', commandId: 'editor_blockquote', shortcut: 'Ctrl+Shift+Q' },
      { id: 'para_codeblock', label: '代码块', i18nKey: 'menubar.paragraph.codeblock', commandId: 'editor_codeblock', shortcut: 'Ctrl+Shift+K' },
      { id: 'para_table', label: '表格', i18nKey: 'menubar.paragraph.table', commandId: 'editor_insertTable' },
      { id: 'para_sep3', label: '', separatorBefore: true },
      { id: 'para_hr', label: '分割线', i18nKey: 'menubar.paragraph.hr', commandId: 'editor_hr' },
    ],
  },
  {
    id: 'format',
    label: '格式',
    i18nKey: 'menubar.format',
    accessKey: 'M',
    items: [
      { id: 'fmt_bold', label: '加粗', i18nKey: 'menubar.format.bold', commandId: 'editor_bold', shortcut: 'Ctrl+B' },
      { id: 'fmt_italic', label: '斜体', i18nKey: 'menubar.format.italic', commandId: 'editor_italic', shortcut: 'Ctrl+I' },
      { id: 'fmt_underline', label: '下划线', i18nKey: 'menubar.format.underline', commandId: 'editor_underline', shortcut: 'Ctrl+U' },
      { id: 'fmt_strike', label: '删除线', i18nKey: 'menubar.format.strikethrough', commandId: 'editor_strikethrough', shortcut: 'Ctrl+Shift+D' },
      { id: 'fmt_code', label: '行内代码', i18nKey: 'menubar.format.inline_code', commandId: 'editor_inlineCode', shortcut: 'Ctrl+`' },
      { id: 'fmt_sep1', label: '', separatorBefore: true },
      { id: 'fmt_link', label: '超链接', i18nKey: 'menubar.format.link', commandId: 'editor_link', shortcut: 'Ctrl+K' },
      { id: 'fmt_image', label: '图片', i18nKey: 'menubar.format.image', commandId: 'editor_insertImage', shortcut: 'Ctrl+Shift+I' },
      { id: 'fmt_sep2', label: '', separatorBefore: true },
      { id: 'fmt_clear', label: '清除格式', i18nKey: 'menubar.format.clear', commandId: 'editor_clearFormat', shortcut: 'Ctrl+\\' },
    ],
  },
  {
    id: 'view',
    label: '视图',
    i18nKey: 'menubar.view',
    accessKey: 'V',
    items: [
      { id: 'view_wysiwyg', label: '所见即所得模式', i18nKey: 'menubar.view.wysiwyg', commandId: 'app_viewWysiwyg', shortcut: 'Ctrl+Shift+W' },
      { id: 'view_source', label: '源码模式', i18nKey: 'menubar.view.source', commandId: 'app_viewSource', shortcut: 'Ctrl+Shift+C' },
      { id: 'view_preview', label: '预览模式', i18nKey: 'menubar.view.preview', commandId: 'app_viewPreview' },
      { id: 'view_sep1', label: '', separatorBefore: true },
      { id: 'view_typewriter', label: '打字机模式', i18nKey: 'menubar.view.typewriter', commandId: 'app_toggleTypewriter', toggle: true },
      { id: 'view_sep2', label: '', separatorBefore: true },
      { id: 'view_sidebar', label: '显示侧边栏', i18nKey: 'menubar.view.sidebar', commandId: 'app_toggleLeftsidebarVisible', shortcut: 'Ctrl+Shift+L', toggle: true },
      { id: 'view_toc', label: '显示目录', i18nKey: 'menubar.view.toc', commandId: 'app_toggleRightsidebarVisible', toggle: true },
      { id: 'view_sep3', label: '', separatorBefore: true },
      { id: 'view_zoom_in', label: '放大', i18nKey: 'menubar.view.zoom_in', commandId: 'app_zoomIn', shortcut: 'Ctrl+=' },
      { id: 'view_zoom_out', label: '缩小', i18nKey: 'menubar.view.zoom_out', commandId: 'app_zoomOut', shortcut: 'Ctrl+-' },
      { id: 'view_zoom_reset', label: '重置缩放', i18nKey: 'menubar.view.zoom_reset', commandId: 'app_zoomReset', shortcut: 'Ctrl+0' },
    ],
  },
  {
    id: 'image',
    label: '图片',
    i18nKey: 'menubar.image',
    accessKey: 'I',
    items: [
      {
        id: 'img_insert',
        label: '插入图片',
        i18nKey: 'menubar.image.insert',
        children: [
          { id: 'img_insert_local', label: '从本地文件...', i18nKey: 'menubar.image.from_file', commandId: 'editor_insertImage' },
          { id: 'img_insert_url', label: '从 URL...', i18nKey: 'menubar.image.from_url', commandId: 'editor_insertImageUrl' },
        ],
      },
      { id: 'img_sep1', label: '', separatorBefore: true },
      { id: 'img_upload_all', label: '上传当前文档所有图片到图床', i18nKey: 'menubar.image.upload_all', commandId: 'app_uploadAllImages' },
      { id: 'img_sep2', label: '', separatorBefore: true },
      { id: 'img_settings', label: '图床设置...', i18nKey: 'menubar.image.settings', commandId: 'app_openImageSetting' },
    ],
  },
  {
    id: 'help',
    label: '帮助',
    i18nKey: 'menubar.help',
    accessKey: 'H',
    items: [
      { id: 'help_about', label: '关于 MarkFlowy', i18nKey: 'menubar.help.about', commandId: 'app_about' },
      { id: 'help_update', label: '检查更新', i18nKey: 'menubar.help.check_update', commandId: 'app_checkUpdate' },
      { id: 'help_sep1', label: '', separatorBefore: true },
      { id: 'help_homepage', label: '项目主页', i18nKey: 'menubar.help.homepage', commandId: 'app_openHomepage' },
      { id: 'help_feedback', label: '反馈问题', i18nKey: 'menubar.help.feedback', commandId: 'app_openFeedback' },
    ],
  },
]
