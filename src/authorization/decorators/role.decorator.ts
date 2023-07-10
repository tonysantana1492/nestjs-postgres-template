import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLE_KEY = 'roles';
export const AuthRoles = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);
