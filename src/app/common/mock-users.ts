import {User, UserRole} from "../core/models/user.model";

export const MOCK_USERS: User[] = [
    {
        id: 'usr_hod_001',
        email: 'hod@gmail.com',
        firstName: 'Alessandro',
        lastName: 'Rossi',
        role: UserRole.HOD, // Head of Department - per testing delle funzionalità di gestione
        accountId: 'acc_dolphyn_alpha',
        departmentId: 'dept_bridge_alpha', // Associato ad un dipartimento specifico
        isActive: true,
        createdAt: new Date('2023-01-15T10:00:00Z'),
        updatedAt: new Date('2024-06-20T14:30:00Z'),
    },
    {
        id: 'usr_crew_002',
        email: 'crew@gmail.com',
        firstName: 'Sofia',
        lastName: 'Bianchi',
        role: UserRole.CREW, // Crew - per testing delle funzionalità di sola visualizzazione
        accountId: 'acc_dolphyn_alpha',
        departmentId: 'dept_deck_alpha', // Associato ad un dipartimento
        isActive: true,
        createdAt: new Date('2023-03-01T09:15:00Z'),
        updatedAt: new Date('2024-05-10T11:00:00Z'),
    },
    {
        id: 'usr_admin_003',
        email: 'admin@gmail.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN, // Admin - per testing della dashboard amministrativa
        accountId: 'acc_dolphyn_admin', // Account dedicato agli amministratori di sistema
        departmentId: undefined, // Gli ADMIN non sono associati a un dipartimento specifico di uno yacht
        isActive: true,
        createdAt: new Date('2022-10-01T08:00:00Z'),
        updatedAt: new Date('2024-07-01T09:00:00Z'),
    },
    {
        id: 'usr_hod_004',
        email: 'hod.giulia@dolphyn.com',
        firstName: 'Giulia',
        lastName: 'Verdi',
        role: UserRole.HOD,
        accountId: 'acc_dolphyn_beta', // Un altro account, per testare la separazione dei dati
        departmentId: 'dept_engine_beta',
        isActive: true,
        createdAt: new Date('2023-02-20T12:00:00Z'),
        updatedAt: new Date('2024-06-15T10:00:00Z'),
    },
    {
        id: 'usr_crew_005',
        email: 'crew.marco@dolphyn.com',
        firstName: 'Marco',
        lastName: 'Neri',
        role: UserRole.CREW,
        accountId: 'acc_dolphyn_alpha',
        departmentId: 'dept_interior_alpha',
        isActive: false, // Utente inattivo, per testare stati diversi
        createdAt: new Date('2023-04-05T14:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
];

// Esportazioni singole per comodità
export const MOCK_HOD_USER: User = MOCK_USERS[0];
export const MOCK_CREW_USER: User = MOCK_USERS[1];
export const MOCK_ADMIN_USER: User = MOCK_USERS[2];
