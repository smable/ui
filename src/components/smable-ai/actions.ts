import type { SmableAiActionStatus } from './types'

/**
 * Potvrdit / Zrušit jen u čekající akce. `confirming` tlačítka nemá: akce, kterou server zamkl
 * a nedokončil (pád mezi zámkem a zápisem), by jinak točila spinner navždy.
 */
export function actionButtonsVisible(status: SmableAiActionStatus): boolean {
  return status === 'pending'
}
