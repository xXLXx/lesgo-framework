import { logger, validateFields } from '../../utils';
import { ClientOptions } from '../../types/aws';
import { LesgoException } from '../../exceptions';
import getElastiCacheRedisClient from './getElastiCacheRedisClient';

const FILE = 'lesgo.services.ElastiCacheRedis.setRedisCache';

export interface SetRedisCacheOptions {
  EX?: number; // Expiry time in seconds
}

/**
 * Sets a value in Redis cache.
 *
 * @param key - The key to set in the cache.
 * @param value - The value to set in the cache.
 * @param opts - Optional settings for cache expiration and other options.
 * @param clientOpts - Optional settings for the Redis client.
 * @returns A Promise that resolves to the response from Redis.
 * @throws {LesgoException} If there is an error setting the cache.
 */
const setRedisCache = async (
  key: string,
  value: any,
  opts?: SetRedisCacheOptions,
  clientOpts?: ClientOptions
) => {
  const input = validateFields({ key, value }, [
    { key: 'key', type: 'string', required: true },
    { key: 'value', type: 'any', required: true },
  ]);

  opts = {
    ...opts,
    EX: opts?.EX ?? 300, // defaults to 5 min expiry if not defined
  };

  const client = await getElastiCacheRedisClient(clientOpts);

  input.value =
    typeof input.value === 'object' ? JSON.stringify(input.value) : input.value;

  try {
    // @ts-ignore
    const resp = await client.set(input.key, input.value, 'EX', opts.EX);
    logger.debug(`${FILE}::RECEIVED_RESPONSE`, { resp, input, value });

    return resp;
  } catch (err) {
    throw new LesgoException(
      'Failed to set redis cache',
      `${FILE}::SET_ERROR`,
      500,
      {
        err,
        input,
        value,
        opts,
        clientOpts,
      }
    );
  }
};

export default setRedisCache;
