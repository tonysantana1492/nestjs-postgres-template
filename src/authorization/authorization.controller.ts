import { Body, Controller, HttpCode, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthorizationService } from './authorization.service';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthRoles } from './decorators/role.decorator';
import { Role } from './enums/role.enum';

@Controller('authorization')
@ApiTags('authorization')
@AuthRoles(Role.SuperAdmin)
@ApiBearerAuth()
export class AuthorizationController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	@Patch(':userId/role')
	@HttpCode(204)
	updateRole(@Param('userId', ParseIntPipe) userId: number, @Body() updateRoleDto: UpdateRoleDto) {
		return this.authorizationService.updateRole(userId, updateRoleDto);
	}

	@Patch(':userId/permissions')
	@HttpCode(204)
	updatePermission(
		@Param('userId', ParseIntPipe) userId: number,
		@Body() updatePermissionsDto: UpdatePermissionsDto,
	) {
		return this.authorizationService.updatePermission(userId, updatePermissionsDto);
	}
}
