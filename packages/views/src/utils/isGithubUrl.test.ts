import { isGithubUrl } from './isGithubUrl'

describe('isGithubUrl', () => {
  it.each([
    'https://github.com',
    'https://github.com/project',
    'HTTP://WWW.GITHUB.COM/project',
    '//gist.github.com/id',
  ])('recognizes GitHub hosts: %s', (url) => expect(isGithubUrl(url)).toBe(true))

  it.each(['https://example.org', 'https://github.com.example.org', '/github.com', 'https://example.org/github.com'])(
    'keeps other hosts and relative paths: %s',
    (url) => expect(isGithubUrl(url)).toBe(false),
  )
})
