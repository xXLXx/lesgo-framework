import config from '../../config/aws';
import getUploadSignedUrlService from '../../services/S3Service/getUploadSignedUrl';

const getUploadSignedUrl = (
  key: string,
  bucket: string,
  {
    singletonConn = 'default',
    region = '',
    metadata = undefined,
    expiresIn = 600,
  }: {
    singletonConn?: string;
    region?: string;
    metadata?: Record<string, string>;
    expiresIn?: number;
  } = {
    singletonConn: 'default',
    region: '',
    expiresIn: 600,
  }
) => {
  const configRegion = config.region;

  return getUploadSignedUrlService(key, bucket, {
    singletonConn,
    region: region !== '' ? region : configRegion,
    metadata,
    expiresIn,
  });
};

export default getUploadSignedUrl;
