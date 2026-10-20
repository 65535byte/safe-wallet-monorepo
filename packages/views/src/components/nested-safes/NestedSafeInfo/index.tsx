import { translateMessage } from '@safe-global/views/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Check } from 'lucide-react'
import type { ReactElement } from 'react'

import NestedSafesIcon from '@safe-global/views/assets/images/sidebar/nested-safes-icon.svg'
import NestedSafes from '@safe-global/views/assets/images/sidebar/nested-safes.svg'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'

export function NestedSafeInfo(): ReactElement {
  return (
    <div className="flex flex-col items-center pt-2">
      <NestedSafes />
      <div className="flex gap-2 py-4">
        <Typography variant="paragraph-bold">{translateMessage('ui.noNestedAccountsYet_7eed3019')}</Typography>
        <Tooltip>
          <TooltipTrigger
            render={
              <span>
                <InfoIcon className="size-5 align-middle text-[var(--color-border-main)]" />
              </span>
            }
          />
          <TooltipContent>{translateMessage('ui.nestedAccountsAreSeparateWalletsOwned_94e937ea')}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-4 pb-8 pt-2">
        <div className="flex items-center justify-center rounded-full bg-[var(--color-success-background)] p-5">
          <NestedSafesIcon className="size-5 text-[var(--color-primary-main)]" />
        </div>
        <Typography variant="paragraph-small-bold">
          {translateMessage('ui.nestedAccountsAllowYouTo_8601ceb5')}
        </Typography>
      </div>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {[
          translateMessage('ui.rebuildYourOrganizationalStructureOnchain_09dbffbe'),
          translateMessage('ui.exploreNewDeFiOpportunitiesWithoutExposing_59e8fe3b'),
          translateMessage('ui.deploySpecializedModulesAndExtendFunctionality_8b172c70'),
        ].map((item) => {
          return (
            <li key={item} className="flex items-start gap-6 pl-3">
              <div className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-[var(--color-success-background)]">
                <Check className="size-4 text-[var(--color-success-main)]" />
              </div>
              <Typography variant="paragraph-small">{item}</Typography>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
