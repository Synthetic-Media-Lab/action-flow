import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger
} from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name)

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest()

        this.logger.debug(`Request body: ${JSON.stringify(request.body)}`)

        return next.handle()
    }
}
