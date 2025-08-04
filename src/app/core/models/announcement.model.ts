
export interface Announcement {
    id: string;
    title: string;
    content: string;
    departmentId: string;
    yachtId: string;
    createdBy: string;
    isActive: boolean;
    priority: AnnouncementPriority;
    createdAt: Date;
    updatedAt: Date;
}

export enum AnnouncementPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}
