import { ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithUser } from 'src/authentication/interfaces/request-with-user.interface';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorator';
import { Role } from '../enums/role.enum';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';

@Injectable()
export class RolesGuard extends JwtAuthenticationGuard {
	constructor(private reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// is a public route
		if (!requiredRoles) return true;

		// check for token validation
		await super.canActivate(context);

		// this route can access by any role
		if (requiredRoles.length === 0) return true;

		// check if the user has an authorized rol for this route
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user;

		return requiredRoles.includes(user.role);
		// return requiredRoles.some(role => user.role?.includes(role));
	}
}
