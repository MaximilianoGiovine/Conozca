import { AuditInterceptor } from './audit.interceptor';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  it('logs on mutating requests', (done) => {
    const audit = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const interceptor = new AuditInterceptor(audit);
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', route: { path: '/articles' }, body: { a: 1 }, user: { sub: 'u1' }, ip: '127.0.0.1', headers: { 'user-agent': 'jest' } }),
      }),
    };
    const next: any = { handle: () => of({ id: 'x1' }) };

    interceptor.intercept(context, next).subscribe(() => {
      expect(audit.log).toHaveBeenCalled();
      done();
    });
  });
});
