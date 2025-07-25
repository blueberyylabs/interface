import * as matchers from 'jest-extended'
expect.extend(matchers)

import { mocked } from '../../src/test-utils/mocked'
import Cache, { Data } from './cache'
import { getRequest } from './getRequest'

vi.mock('./cache', () => ({
  default: {
    match: vi.fn(),
    put: vi.fn(),
  },
  match: vi.fn(),
  put: vi.fn(),
}))

test('should call Cache.match before calling getData when request is not cached', async () => {
  const url = 'https://example.com'
  const getData = vi.fn().mockResolvedValueOnce({
    title: 'test',
    image: 'testImage',
    url: 'testUrl',
  })
  await getRequest({ url, getData, validateData: (data): data is Data => true })
  expect(Cache.match).toHaveBeenCalledWith(url)
  expect(getData).toHaveBeenCalled()
  expect(Cache.match).toHaveBeenCalledBefore(getData)
  expect(Cache.put).toHaveBeenCalledAfter(getData)
})

test('getData should not be called when request is cached', async () => {
  const url = 'https://example.com'
  mocked(Cache.match).mockResolvedValueOnce({
    title: 'test',
    image: 'testImage',
    url: 'testUrl',
  })
  const getData = vi.fn()
  await getRequest({ url, getData, validateData: (data): data is Data => true })
  expect(Cache.match).toHaveBeenCalledWith(url)
  expect(getData).not.toHaveBeenCalled()
})
