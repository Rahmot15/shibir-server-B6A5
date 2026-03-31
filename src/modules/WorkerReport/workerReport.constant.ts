import { WorkerCheckboxMetric, WorkerNumericMetric } from '@prisma/client';

export const WorkerReportSearchableFields = ['name', 'institution', 'thana', 'zila'];

export const FRONTEND_WORKER_NUMERIC_METRIC_MAP: Record<string, WorkerNumericMetric> = {
    quranAyah: WorkerNumericMetric.QURAN_AYAH,
    hadithCount: WorkerNumericMetric.HADITH_COUNT,
    sahityaPage: WorkerNumericMetric.SAHITYA_PAGE,
    textbookHours: WorkerNumericMetric.TEXTBOOK_HOURS,
    namazJamaat: WorkerNumericMetric.NAMAZ_JAMAAT,
    namazQaza: WorkerNumericMetric.NAMAZ_QAZA,
    contactMember: WorkerNumericMetric.CONTACT_MEMBER,
    contactSathi: WorkerNumericMetric.CONTACT_SATHI,
    contactKormi: WorkerNumericMetric.CONTACT_KORMI,
    contactSomorthok: WorkerNumericMetric.CONTACT_SOMORTHOK,
    contactBondhu: WorkerNumericMetric.CONTACT_BONDHU,
    contactMedhabi: WorkerNumericMetric.CONTACT_MEDHABI,
    contactVortakangkhi: WorkerNumericMetric.CONTACT_VORTAKANGKHI,
    contactMuharrama: WorkerNumericMetric.CONTACT_MUHARRAMA,
    distSahitya: WorkerNumericMetric.DIST_SAHITYA,
    distMagazine: WorkerNumericMetric.DIST_MAGAZINE,
    distStickerCard: WorkerNumericMetric.DIST_STICKER_CARD,
    distUpohar: WorkerNumericMetric.DIST_UPOHAR,
    orgDawati: WorkerNumericMetric.ORG_DAWATI,
    orgSangothonik: WorkerNumericMetric.ORG_SANGOTHONIK,
};

export const FRONTEND_WORKER_CHECKBOX_METRIC_MAP: Record<string, WorkerCheckboxMetric> = {
    class: WorkerCheckboxMetric.CLASS,
    sports: WorkerCheckboxMetric.SPORTS,
    newspaper: WorkerCheckboxMetric.NEWSPAPER,
    selfcrit: WorkerCheckboxMetric.SELFCRIT,
};
