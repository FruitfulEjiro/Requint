import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      payload: {
        accessToken: string;
        refreshToken: string;
      };
    }
  }

  namespace PrismaJson {
    type ImageDto = {
      secure_url?: string;
      public_id?: string;
    };
  }
}
