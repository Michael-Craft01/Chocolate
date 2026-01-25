export interface LeadPayload {
    name: string;
    industry: string;
    painPoint: string;
    recommendedSolution?: string;
    message: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    location: string;
}
export declare class DiscordDispatcher {
    private isValidWebsiteUrl;
    dispatch(lead: LeadPayload): Promise<boolean>;
}
export declare const discordDispatcher: DiscordDispatcher;
//# sourceMappingURL=discordDispatcher.d.ts.map