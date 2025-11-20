import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ZitadelIntrospectionOptions,
  ZitadelIntrospectionStrategy,
} from 'passport-zitadel';

@Injectable()
export class ZitadelAuthStrategy extends PassportStrategy(
  ZitadelIntrospectionStrategy,
) {
  constructor(config: ConfigService) {
    super({
      authority: config.getOrThrow('AUTH_ISSUER'),
      authorization: {
        type: 'jwt-profile',
        profile: JSON.parse(config.getOrThrow('AUTH_JWT_KEY')),
      },
    } as ZitadelIntrospectionOptions);
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
