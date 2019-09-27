import logger from '../utils/logger';

export const normalizeRequest = opts => {
  const { headers, qs, body } = opts;
  let input = null;

  if (!headers && qs === null) return input;

  if (qs !== null) input = qs;

  const contentType = headers['Content-Type'] || headers['content-type'];

  if (!contentType) return input;

  /* istanbul ignore else */
  if (contentType.startsWith('application/json')) {
    try {
      input = { ...input, ...JSON.parse(body) };
    } catch (err) {
      throw new Error(
        'Content type defined as JSON but an invalid JSON was provided'
      );
    }
  }

  return input;
};

export const normalizeHttpRequestBeforeHandler = (handler, next) => {
  const options = {
    headers: handler.event.headers,
    qs: handler.event.queryStringParameters,
    body: handler.event.body,
  };

  // eslint-disable-next-line no-param-reassign
  handler.event.input = normalizeRequest(options);

  // attach additional http request metadata in the logger
  logger.withMeta = logger.child({
    path: handler.event.path,
    queryStringParameters: options.qs,
    body: options.body,
    httpMethod: handler.event.httpMethod,
    requestId: handler.event.requestContext
      ? handler.event.requestContext.requestId
      : null,
  });

  /* istanbul ignore next */
  next();
};

/**
 * Normalizes handler.event.body and handler.event.queryStringParameters
 * as handler.event.input Object
 */
const normalizeHttpRequest /* istanbul ignore next */ = () => {
  return {
    before: (handler, next) => normalizeHttpRequestBeforeHandler(handler, next),
  };
};

export default normalizeHttpRequest;