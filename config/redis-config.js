import * as redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient();

redisClient.connect();

redisClient.on('ready', () => {
  console.log('redis is ready');
});

redisClient.on('error', (err) => {
  console.log(err);
});

export default redisClient;
