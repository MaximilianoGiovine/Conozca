'use server';

import { z } from 'zod';
import { newsletterService } from '../services/newsletterService';

const SubscribeSchema = z.object({
    email: z.string().email(),
});

export async function subscribeAction(formData: FormData) {
    const email = formData.get('email') as string;

    const validatedFields = SubscribeSchema.safeParse({
        email,
    });

    if (!validatedFields.success) {
        return {
            error: 'invalidEmail',
        };
    }

    try {
        await newsletterService.subscribe(validatedFields.data.email);
        return { success: true };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return {
            error: 'error',
        };
    }
}
