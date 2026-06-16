import { useMemo, useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { uploadMediaFile } from '~/lib/media_upload'

import 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/models/dom'

import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/autoresize'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.min.css'
import 'tinymce/skins/ui/oxide-dark/skin.min.css'
import 'tinymce/skins/ui/oxide-dark/content.min.css'
import 'tinymce/skins/content/default/content.min.css'
import 'tinymce/skins/content/dark/content.min.css'

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  minHeight?: number
  placeholder?: string
  disabled?: boolean
  isDark?: boolean
}

export default function RichTextEditorClient({
  value,
  onChange,
  minHeight = 320,
  placeholder,
  disabled = false,
  isDark = false,
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null)

  const init = useMemo(
    () => ({
      min_height: minHeight,
      menubar: 'edit view insert format table tools',
      plugins: [
        'advlist',
        'autolink',
        'lists',
        'link',
        'image',
        'charmap',
        'preview',
        'anchor',
        'searchreplace',
        'visualblocks',
        'code',
        'fullscreen',
        'insertdatetime',
        'media',
        'table',
        'wordcount',
        'autoresize',
      ],
      toolbar:
        'undo redo | blocks | bold italic underline strikethrough | ' +
        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
        'link image media table | removeformat code fullscreen',
      block_formats: 'Parágrafo=p; Título 2=h2; Título 3=h3; Título 4=h4',
      branding: false,
      promotion: false,
      license_key: 'gpl',
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      placeholder,
      relative_urls: false,
      convert_urls: true,
      paste_data_images: true,
      image_caption: true,
      image_title: true,
      automatic_uploads: true,
      file_picker_types: 'image',
      images_upload_handler: (blobInfo: { blob: () => Blob; filename: () => string }) =>
        uploadMediaFile(blobInfo.blob(), blobInfo.filename()).catch((err: Error) => {
          throw err
        }),
      setup: (editor: TinyMCEEditor) => {
        editorRef.current = editor
      },
    }),
    [isDark, minHeight, placeholder]
  )

  return (
    <div className="rich-text-editor rounded-lg border border-border overflow-hidden [&_.tox-tinymce]:border-0">
      <Editor
        key={isDark ? 'dark' : 'light'}
        value={value}
        disabled={disabled}
        onEditorChange={(content) => onChange(content)}
        init={init}
      />
    </div>
  )
}
