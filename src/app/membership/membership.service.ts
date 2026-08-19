import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MemberRepo } from 'src/shared/database/repositories';
import { CreateMemberDTO } from './dtos';
import { Helper } from 'src/lib/helpers';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    private readonly memberRepo: MemberRepo,
    private readonly helper: Helper,
  ) {}

  async createMember(inviterId: string, teamId: string, data: CreateMemberDTO) {
    try {
      const password = this.helper.generatePassword();
      const hashedPassword = await this.helper.hash(password);
      const user = await this.memberRepo.createUser({
        ...data,
        password: hashedPassword,
      });

      const memberObj: any = {};

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
        .then(() => this.logger.log('member added to team successfully'));

      /*
        send email to newly added member 
        @Params: password, login link, 
    */

      return membership;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async removeMember(membershipId: string, teamId: string) {
    try {
      const checkMember = await this.memberRepo.findOne({
        id: membershipId,
        teamId,
      });
      if (!checkMember)
        throw new NotFoundException("this user isn't a member of this team");

      const member = await this.memberRepo.delete(membershipId);

      // send email to user

      return member;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}
