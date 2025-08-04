export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    yachtId: string;
    departmentId?: string;
    createdBy: string;
    acknowledgements: EventAcknowledgement[];
    isRecurring: boolean;
    recurrenceRule?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventAcknowledgement {
    id: string;
    eventId: string;
    userId: string;
    acknowledgedAt: Date;
    message?: string;
}
