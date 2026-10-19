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
  readonly closeButton: Locator
  readonly discardButton: Locator
  readonly signMessageButton: Locator
  /** Shown once the message has all its signatures; it hands the signature to the app that asked for it. */
  readonly signedMessageContinueButton: Locator

  constructor(page: Page) {
    this.continueButton = page.getByTestId('continue-sign-btn')
    this.riskConfirmation = page.getByTestId('risk-confirmation-checkbox')
    this.signButton = page.getByTestId('combo-submit-sign')
    this.connectedWalletExecution = page.getByTestId('connected-wallet-execution-method')
    this.submitExecutionButton = page.getByTestId('combo-submit-execute')
    this.closeButton = page.getByRole('dialog').getByRole('button', { name: 'close' })
    this.discardButton = page.getByRole('alertdialog').getByRole('button', { name: 'Discard' })
    this.signMessageButton = page.getByRole('button', { name: 'Sign', exact: true })
    this.signedMessageContinueButton = page.getByRole('button', { name: 'Continue', exact: true })
  }

  /** Accepts the risk of the failed threat analysis and continues to the submit step. */
  async continueAfterRiskCheck(): Promise<void> {
    await this.riskConfirmation.click()
    await this.continueButton.click()
  }

  /** Closes the flow and confirms "Discard this transaction?"; the app that asked for it gets a rejection. */
  async discard(): Promise<void> {
    await this.closeButton.click()
    await this.discardButton.click()
  }

  /** Signs the reviewed message of a 1/n Safe and hands the signature to the app that asked for it. */
  async signMessage(): Promise<void> {
    await this.riskConfirmation.click()
    await this.signMessageButton.click()
    await this.signedMessageContinueButton.click()
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
