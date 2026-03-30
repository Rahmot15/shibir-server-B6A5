import {
    SupporterCheckboxMetric,
    SupporterNumericMetric,
} from '@prisma/client';

export const SupporterReportSearchableFields = ['name', 'school'];

export const FRONTEND_NUMERIC_METRIC_MAP: Record<string, SupporterNumericMetric> = {
    quran: SupporterNumericMetric.QURAN,
    hadith: SupporterNumericMetric.HADITH,
    islamic: SupporterNumericMetric.ISLAMIC_BOOK,
    textbook: SupporterNumericMetric.TEXTBOOK_HOURS,
    friends: SupporterNumericMetric.FRIENDS_CONTACT,
    goodwork: SupporterNumericMetric.GOODWORK_HOURS,
    namazJamaat: SupporterNumericMetric.NAMAZ_JAMAAT,
    namazQaza: SupporterNumericMetric.NAMAZ_QAZA,
};

export const FRONTEND_CHECKBOX_METRIC_MAP: Record<string, SupporterCheckboxMetric> = {
    class: SupporterCheckboxMetric.CLASS,
    selfcrit: SupporterCheckboxMetric.SELFCRIT,
    sports: SupporterCheckboxMetric.SPORTS,
    newspaper: SupporterCheckboxMetric.NEWSPAPER,
};
