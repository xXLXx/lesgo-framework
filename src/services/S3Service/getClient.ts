import { S3Client } from '@aws-sdk/client-s3';
import { logger, isEmpty, validateFields } from '../../utils';
import s3Config from '../../config/s3';

const FILE = 'lesgo.services.S3Service.getClient';

interface Singleton {
  [key: string]: S3Client;
}

export interface GetClientOptions {
  region?: string;
  singletonConn?: string;
}

const singleton: Singleton = {};

const getClient = (clientOpts: GetClientOptions = {}) => {
  const options = validateFields(clientOpts, [
    { key: 'region', type: 'string', required: false },
    { key: 'singletonConn', type: 'string', required: false },
  ]) as GetClientOptions;

  const region = options.region || s3Config.region;
  const singletonConn = options.singletonConn || 'default';

  if (!isEmpty(singleton[singletonConn])) {
    logger.debug(`${FILE}::REUSE_CLIENT_SINGLETON`, {
      client: singleton[singletonConn],
      region,
    });

    return singleton[singletonConn];
  }

  const client = new S3Client({ region });
  logger.debug(`${FILE}::NEW_CLIENT`, {
    client,
    region,
  });

  singleton[singletonConn] = client;

  return client;
};

export default getClient;
