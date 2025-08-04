export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    accountId: string;
    departmentId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    HOD = 'HOD',
    CREW = 'CREW',
    ADMIN = 'ADMIN'
}
