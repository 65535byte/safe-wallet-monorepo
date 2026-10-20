export const isGithubUrl = (url: string): boolean =>
  /^(?:https?:)?\/\/(?:[a-z0-9-]+\.)*github\.com(?=[:/?#]|$)/i.test(url.trim())
