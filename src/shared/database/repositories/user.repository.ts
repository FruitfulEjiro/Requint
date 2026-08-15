import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { Prisma, User } from "generated/prisma/client";
import { PrismaService } from "../prisma.service";

@Injectable()
export class UserRepo extends BaseRepository<
    User,
    Prisma.UserCreateInput,
    Prisma.UserWhereInput,
    Prisma.UserUpdateInput
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.user)
    }

    async findByEmail(email: string) {
        return this.model.findFirst({ where: { email } })
    }
}