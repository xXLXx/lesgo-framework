import { LesgoException } from '../../exceptions';
import config from '../../config/aws';
import deleteMessageService from '../../services/SQSService/deleteMessage';
import isEmpty from '../isEmpty';
import validateFields from '../validateFields';
import logger from '../logger';
const FILE = 'lesgo.utils.sqs.deleteMessage';
export const deleteMessage = (queue, receiptHandle, opts = {}) => {
  opts.region = isEmpty(opts.region) ? config.sqs.region : opts.region;
  opts.singletonConn = isEmpty(opts.singletonConn)
    ? 'default'
    : opts.singletonConn;
  const input = validateFields(
    Object.assign(Object.assign({}, opts), { receiptHandle }),
    [
      { key: 'region', type: 'string', required: true },
      { key: 'singletonConn', type: 'string', required: true },
      { key: 'receiptHandle', type: 'string', required: true },
    ]
  );
  logger.debug(`${FILE}::VALIDATED_INPUT`, {
    input,
  });
  if (typeof queue === 'string') {
    const configQueue = config.sqs.queues.find(q => q.alias === queue);
    if (!configQueue) {
      throw new LesgoException(
        `Queue with alias ${queue} not found in config`,
        `${FILE}::QUEUE_NOT_FOUND`,
        500,
        {
          queue,
        }
      );
    }
    queue = configQueue;
  }
  return deleteMessageService(queue, receiptHandle, {
    region: input.region,
    singletonConn: input.singletonConn,
  });
};
export default deleteMessage;
