import { verifyBasicAuthBeforeHandler } from './basicAuthMiddleware';
import { verifyJwtMiddlewareBeforeHandler } from './verifyJwtMiddleware';
import { errorHttpResponseAfterHandler } from './errorHttpResponseMiddleware';

const blacklistMode = opts => {
  if (opts && typeof opts.blacklistMode !== 'undefined') {
    return !!opts.blacklistMode;
  }

  return true;
};

export const serverAuthBeforeHandler = (handler, next, opts) => {
  try {
    return verifyBasicAuthBeforeHandler(handler, next, opts);
  } catch (e) {
    if (
      e.code !==
        `Middlewares/basicAuthMiddleware::AUTH_INVALID_AUTHORIZATION_TYPE` &&
      e.code !==
        `Middlewares/basicAuthMiddleware::AUTHORIZATION_HEADER_NOT_FOUND`
    )
      throw e;
  }

  try {
    return verifyJwtMiddlewareBeforeHandler(handler, next, opts);
  } catch (e) {
    if (!blacklistMode(opts) && e.code !== 'JWT_MISSING_AUTHORIZATION_HEADER')
      throw e;
    else throw e;
  }
};

/* istanbul ignore next */
const serverAuthMiddleware = opts => {
  return {
    before: (handler, next) => serverAuthBeforeHandler(handler, next, opts),
    onError: (handler, next) => errorHttpResponseAfterHandler(handler, next),
  };
};

export default serverAuthMiddleware;
