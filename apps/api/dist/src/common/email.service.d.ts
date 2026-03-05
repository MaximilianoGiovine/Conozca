export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare class EmailService {
    private transporter;
    private logger;
    private isConfigured;
    constructor();
    private initializeTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendArticlePublishedNotification(adminEmail: string, articleTitle: string, authorName: string): Promise<boolean>;
}
