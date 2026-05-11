import { logger } from '../../../utils';
import disconnectElastiCacheRedisClient from '../disconnectElastiCacheRedisClient';
import { singleton } from '../getElastiCacheRedisClient';

jest.mock('../../../utils/logger');

describe('disconnectElastiCacheRedisClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(singleton).forEach(key => delete singleton[key]);
  });

  it('should log and return early when there are no connections', async () => {
    await disconnectElastiCacheRedisClient();

    expect(logger.debug).toHaveBeenCalledWith(
      'lesgo.services.ElastiCacheRedisService.disconnectElastiCacheRedisClient::NO_CONNECTIONS_TO_DISCONNECT'
    );
    expect(logger.debug).toHaveBeenCalledTimes(1);
  });

  it('should quit all connections and delete them from singleton', async () => {
    const mockQuit1 = jest.fn().mockResolvedValue('OK');
    const mockQuit2 = jest.fn().mockResolvedValue('OK');
    singleton['conn1'] = { quit: mockQuit1 } as any;
    singleton['conn2'] = { quit: mockQuit2 } as any;

    await disconnectElastiCacheRedisClient();

    expect(mockQuit1).toHaveBeenCalledTimes(1);
    expect(mockQuit2).toHaveBeenCalledTimes(1);
    expect(singleton['conn1']).toBeUndefined();
    expect(singleton['conn2']).toBeUndefined();
    expect(logger.debug).toHaveBeenCalledWith(
      'lesgo.services.ElastiCacheRedisService.disconnectElastiCacheRedisClient::COMPLETED',
      { singletonConn: 'conn1' }
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'lesgo.services.ElastiCacheRedisService.disconnectElastiCacheRedisClient::COMPLETED',
      { singletonConn: 'conn2' }
    );
  });

  it('should log error and continue when a quit call fails', async () => {
    const mockError = new Error('quit failed');
    const mockQuit1 = jest.fn().mockRejectedValue(mockError);
    const mockQuit2 = jest.fn().mockResolvedValue('OK');
    singleton['conn1'] = { quit: mockQuit1 } as any;
    singleton['conn2'] = { quit: mockQuit2 } as any;

    await disconnectElastiCacheRedisClient();

    expect(mockQuit1).toHaveBeenCalledTimes(1);
    expect(mockQuit2).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'lesgo.services.ElastiCacheRedisService.disconnectElastiCacheRedisClient::ERROR',
      { singletonConn: 'conn1', err: mockError }
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'lesgo.services.ElastiCacheRedisService.disconnectElastiCacheRedisClient::COMPLETED',
      { singletonConn: 'conn2' }
    );
  });

  it('should run all quit calls concurrently', async () => {
    const order: string[] = [];
    singleton['conn1'] = {
      quit: jest.fn().mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => {
              order.push('conn1');
              resolve('OK');
            }, 20)
          )
      ),
    } as any;
    singleton['conn2'] = {
      quit: jest.fn().mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => {
              order.push('conn2');
              resolve('OK');
            }, 10)
          )
      ),
    } as any;

    await disconnectElastiCacheRedisClient();

    // conn2 resolves first (10ms) then conn1 (20ms), proving concurrent execution
    expect(order).toEqual(['conn2', 'conn1']);
  });
});
