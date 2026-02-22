/**
 * createLogger Unit Tests
 * Verifies that the Proxy-based logger correctly delegates to the
 * request-scoped logger when a context is active, and falls back to
 * the root logger outside of one.
 */

import { createLogger } from '../../shared/utils/logger';
import { requestContext } from '../../shared/utils/requestContext';

describe('createLogger proxy', () => {
  it('does not throw when called outside a request context', () => {
    const log = createLogger('TestService');
    expect(() => log.info('outside context')).not.toThrow();
  });

  it('delegates to req.log.child({ name }) inside a request context', () => {
    const infoMock = jest.fn();
    const childLogger = { info: infoMock };
    const childMock = jest.fn().mockReturnValue(childLogger);
    const reqLogger = { child: childMock } as any;

    const log = createLogger('TestService');

    requestContext.run(reqLogger, () => {
      log.info({ key: 'value' }, 'test message');
    });

    expect(childMock).toHaveBeenCalledWith({ name: 'TestService' });
    expect(infoMock).toHaveBeenCalledWith({ key: 'value' }, 'test message');
  });

  it('uses the root logger after the request context exits', () => {
    const infoMock = jest.fn();
    const childLogger = { info: infoMock };
    const reqLogger = { child: jest.fn().mockReturnValue(childLogger) } as any;

    const log = createLogger('TestService');

    requestContext.run(reqLogger, () => {
      log.info('inside');
    });

    // After context exits, root logger is used — infoMock is NOT called again
    expect(() => log.info('outside')).not.toThrow();
    expect(infoMock).toHaveBeenCalledTimes(1);
  });

  it('each createLogger call uses its own name in the child binding', () => {
    const childMockA = jest.fn().mockReturnValue({ warn: jest.fn() });
    const childMockB = jest.fn().mockReturnValue({ warn: jest.fn() });
    const reqLogger = {
      child: jest.fn()
        .mockReturnValueOnce({ warn: jest.fn() })
        .mockReturnValueOnce({ warn: jest.fn() }),
    } as any;

    // Give each logger its own mock so we can assert on names independently
    reqLogger.child = jest.fn()
      .mockImplementation(({ name }: { name: string }) => {
        if (name === 'ServiceA') return { warn: childMockA };
        if (name === 'ServiceB') return { warn: childMockB };
        return { warn: jest.fn() };
      });

    const logA = createLogger('ServiceA');
    const logB = createLogger('ServiceB');

    requestContext.run(reqLogger, () => {
      logA.warn('from A');
      logB.warn('from B');
    });

    expect(reqLogger.child).toHaveBeenCalledWith({ name: 'ServiceA' });
    expect(reqLogger.child).toHaveBeenCalledWith({ name: 'ServiceB' });
  });
});
