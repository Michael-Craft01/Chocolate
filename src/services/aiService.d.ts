export interface AIEnrichment {
    industry: string;
    painPoint: string;
    recommendedSolution: string;
}
export declare class AIService {
    private genAI;
    private model;
    constructor();
    enrichLead(businessName: string, category?: string, description?: string): Promise<AIEnrichment>;
}
export declare const aiService: AIService;
//# sourceMappingURL=aiService.d.ts.map