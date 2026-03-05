'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { subscribeAction } from '../actions/subscribe';

export function NewsletterForm() {
    const t = useTranslations('Newsletter');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalidEmail'>('idle');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus('loading');

        const formData = new FormData(event.currentTarget);
        const result = await subscribeAction(formData);

        if (result.success) {
            setStatus('success');
        } else if (result.error === 'invalidEmail') {
            setStatus('invalidEmail');
        } else {
            setStatus('error');
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    disabled={status === 'loading' || status === 'success'}
                    className="flex-grow px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50"
                >
                    {status === 'loading' ? t('loading') : 'Unirse a la lista'}
                </button>
            </form>

            {status === 'success' && (
                <p className="text-amber-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {t('success')}
                </p>
            )}

            {status === 'error' && (
                <p className="text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
                    {t('error')}
                </p>
            )}

            {status === 'invalidEmail' && (
                <p className="text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
                    {t('invalidEmail')}
                </p>
            )}
        </div>
    );
}
