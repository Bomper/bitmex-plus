import BitMEXWs from 'bitmex-realtime-api';
import crypto from 'crypto';
import qs from 'qs';
import fetch from 'node-fetch';

export class BitMexPlus extends BitMEXWs {
  constructor(options) {
    super(options);
    this.options = options;
  }

  /**
   * Subscribe to a stream and call a callback for every new item
   * @param {String} [symbol='XBTUSD']
   * @param {String} tableName - e.g. 'trade', 'quote', 'orderBookL2', 'instrument' etc.
   * @param {Function} callback(data)
   */
  monitorStream(symbol = 'XBTUSD', tableName, callback) {
    let lastItem;
    this.addStream(symbol, tableName, data => {
      if (!data.length) return;
      if (tableName === 'orderBookL2')
        callback();  // callback must deal with the entire data array returned by getData(), no need to pass it anything
      else
        // On the first piece(s) of data, lastItem is undefined so lastIndexOf + 1 === 0.
        // Same if maxTableLen was too small (the lastItem would be splice'd out).
        for (let i = data.lastIndexOf(lastItem) + 1; i < data.length; i++)
          callback(data[i]);
      lastItem = data[data.length - 1];
    });
  }

  /**
   * Send a request to the BitMEX REST API. See https://www.bitmex.com/api/explorer/.
   * @param {String} verb - GET/PUT/POST/DELETE
   * @param {String} endpoint - e.g. `/user/margin`
   * @param {Object} data - JSON
   * @returns {Promise<Response>} - the [result of fetch()](https://github.com/bitinn/node-fetch#class-response)
   */
  makeRequest(verb, endpoint, data = {}) {
    const apiRoot = '/api/v1/';

    let query = '', postBody = '';
    if (verb === 'GET')
      query = '?' + qs.stringify(data);
    else
      // Pre-compute the postBody so we can be sure that we're using *exactly* the same body in the request
      // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
      postBody = JSON.stringify(data);

    const headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
      // This example uses the 'expires' scheme. You can also use the 'nonce' scheme.
      // See https://www.bitmex.com/app/apiKeysUsage for more details.
    };

    if (this.options.apiKeyID && this.options.apiKeySecret) {
      const expires = new Date().getTime() + (60 * 1000);  // 1 min in the future
      const signature = crypto.createHmac('sha256', this.options.apiKeySecret)
        .update(verb + apiRoot + endpoint + query + expires + postBody).digest('hex');
      headers['api-expires'] = expires;
      headers['api-key'] = this.options.apiKeyID;
      headers['api-signature'] = signature;
    }

    const requestOptions = {
      method: verb,
      headers,
    };
    if (verb !== 'GET') requestOptions.body = postBody;  // GET/HEAD requests can't have body

    const url = 'https://www.bitmex.com' + apiRoot + endpoint + query;

    return fetch(url, requestOptions).then(response => response.json()).then(
      response => {
        if ('error' in response)
          throw new Error(response.error.message);
        return response;
      }, error => {
        throw new Error(error);
      },
    );
  }
}
