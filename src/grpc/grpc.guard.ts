import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ZitadelAuthGuard } from 'src/rest/rest.guard';

@Injectable()
export class ZitadelGrpcAuthGuard extends ZitadelAuthGuard {
  getRequest(context: ExecutionContext) {
    const metadata = context.switchToRpc().getContext();
    return {
      headers: metadata.getMap(),
    };
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    context.switchToRpc().getContext().set('user', user);
    return super.handleRequest(err, user, info, context, status);
  }
}

@Injectable()
export class OptionalZitadelGrpcAuthGuard extends ZitadelGrpcAuthGuard {
  private readonly logger = new Logger(OptionalZitadelGrpcAuthGuard.name);

  handleRequest<TUser = any>(
    err: any,
    user: any,
    _: any,
    context: ExecutionContext,
  ): TUser {
    context.switchToRpc().getContext().set('user', user);
    if (err) {
      this.logger.error(err);
      return null as any;
    }
    return user;
  }
}
