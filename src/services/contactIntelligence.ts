export type ContactStatus = 'sales_ready' | 'contactable' | 'needs_person' | 'weak_contact' | 'missing';

export interface ContactPerson {
    name: string;
    role?: string | null;
    profileUrl?: string | null;
    sourceUrl?: string | null;
    confidence?: number | null;
}

export interface ContactBundle {
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    contactPages: string[];
    socialProfiles: string[];
    decisionMakers: ContactPerson[];
    bestContactChannel?: string | null;
    contactStatus: ContactStatus;
    contactConfidence: number;
    contactEvidence: string[];
}

function unique(values: Array<string | null | undefined>) {
    return Array.from(new Set(
        values
            .map(value => (value || '').trim())
            .filter(value => value.length > 0)
    ));
}

function cleanPhone(phone?: string | null) {
    const raw = (phone || '').trim();
    return raw.replace(/\D/g, '').length >= 7 ? raw : null;
}

function cleanEmail(email?: string | null) {
    const raw = (email || '').trim();
    return raw.includes('@') && !raw.includes('example') ? raw : null;
}

export function buildContactBundle(source: {
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    contactPages?: Array<string | null | undefined> | null;
    socialProfiles?: Array<string | null | undefined> | null;
    decisionMakers?: ContactPerson[] | null;
}): ContactBundle {
    const email = cleanEmail(source.email);
    const phone = cleanPhone(source.phone);
    const website = (source.website || '').trim() || null;
    const contactPages = unique(source.contactPages || []);
    const socialProfiles = unique(source.socialProfiles || []);
    const decisionMakers = (source.decisionMakers || []).filter(person => person.name?.trim());

    const contactEvidence = [
        email ? `email:${email}` : null,
        phone ? `phone:${phone}` : null,
        ...contactPages.map(page => `contact_page:${page}`),
        ...socialProfiles.map(profile => `social:${profile}`),
        ...decisionMakers.map(person => `person:${person.name}${person.role ? `/${person.role}` : ''}`),
    ].filter(Boolean) as string[];

    let contactStatus: ContactStatus = 'missing';
    let bestContactChannel: string | null = null;
    let contactConfidence = 0;

    if (email) {
        contactStatus = 'sales_ready';
        bestContactChannel = 'email';
        contactConfidence = 95;
    } else if (phone) {
        contactStatus = 'sales_ready';
        bestContactChannel = 'phone';
        contactConfidence = 90;
    } else if (contactPages.length > 0) {
        contactStatus = decisionMakers.length > 0 ? 'contactable' : 'needs_person';
        bestContactChannel = 'contact_page';
        contactConfidence = decisionMakers.length > 0 ? 76 : 68;
    } else if (socialProfiles.length > 0) {
        contactStatus = decisionMakers.length > 0 ? 'contactable' : 'weak_contact';
        bestContactChannel = 'social_profile';
        contactConfidence = decisionMakers.length > 0 ? 64 : 48;
    }

    return {
        email,
        phone,
        website,
        contactPages,
        socialProfiles,
        decisionMakers,
        bestContactChannel,
        contactStatus,
        contactConfidence,
        contactEvidence,
    };
}

export function hasUsableContactRoute(bundle: ContactBundle) {
    return Boolean(
        bundle.email ||
        bundle.phone ||
        bundle.contactPages.length > 0 ||
        bundle.socialProfiles.length > 0
    );
}
