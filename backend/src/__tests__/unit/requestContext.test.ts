/**
 * requestContext Unit Tests
 * Verifies that AsyncLocalStorage correctly scopes the request logger.
 */

import { requestContext, getRequestLogger } from '../../shared/utils/requestContext';
import pino from 'pino';

describe('requestContext', () => {
  it('returns undefined when no context is active', () => {
    expect(getRequestLogger()).toBeUndefined();
  });

  it('returns the bound logger inside requestContext.run()', (done) => {
    const reqLogger = pino({ level: 'silent' });

    requestContext.run(reqLogger, () => {
      expect(getRequestLogger()).toBe(reqLogger);
      done();
    });
  });

  it('returns undefined again after the context exits', async () => {
    const reqLogger = pino({ level: 'silent' });

    await new Promise<void>((resolve) => {
      requestContext.run(reqLogger, () => resolve());
    });

    expect(getRequestLogger()).toBeUndefined();
  });

  it('isolates concurrent contexts from each other', async () => {
    const loggerA = pino({ level: 'silent' });
    const loggerB = pino({ level: 'silent' });

    const [seenA, seenB] = await Promise.all([
      new Promise<pino.Logger | undefined>((resolve) => {
        requestContext.run(loggerA, () => {
          // Yield to allow the other context to start
          setImmediate(() => resolve(getRequestLogger()));
        });
      }),
      new Promise<pino.Logger | undefined>((resolve) => {
        requestContext.run(loggerB, () => {
          setImmediate(() => resolve(getRequestLogger()));
        });
      }),
    ]);

    expect(seenA).toBe(loggerA);
    expect(seenB).toBe(loggerB);
  });
});
