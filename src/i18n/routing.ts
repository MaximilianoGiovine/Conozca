import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['es', 'en', 'fr', 'pt'],
    defaultLocale: 'es',
    localePrefix: 'as-needed', // Only add prefix to non-default locales
    localeDetection: true // Automatically redirect based on browser headers
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
