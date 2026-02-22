/**
 * GitHubHealthAdapter Unit Tests
 * Mocks global.fetch — no real network calls.
 */

import { GitHubHealthAdapter } from '../../infrastructure/providers/GitHubHealthAdapter';

describe('GitHubHealthAdapter', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkProvider', () => {
    it('should return ok when fetch resolves with a 200 response', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));

      const result = await new GitHubHealthAdapter().checkProvider();

      expect(result).toBe('ok');
    });

    it('should return ok for any HTTP response — even 401 (server is up)', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 401 }));

      const result = await new GitHubHealthAdapter().checkProvider();

      expect(result).toBe('ok');
    });

    it('should return ok for a 403 response (rate-limited but reachable)', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 403 }));

      const result = await new GitHubHealthAdapter().checkProvider();

      expect(result).toBe('ok');
    });

    it('should return error when fetch throws a network error', async () => {
      fetchSpy.mockRejectedValue(new Error('fetch failed'));

      const result = await new GitHubHealthAdapter().checkProvider();

      expect(result).toBe('error');
    });

    it('should return error when the request is aborted (timeout)', async () => {
      const abortError = Object.assign(new Error('The operation was aborted'), {
        name: 'AbortError',
      });
      fetchSpy.mockRejectedValue(abortError);

      const result = await new GitHubHealthAdapter().checkProvider();

      expect(result).toBe('error');
    });
  });

  describe('request targeting', () => {
    beforeEach(() => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    });

    it('should use https://api.github.com by default (no graphqlURL)', async () => {
      await new GitHubHealthAdapter().checkProvider();

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.github.com',
        expect.objectContaining({ method: 'HEAD' })
      );
    });

    it('should use https://api.github.com when graphqlURL is undefined', async () => {
      await new GitHubHealthAdapter(undefined).checkProvider();

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.github.com',
        expect.objectContaining({ method: 'HEAD' })
      );
    });

    it('should derive origin from a custom graphqlURL (GHE)', async () => {
      await new GitHubHealthAdapter('https://ghe.company.com/api/graphql').checkProvider();

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://ghe.company.com',
        expect.objectContaining({ method: 'HEAD' })
      );
    });

    it('should include port when present in graphqlURL', async () => {
      await new GitHubHealthAdapter('https://ghe.company.com:8443/api/graphql').checkProvider();

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://ghe.company.com:8443',
        expect.objectContaining({ method: 'HEAD' })
      );
    });

    it('should fall back to api.github.com for an unparseable graphqlURL', async () => {
      await new GitHubHealthAdapter('not-a-valid-url').checkProvider();

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.github.com',
        expect.objectContaining({ method: 'HEAD' })
      );
    });
  });

  describe('ping', () => {
    it('should always return true', () => {
      expect(new GitHubHealthAdapter().ping()).toBe(true);
    });
  });
});
