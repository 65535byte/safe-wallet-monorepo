import { translateMessage } from '@/i18n'
const getSignableMessage = (address: string, chainId: bigint, nonce: string) => {
  const message = {
    domain: window.location.host,
    address,
    statement: translateMessage('ui.bySigningYouAreAgreeingTo_31194a80'),
    uri: window.location.origin,
    version: '1',
    chainId: Number(chainId),
    nonce,
    issuedAt: new Date(),
  }
  const signableMessage = `${message.domain} wants you to sign in with your Ethereum account:
${message.address}

${message.statement}

URI: ${message.uri}
Version: ${message.version}
Chain ID: ${message.chainId}
Nonce: ${message.nonce}
Issued At: ${message.issuedAt.toISOString()}`

  return signableMessage
}

export { getSignableMessage }
