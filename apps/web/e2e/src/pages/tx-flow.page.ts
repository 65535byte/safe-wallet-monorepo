/**
 * Transaction flow Page Object — the modal that reviews, signs and executes a transaction that a dApp or the user
 * started.
 *
 * Rule: Page Objects hold locators and actions only. Assertions belong in the
 * test file, never here. Waiting (waitFor / waitForResponse) is allowed.
 */
import { type Page, type Locator } from '@playwright/test'

export class TxFlowPage {
  readonly continueButton: Locator
  /** Asked once the threat analysis fails, as it always does on the isolated stack, which has no analysis service. */
  readonly riskConfirmation: Locator
  readonly signButton: Locator
  readonly connectedWalletExecution: Locator
  readonly submitExecutionButton: Locator

  constructor(page: Page) {
    this.continueButton = page.getByTestId('continue-sign-btn')
    this.riskConfirmation = page.getByTestId('risk-confirmation-checkbox')
    this.signButton = page.getByTestId('combo-submit-sign')
    this.connectedWalletExecution = page.getByTestId('connected-wallet-execution-method')
    this.submitExecutionButton = page.getByTestId('combo-submit-execute')
  }

  /** Accepts the risk of the failed threat analysis and continues to the submit step. */
  async continueAfterRiskCheck(): Promise<void> {
    await this.riskConfirmation.click()
    await this.continueButton.click()
  }

  /**
   * Signs the reviewed transaction of a 1/n Safe, then executes it with the connected wallet. The flow asks for the
   * signature before it offers execution, and the isolated chain selects the relay, which needs no wallet.
   */
  async signAndExecute(): Promise<void> {
    await this.continueAfterRiskCheck()
    await this.signButton.click()
    await this.connectedWalletExecution.click()
    await this.submitExecutionButton.click()
  }
}
