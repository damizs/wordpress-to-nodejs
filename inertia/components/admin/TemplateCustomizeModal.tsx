import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Newspaper,
  RotateCcw,
  Settings2,
} from 'lucide-react'
import { Modal, Button, Field, Select } from '~/components/admin/ui'
import { SectionBlockPreview } from '~/components/admin/SectionBlockPreview'
import { NEWS_LAYOUTS } from '~/lib/news-layouts'
import {
  HOME_SECTION_LABELS,
  SECTION_BG_TONES,
  defaultConfigForTemplate,
  type SectionBgTone,
  type SectionStyleConfig,
  type TemplateCustomConfig,
} from '~/lib/template-config'
import type { HomeSectionKey, SiteTemplateKey } from '~/lib/templates'
import { SITE_TEMPLATES } from '~/lib/templates'

interface Props {
  open: boolean
  templateKey: SiteTemplateKey
  config: TemplateCustomConfig
  onClose: () => void
  onApply: (config: TemplateCustomConfig) => void
}

export function TemplateCustomizeModal({
  open,
  templateKey,
  config,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState<TemplateCustomConfig>(config)
  const [expanded, setExpanded] = useState<HomeSectionKey | null>('news')

  useEffect(() => {
    if (open) setDraft(config)
  }, [open, config])

  const tplLabel = SITE_TEMPLATES.find((t) => t.key === templateKey)?.label ?? templateKey

  function move(index: number, dir: -1 | 1) {
    const next = [...draft.homeOrder]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setDraft({ ...draft, homeOrder: next })
  }

  function patchSection(key: HomeSectionKey, patch: Partial<SectionStyleConfig>) {
    const prev = draft.sections[key] ?? { bgTone: 'default' as SectionBgTone }
    setDraft({
      ...draft,
      sections: { ...draft.sections, [key]: { ...prev, ...patch } },
    })
  }

  function resetDefaults() {
    setDraft(defaultConfigForTemplate(templateKey))
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
            <Settings2 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Personalizar modelo</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{tplLabel}</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[min(70vh,640px)] overflow-y-auto space-y-6">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Ordem das seções na home</p>
          <p className="text-xs text-muted-foreground mb-3">
            Use as setas para reordenar. Expanda uma seção para ajustar o fundo e ver a prévia.
          </p>
          <ul className="space-y-2">
            {draft.homeOrder.map((key, index) => {
              const isOpen = expanded === key
              const sec = draft.sections[key] ?? { bgTone: 'default' as SectionBgTone }
              return (
                <li
                  key={key}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {HOME_SECTION_LABELS[key]}
                    </span>
                    {key === 'news' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gold bg-gold/15 px-2 py-0.5 rounded-full">
                        <Newspaper className="w-3 h-3" />
                        Notícias
                      </span>
                    )}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                        aria-label={`Mover ${HOME_SECTION_LABELS[key]} para cima`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === draft.homeOrder.length - 1}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                        aria-label={`Mover ${HOME_SECTION_LABELS[key]} para baixo`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : key)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                        aria-expanded={isOpen}
                        aria-label={`Opções de ${HOME_SECTION_LABELS[key]}`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-3 pt-0 border-t border-border/60 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        <div className="space-y-3 min-w-0">
                      <Field label="Fundo da seção">
                        <Select
                          value={sec.bgTone}
                          onChange={(e) =>
                            patchSection(key, { bgTone: e.target.value as SectionBgTone })
                          }
                        >
                          {SECTION_BG_TONES.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      {sec.bgTone === 'custom' && (
                        <Field label="Cor (hex)">
                          <input
                            type="color"
                            value={sec.bgColor || '#141b47'}
                            onChange={(e) => patchSection(key, { bgColor: e.target.value })}
                            className="h-10 w-full rounded-lg border border-border cursor-pointer bg-card"
                          />
                        </Field>
                      )}

                      {key === 'news' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <Field label="Modelo dos cards">
                            <Select
                              value={draft.newsLayout || 'mosaico'}
                              onChange={(e) =>
                                setDraft({ ...draft, newsLayout: e.target.value })
                              }
                            >
                              {NEWS_LAYOUTS.map((l) => (
                                <option key={l.key} value={l.key}>
                                  {l.label}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Quantidade de cards">
                            <Select
                              value={String(draft.newsCount ?? 5)}
                              onChange={(e) =>
                                setDraft({ ...draft, newsCount: Number(e.target.value) })
                              }
                            >
                              {[3, 4, 5, 6, 8, 10, 12].map((n) => (
                                <option key={n} value={n}>
                                  {n} {n === 1 ? 'card' : 'cards'}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                      )}
                        </div>

                        <SectionBlockPreview section={key} style={sec} draft={draft} />
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border bg-muted/30">
        <Button type="button" variant="ghost" size="sm" onClick={resetDefaults}>
          <RotateCcw className="w-4 h-4" />
          Restaurar padrão
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onApply(draft)}>
            Aplicar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
