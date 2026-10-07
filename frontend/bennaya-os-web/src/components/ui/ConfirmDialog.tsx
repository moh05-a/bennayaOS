import { Button } from './Button'
import { Modal } from './Modal'
import { useLanguage } from '../../hooks/useLanguage'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Used before anything destructive, so a delete is never one stray tap away. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage()

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel ?? t('common.delete')}
        </Button>
      </div>
    </Modal>
  )
}
