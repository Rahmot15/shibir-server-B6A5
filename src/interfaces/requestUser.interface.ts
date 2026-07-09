import { Role } from "@prisma/client";

export interface IRequestUser{
    id: string;
    userId : string;
    role : Role;
    email : string;
}
