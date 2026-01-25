export interface ScrapedBusiness {
    name: string;
    address?: string | null;
    category?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    description?: string | null;
}
export declare class Scraper {
    private browser;
    init(): Promise<void>;
    scrape(query: string): Promise<ScrapedBusiness[]>;
    close(): Promise<void>;
}
export declare const scraper: Scraper;
//# sourceMappingURL=scraper.d.ts.map