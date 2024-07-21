var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { logger, validateFields } from '../../utils';
import { LesgoException } from '../../exceptions';
import getClient from './getClient';
const FILE = 'lesgo.services.RDSAuroraMySQLService.query';
const query = (sql, opts) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const input = validateFields(Object.assign({ query }, opts), [
      { key: 'sql', type: 'string', required: true },
      { key: 'dbCredentialsSecretId', type: 'string', required: false },
      { key: 'databaseName', type: 'string', required: false },
      { key: 'singletonConn', type: 'string', required: true },
      { key: 'region', type: 'string', required: true },
    ]);
    const connection = yield getClient(input);
    try {
      const [results, fields] = yield connection.query(input.sql);
      logger.debug(`${FILE}::RECEIVED_RESPONSE`, { results, fields });
      return { results, fields };
    } catch (err) {
      throw new LesgoException('Failed to query', `${FILE}::QUERY_ERROR`, 500, {
        err,
        query,
        opts,
      });
    }
  });
export default query;
