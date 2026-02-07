// Zimbabwe Locations - Suburb-level for better targeting
export const LOCATIONS_ZW = [
    // Harare suburbs (affluent areas)
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
    // Bulawayo
    'Hillside Bulawayo',
    'Burnside Bulawayo',
    'Suburbs Bulawayo',
    'Matsheumhlope Bulawayo',
    // Other major cities
    'Mutare',
    'Gweru',
    'Masvingo',
    'Victoria Falls',
    'Chinhoyi',
    'Marondera',
];

// South Africa Locations - Key metros and affluent suburbs
export const LOCATIONS_SA = [
    // Johannesburg / Gauteng
    'Sandton',
    'Fourways',
    'Rosebank',
    'Bryanston',
    'Hyde Park',
    'Randburg',
    'Midrand',
    'Centurion',
    'Waterkloof Pretoria',
    'Menlyn Pretoria',
    'Brooklyn Pretoria',
    // Cape Town
    'Constantia Cape Town',
    'Camps Bay Cape Town',
    'Sea Point Cape Town',
    'Stellenbosch',
    'Paarl',
    // Durban
    'Umhlanga',
    'Ballito',
    'La Lucia Durban',
    'Durban North',
];

// Combined for backward compatibility
export const LOCATIONS = [...LOCATIONS_ZW, ...LOCATIONS_SA];

// Real Estate Industries - targeted segments
export const INDUSTRIES = [
    // Core Real Estate
    'Real Estate Agency',
    'Estate Agents',
    'Property Agents',
    'Realtors',

    // Specialized
    'Property Management',
    'Letting Agents',
    'Rental Agents',
    'Commercial Real Estate',
    'Industrial Property',
    'Property Developers',

    // Supporting Services
    'Property Valuers',
    'Conveyancing Attorneys',
    'Property Auctioneers',
    'Real Estate Investment',
];

// Query templates optimized for real estate
export const QUERY_TEMPLATES = [
    '{industry} {location}',
    '{industry} in {location}',
    'top {industry} {location}',
    'best {industry} in {location}',
    '{location} {industry}',
    'property agents {location}',
    'estate agency {location}',
    'houses for sale {location}',
];

