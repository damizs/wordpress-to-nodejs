import { useEffect } from 'react'
import { router } from '@inertiajs/react'

/**
 * Avisa o usuário ao tentar sair de um formulário com alterações não salvas.
 *
 * Cobre os dois caminhos de saída:
 *  - `beforeunload` (nativo): fechar a aba, recarregar ou navegar para fora do app.
 *  - evento `before` do router do Inertia: navegação interna (SPA) — pede
 *    confirmação com `window.confirm` antes de uma visita GET (links/voltar).
 *
 * O envio do próprio formulário (POST/PUT/PATCH/DELETE) NÃO é interceptado, então
 * salvar nunca dispara o aviso. Os listeners são removidos quando `dirty` fica
 * falso ou no unmount.
 *
 * @param dirty  Há alterações não salvas? Passe o resultado da comparação com o
 *               estado inicial do formulário.
 * @param message Texto do aviso (usado no confirm interno do Inertia).
 */
export function useUnsavedChanges(
  dirty: boolean,
  message = 'Há alterações não salvas neste formulário. Se sair agora, elas serão perdidas. Deseja continuar?'
) {
  useEffect(() => {
    if (!dirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Navegadores modernos ignoram a string e exibem um aviso genérico,
      // mas `returnValue` ainda é necessário para acionar o diálogo.
      event.returnValue = message
      return message
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    const removeInertiaListener = router.on('before', (event) => {
      const method = event.detail.visit.method
      // Só pergunta em navegação (GET). Submits do form (post/put/...) passam direto.
      if (method !== 'get') return
      if (!window.confirm(message)) {
        event.preventDefault()
      }
    })

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      removeInertiaListener()
    }
  }, [dirty, message])
}

export default useUnsavedChanges
