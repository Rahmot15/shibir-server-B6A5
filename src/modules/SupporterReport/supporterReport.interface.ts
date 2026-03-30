export type TSupporterReport = {
    month: string;
    name?: string;
    school?: string;
    numericEntries: {
        metric: string;
        day: number;
        value: number;
    }[];
    checkboxEntries: {
        metric: string;
        day: number;
        checked: boolean;
    }[];
};

export type TSupporterAdvicePayload = {
    text: string;
};
