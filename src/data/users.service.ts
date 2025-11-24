import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createAccessTokenInterceptor,
  createUserClient,
  UserServiceClient,
} from '@zitadel/node/dist/api';
import {
  Type,
  UserFieldName,
} from '@zitadel/node/dist/api/generated/zitadel/user';
import { User } from '@zitadel/node/dist/api/generated/zitadel/user/v2beta/user';

export type ZitadelUser = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

type HumanUser = User;

const mapUser = (user: HumanUser): ZitadelUser => ({
  id: user.userId,
  userName: user.username,
  firstName: user.human?.profile?.givenName ?? 'firstName',
  lastName: user.human?.profile?.familyName ?? 'lastName',
  avatarUrl: user.human?.profile?.avatarUrl ?? 'avatarUrl',
});

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

@Injectable()
export class UsersService {
  private readonly userClient: UserServiceClient;

  constructor(config: ConfigService) {
    this.userClient = createUserClient(
      config.getOrThrow('ZITADEL_URL'),
      createAccessTokenInterceptor(config.getOrThrow('ZITADEL_PAT')),
    );
  }

  async get(id: string) {
    const { result } = await this.userClient.listUsers({
      queries: [{ inUserIdsQuery: { userIds: [id] } }],
    });
    const user = result[0];
    if (!user || !user.human) {
      throw new Error('User not found');
    }
    return mapUser(user);
  }

  async list(offset: number, limit: number) {
    const { result, details } = await this.userClient.listUsers({
      queries: [{ typeQuery: { type: Type.TYPE_HUMAN } }],
      query: {
        limit: clamp(limit, 1, 1000),
        offset,
        asc: true,
      },
      sortingColumn: UserFieldName.USER_FIELD_NAME_USER_NAME,
    });
    return {
      users: result.map(mapUser),
      count: details?.totalResult.toNumber() ?? 0,
    };
  }
}
