/**
 * Campo de upload de arquivo padrão do painel.
 *
 * - Área de arrastar-e-soltar OU clicar para escolher um arquivo.
 * - Mostra nome + tamanho do arquivo escolhido.
 * - Modo edição: quando recebe `currentUrl`, mostra "Arquivo atual" (link "Ver")
 *   + botão "Trocar arquivo". Se o usuário não trocar, o arquivo atual é mantido
 *   (o componente NÃO emite alteração até que um novo arquivo seja escolhido).
 * - Acessível (label associado ao input, aria), responsivo e dark-safe.
 *
 * O componente apenas seleciona o File e o entrega via `onChange(file | null)`.
 * O envio é responsabilidade do formulário (Inertia useForm + forceFormData) e a
 * gravação em disco (public/uploads/<pasta>) é feita no controller.
 */
import { useId, useRef, useState, type DragEvent } from 'react'
import { ExternalLink, FileText, RefreshCw, Upload, X } from 'lucide-react'
import { Button } from './ui'

interface FileFieldProps {
  label: string
  /** Nome lógico do campo (usado no id/label; o form controla a chave enviada). */
  name: string
  /** Filtro de tipos aceitos, ex.: 'application/pdf' ou '.pdf,.doc,.docx'. */
  accept?: string
  /** URL do arquivo já gravado (modo edição). */
  currentUrl?: string | null
  hint?: string
  required?: boolean
  onChange: (file: File | null) => void
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 || value >= 10 ? 0 : 1)} ${units[i]}`
}

function fileNameFromUrl(url: string): string {
  const clean = url.split('?')[0].split('#')[0]
  const last = clean.split('/').pop() || url
  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}

export default function FileField({
  label,
  name,
  accept,
  currentUrl,
  hint,
  required,
  onChange,
}: FileFieldProps) {
  const autoId = useId()
  const inputId = `file-${name}-${autoId}`
  const hintId = `${inputId}-hint`
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const hasCurrent = Boolean(currentUrl)
  // Área de upload aparece quando: não há arquivo atual, o usuário pediu trocar,
  // ou já escolheu um arquivo novo.
  const showDropzone = !hasCurrent || replacing || Boolean(file)

  function selectFile(f: File | null) {
    setFile(f)
    onChange(f)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) selectFile(dropped)
  }

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = ''
    selectFile(null)
    setReplacing(false)
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-[13px] font-semibold text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {hasCurrent && !showDropzone && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
            <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate" title={fileNameFromUrl(currentUrl as string)}>
              Arquivo atual: {fileNameFromUrl(currentUrl as string)}
            </span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={currentUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Ver
            </a>
            <Button type="button" variant="secondary" size="sm" onClick={() => setReplacing(true)}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Trocar arquivo
            </Button>
          </div>
        </div>
      )}

      {showDropzone && (
        <div>
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              dragOver
                ? 'border-navy bg-navy/5'
                : 'border-border bg-muted/20 hover:border-navy/40 hover:bg-muted/40'
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </span>
            {file ? (
              <span className="flex flex-col items-center">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="max-w-[16rem] truncate">{file.name}</span>
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-navy dark:text-sky">Clique para escolher</span> ou
                arraste o arquivo aqui
              </span>
            )}
          </label>

          {(file || (hasCurrent && replacing)) && (
            <div className="mt-2 flex items-center gap-3">
              {file && (
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Remover
                </Button>
              )}
              {hasCurrent && replacing && !file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplacing(false)}
                >
                  Manter arquivo atual
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        required={required && !hasCurrent}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => selectFile(e.target.files?.[0] || null)}
        className="sr-only"
      />

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
