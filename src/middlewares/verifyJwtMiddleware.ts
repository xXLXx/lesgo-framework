import middy from '@middy/core';
import { verify } from '../utils/jwt';
import logger from '../utils/logger';
import { LesgoException } from '../exceptions';

const FILE = 'lesgo.middlewares.verifyJwtMiddleware';

export interface VerifyJwtOptions {
  keyid?: string;
  algorithm?: string;
  validateClaims?: boolean;
  issuer?: string;
  audience?: string;
  secret?: string;
}

const verifyJwtMiddleware = (options: VerifyJwtOptions = {}) => {
  const verifyJwt = (token: string, opts: VerifyJwtOptions) => {
    try {
      const decoded = verify(token, { secret: opts.secret, opts });
      return decoded;
    } catch (error: any) {
      throw new LesgoException(
        'Error verifying JWT',
        `${FILE}::ERROR_VERIFYING_JWT`,
        401,
        error
      );
    }
  };

  const verifyJwtMiddlewareBefore = (request: middy.Request) => {
    logger.debug(`${FILE}::JWT_TO_VERIFY`, { request, options });
    const token = request.event.headers.authorization;

    if (!token) {
      throw new LesgoException(
        'No token provided',
        `${FILE}::NO_TOKEN_PROVIDED`,
        401
      );
    }

    const decoded = verifyJwt(token, options);
    logger.debug(`${FILE}::JWT_VERIFIED`, { decoded });

    request.event.jwt = decoded;
  };

  return {
    before: verifyJwtMiddlewareBefore,
  };
};

export default verifyJwtMiddleware;
