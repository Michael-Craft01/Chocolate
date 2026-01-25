// Zimbabwe Locations
export const LOCATIONS_ZW = [
    'Harare',
    'Bulawayo',
    'Chitungwiza',
    'Mutare',
    'Gweru',
    'Epworth',
    'Kwekwe',
    'Kadoma',
    'Masvingo',
    'Chinhoyi',
    'Marondera',
    'Norton',
    'Chegutu',
];
// South Africa Locations
export const LOCATIONS_SA = [
    'Johannesburg',
    'Cape Town',
    'Durban',
    'Pretoria',
    'Port Elizabeth',
    'Bloemfontein',
    'Centurion',
    'Sandton',
    'Midrand',
    'Roodepoort',
    'Soweto',
    'Randburg',
    'Kempton Park',
];
// Combined for backward compatibility
export const LOCATIONS = [...LOCATIONS_ZW, ...LOCATIONS_SA];
export const INDUSTRIES = [
    // Trades
    'Plumbing',
    'Electrician',
    'Roofing',
    'HVAC',
    'Landscaping',
    'Cleaning Services',
    'Pest Control',
    'Locksmith',
    'Painting Contractors',
    'Fencing Contractors',
    'Solar Installation',
    'Pool Maintenance',
    // Professional Services
    'Real Estate',
    'Digital Marketing',
    'Accounting',
    'Legal Services',
    'Architecture',
    'Interior Design',
    'IT Support',
    'Web Design',
    'Cybersecurity',
    'HR Consulting',
    'Business Coaching',
    // Health & Wellness
    'Dentist',
    'Chiropractor',
    'Physiotherapy',
    'Gym',
    'Yoga Studio',
    'Spa and Wellness',
    // Automotive
    'Auto Repair',
    'Car Detailing',
    'Tyre Services',
    // Retail/Hospitality
    'Restaurant',
    'Hotel',
    'Event Planning',
    'Catering',
    'Florist'
];
export const QUERY_TEMPLATES = [
    '{industry} in {location}',
    'top rated {industry} {location}',
    '{industry} services near {location}',
    'best {industry} companies in {location}',
    'affordable {industry} {location}',
    '{industry} experts {location}',
    'commercial {industry} {location}',
    'residential {industry} {location}'
];
//# sourceMappingURL=constants.js.map