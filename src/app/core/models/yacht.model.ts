
export interface Yacht {
    id: string;
    name: string;
    accountId: string;
    description?: string;
    departments: Department[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Department {
    id: string;
    name: string;
    yachtId: string;
    isDefault: boolean;
    procedures: Procedure[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Procedure {
    id: string;
    title: string;
    description: string;
    category: ProcedureCategory;
    area?: string;
    item: string;
    steps: ProcedureStep[];
    images: string[];
    videos: string[];
    departmentId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcedureStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    images: string[];
    videos: string[];
    warnings: string[];
}

export enum ProcedureCategory {
    SETUP = 'SETUP',
    OPERATION = 'OPERATION',
    MAINTENANCE = 'MAINTENANCE'
}
