# bitmex-plus

This package provides several helper methods for the [REST](https://www.bitmex.com/app/restAPI) and [WebSocket](https://www.bitmex.com/app/wsAPI) BitMEX APIs. You can think of it as a lightweight, [easy to audit](https://github.com/ccxt/ccxt/issues/943), combination of `ccxt` (which it doesn't use) and the official `bitmex-realtime-api`.

Features:

* minimal dependencies
* both authenticated and unauthenticated REST requests
* real-time WebSocket API wrappers around the official [bitmex-realtime-api](https://github.com/BitMEX/api-connectors/tree/master/official-ws/nodejs) library

The module works in Node, but not in the browser, because BitMEX doesn't serve CORS headers on the API.

# Usage

    npm install bitmex-plus

See the [bitmex-realtime-api](https://github.com/BitMEX/api-connectors/tree/master/official-ws/nodejs#new-bitmexclientobject-options) documentation for parameters.

```js
import { BitMexPlus } from 'bitmex-plus';

const bitmex = new BitMexPlus({
  apiKeyID: '...',
  apiKeySecret: '...',
});
```

The API key constructor parameters are optional. You only need to specify them if you make authenticated requests.

The [bitmex-realtime-api](https://github.com/BitMEX/api-connectors/tree/master/official-ws/nodejs) library that this module wraps will automatically connect to the web socket, so your script won't exit until all listeners are removed. If you only make REST requests, or when you're done with the WebSocket API, you can simply call `process.exit(0)`.
 

# Methods

## makeRequest(verb, endpoint, data)

Make a GET/PUT/POST/DELETE request to the REST API. See the [API explorer](https://www.bitmex.com/api/explorer/) for available endpoints and parameters.

Sample unauthenticated request to get the bid/ask [over the last minute](https://www.bitmex.com/api/explorer/#!/Quote/Quote_getBucketed):

```js
import { BitMexPlus } from 'bitmex-plus';

const bitmex = new BitMexPlus();

(async function () => {
  const [bucket] = (await bitmex.makeRequest('GET', 'quote/bucketed', {
    binSize: '1m',
    symbol: 'XBTUSD',
    reverse: true,
    count: 1,
    columns: ['bidPrice', 'askPrice'],
  }));
  console.log(bucket);
}());

process.exit(0);
```

Authenticated request to get your XBTUSD position:

```js
import { BitMexPlus } from 'bitmex-plus';

const bitmex = new BitMexPlus({
  // Get your API key at https://www.bitmex.com/app/apiKeys
  apiKeyID: 'REPLACE_ME',
  apiKeySecret: 'REPLACE_ME',
});

(async function () {
  const [pos] = (await bitmex.makeRequest('GET', 'position', {
    filter: { symbol: 'XBTUSD' },  // remove to get all positions
    // limit returned columns, except for several that are always returned:
    // account, symbol, currency, timestamp, simpleQty and markPrice
    columns: ['currentQty', 'liquidationPrice'],   }));
  console.log(pos);
}());

process.exit(0)
```

## monitorStream(symbol, table, callback)

[Add a stream](https://github.com/BitMEX/api-connectors/tree/master/official-ws/nodejs#clientaddstreamstring-symbol-string-tablename-function-callback) and call the callback for each new data item added to the table (e.g. each new trade). This provides more granular processing than the official library, which calls the callback for chunks of data of unspecified length. The callback is passed a `data` parameter (e.g. a trade object).

Note that if you monitor the `orderBookL2` stream, the callback will be called only once, without any parameters. This is because with order book entries, you need to deal with the entire data array returned by [getData()](https://github.com/BitMEX/api-connectors/tree/master/official-ws/nodejs#clientgetdatastring-symbol-string-tablename), since orders might have been removed, changed, or inserted.

```js
bitmex.monitorStream('XBTUSD', 'trade', data => console.log(data.price));
```

# LICENSE

MIT. Copyright 2018 [Ben Bomper](https://github.com/bomper).
