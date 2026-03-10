// Zimbabwe Locations - Harare Only for Takada targeting
export const LOCATIONS_ZW = [
    'Harare CBD',
    'Borrowdale Harare',
    'Mt Pleasant Harare',
    'Avondale Harare',
    'Greendale Harare',
    'Highlands Harare',
    'Belvedere Harare',
    'Eastlea Harare',
    'The Avenues Harare',
    'Chisipite Harare',
    'Glen Lorne Harare',
    'Msasa Harare',
    'Workington Harare',
    'Graniteside Harare',
    'Southerton Harare',
    'Ardbennie Harare',
    'Hatfield Harare',
    'Waterfalls Harare',
    'Marlborough Harare',
    'Mabelreign Harare',
    'Milton Park Harare',
    'Kensington Harare',
    'Vainona Harare',
    'Pomona Harare',
];

// Temporarily emptied SA locations as focus is on Harare
export const LOCATIONS_SA = [];

// Combined for backward compatibility
export const LOCATIONS = [...LOCATIONS_ZW, ...LOCATIONS_SA];

// SME Industries with Stock/Inventory
export const INDUSTRIES = [
    'Wholesale',
    'Retail Store',
    'Hardware Store',
    'Auto Parts',
    'Pharmacy',
    'Medical Supplies',
    'Clothing Boutique',
    'Electronics Store',
    'Supermarket',
    'Furniture Store',
    'Cosmetics Shop',
    'Construction Supplies',
    'Agrochemicals',
    'Textiles',
    'Stationery Shop',
    'Battery Shop',
    'Tyre Shop',
    'Home Decor',
    'Office Supplies',
    'Warehouse',
];

// Query templates optimized for local businesses
export const QUERY_TEMPLATES = [
    '{industry} in {location}',
    '{industry} {location}',
    'top {industry} {location}',
    'best {industry} in {location}',
    '{location} {industry}',
    'suppliers of {industry} {location}',
    'distributors of {industry} {location}',
];

