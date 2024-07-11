import { GetObjectCommand } from '@aws-sdk/client-s3';
import getObject from '../getObject';
import getClient from '../getClient';
import { LesgoException } from '../../../exceptions';

jest.mock('../getClient', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockImplementation(command => {
      if (command instanceof GetObjectCommand) {
        return Promise.resolve(command);
      }

      return Promise.reject(new Error('Command not mocked'));
    }),
  }));
});

describe('getObject', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if key is empty', async () => {
    const key = '';
    const bucket = 'testBucket';
    const options = {
      region: 'us-west-2',
      singletonConn: 'default',
    };

    await expect(getObject(key, bucket, options)).rejects.toThrow(
      new LesgoException(
        'Key is undefined',
        'lesgo.services.S3Service.getObject::KEY_UNDEFINED'
      )
    );
  });

  it('should throw an error if bucket is undefined', async () => {
    const key = 'testKey';
    const bucket = '';
    const options = {
      region: 'us-west-2',
      singletonConn: 'default',
    };

    await expect(getObject(key, bucket, options)).rejects.toThrow(
      new LesgoException(
        'Bucket is undefined',
        'lesgo.services.S3Service.getObject::BUCKET_UNDEFINED'
      )
    );
  });

  it('should call getClient with the correct region and singletonConn', async () => {
    const key = 'testKey';
    const bucket = 'testBucket';
    const options = {
      region: 'us-west-2',
      singletonConn: 'default',
    };

    const object = await getObject(key, bucket, options);

    expect(getClient).toHaveBeenCalledWith({
      region: options.region,
      singletonConn: options.singletonConn,
    });
  });

  it('should call GetObjectCommand with the correct bucket and key', async () => {
    const key = 'testKey';
    const bucket = 'testBucket';
    const options = {
      region: 'us-west-2',
      singletonConn: 'default',
    };

    await expect(getObject(key, bucket, options)).resolves.toMatchObject({
      input: {
        Bucket: bucket,
        Key: key,
      },
    });
  });

  it('should throw a LesgoException if an error occurs', async () => {
    const key = 'testKey';
    const bucket = 'testBucket';
    const options = {
      region: 'us-west-2',
      singletonConn: 'default',
    };
    const error = new Error('Test error');

    (getClient as jest.Mock).mockReturnValueOnce({
      send: jest.fn().mockRejectedValueOnce(error),
    });

    await expect(getObject(key, bucket, options)).rejects.toThrow(
      new LesgoException(
        'Error occurred getting object from S3 bucket',
        'lesgo.services.S3Service.getObject::ERROR',
        500,
        {
          error,
          bucket,
          key,
        }
      )
    );
  });
});
