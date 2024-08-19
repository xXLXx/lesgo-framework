import { Client } from '@opensearch-project/opensearch';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import createAwsConnector from './createAwsConnector';
import logger from '../../utils/logger';
import isEmpty from '../../utils/isEmpty';

const FILE = 'services/OpenSearchService/getClient';

let singleton = {};

const getClient = async ({ region, host }, singletonConn) => {
  if (!isEmpty(singleton[singletonConn])) {
    logger.debug(`${FILE}::REUSE_CLIENT_SINGLETON`, {
      client: singleton[singletonConn],
      singletonConn,
      singleton
    });
    return singleton[singletonConn];
  }

  const credentials = await defaultProvider()();
  logger.debug(`${FILE}::CREDENTIALS`, { credentials });

  const awsConnector = createAwsConnector(credentials, region);
  const client = new Client({
    ...awsConnector,
    node: host,
  });

  singleton[singletonConn] = client;

  logger.debug(`${FILE}::NEW_CLIENT_SINGLETON`, {
    client: singleton[singletonConn],
  });
  return client;
};

export const disconnect = async (singletonConn) => {
  logger.debug(`${FILE}::CLOSING_ES_CONNECTIONS`, {
    singletonConn,
    singleton
  });

  if (!singletonConn) {
    await Promise.all(
      Object.values(singleton).map(async client =>
        client.close()
      )
    );

    singleton = {};
  } else {
    await singleton[singletonConn].close();

    delete singleton[singletonConn];
  }

  logger.debug(`${FILE}::CLOSED_ES_CONNECTIONS`, {
    singletonConn,
    singleton
  });
};

export default getClient;
