import { translateMessage } from '@/i18n'
import type { MessageItem } from '@safe-global/store/gateway/AUTO_GENERATED/messages'
import { useState, type ReactElement } from 'react'
import { Circle as CircleOutlinedIcon } from 'lucide-react'

import { Typography } from '@safe-global/views/components/ui/typography'
import { Link } from '@safe-global/views/components/ui/link'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import DotIcon from '@/public/images/messages/dot.svg'
import EthHashInfo from '@/components/common/EthHashInfo'

import css from '@/components/safe-messages/MsgSigners/styles.module.css'
import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'

// Icons

const Created = () => <CreatedIcon className={css.icon} />

const Signed = () => <SignedIcon className={css.icon} />

const Dot = () => <DotIcon className={css.dot} />

const shouldHideConfirmations = (msg: MessageItem): boolean => {
  const isConfirmed = msg.status === 'CONFIRMED'

  // Threshold reached or more than 3 confirmations
  return isConfirmed || msg.confirmations.length > 3
}

const MsgSigners = ({
  msg,
  showOnlyConfirmations = false,
  showMissingSignatures = false,
  backgroundColor,
}: {
  msg: MessageItem
  showOnlyConfirmations?: boolean
  showMissingSignatures?: boolean
  backgroundColor?: string
}): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const missingConfirmations = [...new Array(Math.max(0, confirmationsRequired - confirmationsSubmitted))]

  const isConfirmed = msg.status === 'CONFIRMED'

  return (
    <ul className={css.signers}>
      {!showOnlyConfirmations && (
        <li className={css.listItem}>
          <div className={css.listItemIcon}>
            <Created />
          </div>
          <div className={css.listItemText}>
            <Typography variant="paragraph-bold">{translateMessage('ui.created_d8278ec8')}</Typography>
          </div>
        </li>
      )}
      <li className={css.listItem}>
        <div className={css.listItemIcon} style={{ backgroundColor }}>
          <Signed />
        </div>
        <div className={css.listItemText}>
          <Typography variant="paragraph-bold">
            {translateMessage('ui.confirmations_bfdbece1')}{' '}
            <span className={txSignersCss.confirmationsTotal}>
              ({translateMessage('ui.text_602591a8', { p0: confirmationsSubmitted, p1: confirmationsRequired })})
            </span>
          </Typography>
        </div>
      </li>
      {!hideConfirmations &&
        confirmations.map(({ owner }) => (
          <li key={owner.value} className={css.listItem}>
            <div className={css.listItemIcon} style={{ backgroundColor }}>
              <Dot />
            </div>
            <div className={css.listItemText}>
              <EthHashInfo address={owner.value} name={owner.name} hasExplorer showCopyButton />
            </div>
          </li>
        ))}
      {!showOnlyConfirmations && confirmations.length > 0 && (
        <li className={css.listItem}>
          <div className={css.listItemIcon} style={{ backgroundColor }}>
            <Dot />
          </div>
          <div className={css.listItemText}>
            <Link render={<button type="button" />} onClick={toggleHide} className="text-base">
              {hideConfirmations ? translateMessage('ui.showAll_c5c3fa8c') : translateMessage('ui.hideAll_9196b8dd')}
            </Link>
          </div>
        </li>
      )}
      {showMissingSignatures &&
        missingConfirmations.map((_, idx) => (
          <li key={`skeleton${idx}`} className={css.listItem}>
            <div className={css.listItemIcon} style={{ backgroundColor }}>
              <CircleOutlinedIcon className={`${css.dot} text-[var(--color-border-main)]`} />
            </div>
            <div className={css.listItemText}>
              <div className="flex flex-row items-center gap-2">
                <Skeleton className="size-9 rounded-full" />
                <Typography variant="paragraph-small" className="text-[var(--color-text-secondary)]">
                  {translateMessage('ui.confirmation_1b9f7018')}
                  {idx + 1 + confirmationsSubmitted}
                </Typography>
              </div>
            </div>
          </li>
        ))}
      {isConfirmed && (
        <li className={css.listItem}>
          <div className={css.listItemIcon} style={{ backgroundColor }}>
            <Dot />
          </div>
          <div className={css.listItemText}>{translateMessage('ui.confirmed_2a0ef702')}</div>
        </li>
      )}
    </ul>
  )
}

export default MsgSigners
