import sqsConfig from '../../config/sqs';
import getClientService from '../../services/SQSService/getClient';
import isEmpty from '../isEmpty';
import validateFields from '../validateFields';
const getClient = ({ singletonConn = 'default', region = '' } = {}) => {
  region = isEmpty(region) ? sqsConfig.region : region;
  const input = validateFields({ singletonConn, region }, [
    { key: 'singletonConn', type: 'string', required: true },
    { key: 'region', type: 'string', required: true },
  ]);
  return getClientService({
    singletonConn: input.singletonConn,
    region: input.region,
  });
};
export default getClient;
