/**
 * Faixa fina das campanhas sazonais (Outubro Rosa, Novembro Azul, etc.).
 * Só renderiza quando há campanha ativa (ver useActiveCampaign / campaign_mode).
 * O X dispensa a faixa apenas na visualização atual (estado local, sem storage):
 * ao recarregar a página ou navegar novamente, ela reaparece.
 *
 * Este componente NÃO é montado automaticamente: importe-o no Header e
 * renderize <CampaignBanner /> acima da barra principal.
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { useActiveCampaign } from '~/components/DynamicTheme'

export function CampaignBanner() {
  const campaign = useActiveCampaign()
  // Dispensa efêmera: some só nesta visualização; volta em reload/nova navegação
  const [dismissed, setDismissed] = useState(false)

  if (!campaign || dismissed) return null

  function dismiss() {
    setDismissed(true)
  }

  return (
    <div
      role="region"
      aria-label={`Campanha ${campaign.label}`}
      className="relative text-white"
      style={{
        background: `linear-gradient(90deg, ${campaign.colors.navy} 0%, ${campaign.colors.sky} 55%, ${campaign.colors.navy} 100%)`,
      }}
    >
      <div className="max-w-[1140px] mx-auto px-4 py-1.5 flex items-center justify-center gap-2.5 text-center">
        <span className="shrink-0 w-6 h-6 rounded-full bg-white/95 shadow-sm flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
          {campaign.emblem}
        </span>
        <p className="text-[12px] sm:text-[13px] leading-snug min-w-0">
          <span className="font-bold uppercase tracking-wide">{campaign.label}</span>
          <span className="hidden sm:inline opacity-90"> — {campaign.message}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar aviso da campanha"
          title="Dispensar"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default CampaignBanner
