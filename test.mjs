/* eslint-disable no-console */
import { BitMexPlus } from '.';

(async function test() {
  const bitmex = new BitMexPlus({
    // Get your API key at https://www.bitmex.com/app/apiKeys
    apiKeyID: '',  // REPLACE ME
    apiKeySecret: '',  // REPLACE ME
  });

  if (bitmex.options.apiKeyID) {
    const pos = (await bitmex.makeRequest('GET', 'position', {
      filter: { symbol: 'XBTUSD' },
      columns: ['currentQty', 'liquidationPrice'],
    }));
    console.log(pos);
  }

  const [bucket] = (await bitmex.makeRequest('GET', 'quote/bucketed', {
    binSize: '1m',
    symbol: 'XBTUSD',
    reverse: true,
    count: 1,
    columns: ['bidPrice', 'askPrice'],
  }));
  console.log(bucket);

  bitmex.monitorStream('XBTUSD', 'trade', data => console.log(data.price));

  setTimeout(() => { process.exit(0); }, 5000);

}());
