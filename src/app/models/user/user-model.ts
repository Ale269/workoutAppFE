


export type RoleEnum = 'USER' | 'ADMIN';

export interface UserModel{
    userId:number; // Mantenuto per retrocompatibilità
    id?: number;   // Campo corretto dal backend
    username:string;
    name?: string;
    surname?: string;
    email?: string;
    location?: string;
    role?: RoleEnum;
    enabled?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    //password:string;
}