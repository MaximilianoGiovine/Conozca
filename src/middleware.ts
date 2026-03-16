import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
    ...routing,
    localePrefix: 'as-needed',
    localeDetection: true
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(es|en|fr|pt)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
