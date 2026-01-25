export interface QueryData {
    query: string;
    location: string;
    industry: string;
    country: 'ZW' | 'SA';
}
export declare class QueryGenerator {
    /**
     * Generate a batch of queries for a cycle - targeting both ZW and SA
     * @param countPerCountry Number of queries to generate per country
     */
    generateBatchQueries(countPerCountry?: number): Promise<QueryData[]>;
    private generateQueriesForCountry;
    /**
     * Legacy method for single query generation (backward compatibility)
     */
    generateNextQuery(): Promise<QueryData | null>;
    private shuffle;
    private getRandomItem;
}
export declare const queryGenerator: QueryGenerator;
//# sourceMappingURL=queryGenerator.d.ts.map