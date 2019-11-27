import config from 'Config/elasticsearch'; // eslint-disable-line import/no-unresolved
import ElasticsearchService from '../services/ElasticsearchService';
import LesgoException from '../exceptions/LesgoException';

/**
 * Reusable instance
 */
const singleton = [];

/**
 * Instantiate the ElasticSearch Service
 *
 * @param {object} conn The connection options
 * @return {object} Returns the driver
 */
const es = (conn = null) => {
  if (singleton[conn]) {
    return singleton[conn];
  }

  const instance = new ElasticsearchService({
    ...config.adapters[conn || config.default],
  });

  singleton[conn] = instance;

  return instance;
};

/**
 * Create ES index
 *
 * @param {object} options The index options
 * @param {string} indexName Name of the index
 */
const createIndex = async (options, indexName = null) => {
  try {
    return await es().createIndices(options, indexName);
  } catch (err) {
    throw new LesgoException(
      err.message,
      'ELASTICSEARCH_INDEX_CREATE_EXCEPTION',
      500,
      err
    );
  }
};

export default {
  es,
  createIndex,
};
