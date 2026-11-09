import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'

// Attaches req.user when a valid token is present, but never blocks the request.
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtStrategy: JwtStrategy) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const authHeader = req.headers['authorization'] as string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      try {
        req.user = this.jwtStrategy.verify(authHeader.slice(7))
      } catch {
        // ignore invalid token, treat as anonymous
      }
    }
    return true
  }
}
