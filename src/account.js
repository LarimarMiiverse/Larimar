const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

const definition = protoLoader.loadSync(path.join(__dirname, 'protos', 'account.proto'), {
  longs: Number,
  defaults: true
});
const { AccountService } = grpc.loadPackageDefinition(definition).account.v2;

const client = new AccountService(
  `${process.env.GRPC_ACCOUNT_HOST}:${process.env.GRPC_ACCOUNT_PORT}`,
  grpc.credentials.createInsecure()
);

// Revivetendo's account service is the one that issues console service tokens,
// so it is also the one that can read them. Larimar never sees Juxt here.
function exchangeServiceToken(token) {
  const metadata = new grpc.Metadata();
  metadata.set('x-api-key', process.env.GRPC_ACCOUNT_API_KEY);

  return new Promise((resolve) => {
    client.ExchangeIndependentServiceTokenForUserData({ token }, metadata, { deadline: Date.now() + 5000 }, (err, res) => {
      if (err || !res || !res.pnid || !res.pnid.pid) {
        if (err) logger.error('Service token rejected: ' + err.message);
        return resolve(null);
      }

      resolve({
        pid: res.pnid.pid,
        username: res.pnid.username,
        miiName: res.pnid.mii ? res.pnid.mii.name : '',
        country: res.pnid.country,
        language: res.pnid.language,
        // 1 = Wii U, 2 = 3DS
        systemType: res.token_info ? res.token_info.system_type : 0
      });
    });
  });
}

module.exports = { exchangeServiceToken };
