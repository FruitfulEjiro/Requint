import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepo, MemberRepo } from 'src/shared/database/repositories';
import { CreateMemberDTO } from './dtos';
import { Helper } from 'src/lib/helpers';
import { EmailService } from 'src/shared/email';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    private readonly memberRepo: MemberRepo,
    private readonly employeeRepo: EmployeeRepo,
    private readonly helper: Helper,
    private readonly email: EmailService,
  ) {}

  async createMember(inviterId: string, teamId: string, data: CreateMemberDTO) {
    try {
      const team = await this.memberRepo.checkTeam(teamId);
      if (!team) throw new NotFoundException('team doesnt exist');

      const password = this.helper.generatePassword();
      const hashedPassword = await this.helper.hash(password);
      const user = await this.memberRepo.createUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: hashedPassword,
      });

      // const memberObj: any = {};

      const membership = await this.memberRepo
        .create({
          user: {
            connect: {
              id: user.id,
            },
          },
          inviter: {
            connect: {
              id: inviterId,
            },
          },
          team: {
            connect: {
              id: teamId,
            },
          },
        })
        .then((data) => {
          this.logger.log('member added to team successfully');
          return data;
        });

      await this.employeeRepo
        .create({
          team: {
            connect: {
              id: teamId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          jobTitle: 'Employee',
          startDate: new Date(data.startDate! || Date.now()),
        })
        .then(() => this.logger.log('employee record created successfully'));

      // send email to newly added member
      await this.email.membershipEmail(
        user.firstname,
        team.name,
        user.email,
        password,
      );

      return membership;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async removeMember(membershipId: string, teamId: string) {
    try {
      const checkMember = await this.memberRepo.findPopulatedMember(
        membershipId,
        teamId,
      );
      if (!checkMember)
        throw new NotFoundException("this user isn't a member of this team");

      const member = await this.memberRepo.delete(membershipId);

      // send email to user
      await this.email.removeMember(checkMember.user.email, checkMember.user.firstname, checkMember.team.name)

      return member;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}
