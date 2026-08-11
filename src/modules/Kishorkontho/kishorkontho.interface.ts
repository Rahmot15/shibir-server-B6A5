export type TKishorkonthoContentInput = {
    type: 'STORY' | 'POEM' | 'SCIENCE' | 'ISLAMIC' | 'QUIZ' | 'ART' | 'TRAVEL';
    title: string;
    author: string;
    page: number;
};

export type TKishorkonthoCreateInput = {
    title: string;
    month: string;
    year: number;
    price: number;
    discount?: number;
    coverImage: string;
    description: string;
    slug?: string;
    pdfFull?: string;
    pdfPreview?: string;
    isFreePreview?: boolean;
    purchaseType?: 'PHYSICAL' | 'DIGITAL' | 'BOTH';
    stock?: number;
    isAvailable?: boolean;
    paymentMethods?: ('BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'BANK')[];
    subscriptionEligible?: boolean;
    language?: string;
    publisherName: string;
    publisherOrg: string;
    editorName: string;
    editorRole?: string;
    tags?: string[];
    contents?: TKishorkonthoContentInput[];
};

export type TKishorkonthoUpdateInput = Partial<TKishorkonthoCreateInput>;

export type TKishorkonthoReviewInput = {
    rating: number;
    comment: string;
};
