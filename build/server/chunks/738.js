exports.id = 738;
exports.ids = [738];
exports.modules = {

/***/ 7597:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({ value: true });

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var V3_URL = 'https://js.stripe.com/v3';
var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
var EXISTING_SCRIPT_MESSAGE = 'loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used';
var findScript = function findScript() {
  var scripts = document.querySelectorAll("script[src^=\"".concat(V3_URL, "\"]"));

  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];

    if (!V3_URL_REGEX.test(script.src)) {
      continue;
    }

    return script;
  }

  return null;
};

var injectScript = function injectScript(params) {
  var queryString = params && !params.advancedFraudSignals ? '?advancedFraudSignals=false' : '';
  var script = document.createElement('script');
  script.src = "".concat(V3_URL).concat(queryString);
  var headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error('Expected document.body not to be null. Stripe.js requires a <body> element.');
  }

  headOrBody.appendChild(script);
  return script;
};

var registerWrapper = function registerWrapper(stripe, startTime) {
  if (!stripe || !stripe._registerWrapper) {
    return;
  }

  stripe._registerWrapper({
    name: 'stripe-js',
    version: "1.35.0",
    startTime: startTime
  });
};

var stripePromise = null;
var loadScript = function loadScript(params) {
  // Ensure that we only attempt to load Stripe.js at most once
  if (stripePromise !== null) {
    return stripePromise;
  }

  stripePromise = new Promise(function (resolve, reject) {
    if (typeof window === 'undefined') {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    if (window.Stripe && params) {
      console.warn(EXISTING_SCRIPT_MESSAGE);
    }

    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    try {
      var script = findScript();

      if (script && params) {
        console.warn(EXISTING_SCRIPT_MESSAGE);
      } else if (!script) {
        script = injectScript(params);
      }

      script.addEventListener('load', function () {
        if (window.Stripe) {
          resolve(window.Stripe);
        } else {
          reject(new Error('Stripe.js not available'));
        }
      });
      script.addEventListener('error', function () {
        reject(new Error('Failed to load Stripe.js'));
      });
    } catch (error) {
      reject(error);
      return;
    }
  });
  return stripePromise;
};
var initStripe = function initStripe(maybeStripe, args, startTime) {
  if (maybeStripe === null) {
    return null;
  }

  var stripe = maybeStripe.apply(undefined, args);
  registerWrapper(stripe, startTime);
  return stripe;
}; // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

var validateLoadParams = function validateLoadParams(params) {
  var errorMessage = "invalid load parameters; expected object of shape\n\n    {advancedFraudSignals: boolean}\n\nbut received\n\n    ".concat(JSON.stringify(params), "\n");

  if (params === null || _typeof(params) !== 'object') {
    throw new Error(errorMessage);
  }

  if (Object.keys(params).length === 1 && typeof params.advancedFraudSignals === 'boolean') {
    return params;
  }

  throw new Error(errorMessage);
};

var loadParams;
var loadStripeCalled = false;
var loadStripe = function loadStripe() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  loadStripeCalled = true;
  var startTime = Date.now();
  return loadScript(loadParams).then(function (maybeStripe) {
    return initStripe(maybeStripe, args, startTime);
  });
};

loadStripe.setLoadParameters = function (params) {
  if (loadStripeCalled) {
    throw new Error('You cannot change load parameters after calling loadStripe');
  }

  loadParams = validateLoadParams(params);
};

exports.loadStripe = loadStripe;


/***/ }),

/***/ 8156:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(7597);


/***/ }),

/***/ 9669:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(1609);

/***/ }),

/***/ 7970:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var settle = __webpack_require__(6026);
var buildFullPath = __webpack_require__(4097);
var buildURL = __webpack_require__(5327);
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var httpFollow = (__webpack_require__(6953).http);
var httpsFollow = (__webpack_require__(6953).https);
var url = __webpack_require__(7310);
var zlib = __webpack_require__(9796);
var VERSION = (__webpack_require__(7288).version);
var transitionalDefaults = __webpack_require__(7874);
var AxiosError = __webpack_require__(723);
var CanceledError = __webpack_require__(644);

var isHttps = /https:?/;

var supportedProtocols = [ 'http:', 'https:', 'file:' ];

/**
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} proxy
 * @param {string} location
 */
function setProxy(options, proxy, location) {
  options.hostname = proxy.host;
  options.host = proxy.host;
  options.port = proxy.port;
  options.path = location;

  // Basic proxy authorization
  if (proxy.auth) {
    var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
  }

  // If a proxy is used, any redirects must also pass through the proxy
  options.beforeRedirect = function beforeRedirect(redirection) {
    redirection.headers.host = redirection.host;
    setProxy(redirection, proxy, redirection.href);
  };
}

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }
    var resolve = function resolve(value) {
      done();
      resolvePromise(value);
    };
    var rejected = false;
    var reject = function reject(value) {
      done();
      rejected = true;
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;
    var headerNames = {};

    Object.keys(headers).forEach(function storeLowerName(name) {
      headerNames[name.toLowerCase()] = name;
    });

    // Set User-Agent (required by some servers)
    // See https://github.com/axios/axios/issues/69
    if ('user-agent' in headerNames) {
      // User-Agent is specified; handle case where no UA header is desired
      if (!headers[headerNames['user-agent']]) {
        delete headers[headerNames['user-agent']];
      }
      // Otherwise, use specified value
    } else {
      // Only set header if it hasn't been set in config
      headers['User-Agent'] = 'axios/' + VERSION;
    }

    // support for https://www.npmjs.com/package/form-data api
    if (utils.isFormData(data) && utils.isFunction(data.getHeaders)) {
      Object.assign(headers, data.getHeaders());
    } else if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(new AxiosError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }

      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError(
          'Request body larger than maxBodyLength limit',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }

      // Add Content-Length header if data exists
      if (!headerNames['content-length']) {
        headers['Content-Length'] = data.length;
      }
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || supportedProtocols[0];

    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError(
        'Unsupported protocol ' + protocol,
        AxiosError.ERR_BAD_REQUEST,
        config
      ));
    }

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth && headerNames.authorization) {
      delete headers[headerNames.authorization];
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    try {
      buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '');
    } catch (err) {
      var customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      reject(customErr);
    }

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }

        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port,
            protocol: parsedProxyUrl.protocol
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirect = config.beforeRedirect;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        var totalResponseBytes = 0;
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            // stream.destoy() emit aborted event before calling reject() on Node.js v16
            rejected = true;
            stream.destroy();
            reject(new AxiosError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              AxiosError.ERR_BAD_RESPONSE, config, lastRequest));
          }
        });

        stream.on('aborted', function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          stream.destroy();
          reject(new AxiosError(
            'maxContentLength size of ' + config.maxContentLength + ' exceeded',
            AxiosError.ERR_BAD_RESPONSE,
            config,
            lastRequest
          ));
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(AxiosError.from(err, null, config, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          try {
            var responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (config.responseType !== 'arraybuffer') {
              responseData = responseData.toString(config.responseEncoding);
              if (!config.responseEncoding || config.responseEncoding === 'utf8') {
                responseData = utils.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            reject(AxiosError.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      // @todo remove
      // if (req.aborted && err.code !== AxiosError.ERR_FR_TOO_MANY_REDIRECTS) return;
      reject(AxiosError.from(err, null, config, req));
    });

    // set tcp keep alive to prevent drop connection by peer
    req.on('socket', function handleRequestSocket(socket) {
      // default interval of sending ack packet is 1 minute
      socket.setKeepAlive(true, 1000 * 60);
    });

    // Handle request timeout
    if (config.timeout) {
      // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
      var timeout = parseInt(config.timeout, 10);

      if (isNaN(timeout)) {
        reject(new AxiosError(
          'error trying to parse `config.timeout` to int',
          AxiosError.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));

        return;
      }

      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(timeout, function handleRequestTimeout() {
        req.abort();
        var transitional = config.transitional || transitionalDefaults;
        reject(new AxiosError(
          'timeout of ' + timeout + 'ms exceeded',
          transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
          config,
          req
        ));
      });
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }


    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(AxiosError.from(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),

/***/ 5448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var settle = __webpack_require__(6026);
var cookies = __webpack_require__(4372);
var buildURL = __webpack_require__(5327);
var buildFullPath = __webpack_require__(4097);
var parseHeaders = __webpack_require__(4109);
var isURLSameOrigin = __webpack_require__(7985);
var transitionalDefaults = __webpack_require__(7874);
var AxiosError = __webpack_require__(723);
var CanceledError = __webpack_require__(644);
var parseProtocol = __webpack_require__(205);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    var protocol = parseProtocol(fullPath);

    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 1609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var bind = __webpack_require__(1849);
var Axios = __webpack_require__(321);
var mergeConfig = __webpack_require__(7185);
var defaults = __webpack_require__(5546);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = __webpack_require__(644);
axios.CancelToken = __webpack_require__(4972);
axios.isCancel = __webpack_require__(6502);
axios.VERSION = (__webpack_require__(7288).version);
axios.toFormData = __webpack_require__(7675);

// Expose AxiosError class
axios.AxiosError = __webpack_require__(723);

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(8713);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(6268);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ 4972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var CanceledError = __webpack_require__(644);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new CanceledError(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 644:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(723);
var utils = __webpack_require__(4867);

/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function CanceledError(message) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});

module.exports = CanceledError;


/***/ }),

/***/ 6502:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var buildURL = __webpack_require__(5327);
var InterceptorManager = __webpack_require__(782);
var dispatchRequest = __webpack_require__(3572);
var mergeConfig = __webpack_require__(7185);
var buildFullPath = __webpack_require__(4097);
var validator = __webpack_require__(4875);

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  var fullPath = buildFullPath(config.baseURL, config.url);
  return buildURL(fullPath, config.params, config.paramsSerializer);
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url: url,
        data: data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

module.exports = Axios;


/***/ }),

/***/ 723:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

var prototype = AxiosError.prototype;
var descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED'
// eslint-disable-next-line func-names
].forEach(function(code) {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = function(error, code, config, request, response, customProps) {
  var axiosError = Object.create(prototype);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

module.exports = AxiosError;


/***/ }),

/***/ 782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 4097:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(1793);
var combineURLs = __webpack_require__(7303);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 3572:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var transformData = __webpack_require__(8527);
var isCancel = __webpack_require__(6502);
var defaults = __webpack_require__(5546);
var CanceledError = __webpack_require__(644);

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 7185:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'beforeRedirect': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ 6026:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var AxiosError = __webpack_require__(723);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 8527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var defaults = __webpack_require__(5546);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ 3784:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// eslint-disable-next-line strict
module.exports = __webpack_require__(8941);


/***/ }),

/***/ 5546:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var normalizeHeaderName = __webpack_require__(6016);
var AxiosError = __webpack_require__(723);
var transitionalDefaults = __webpack_require__(7874);
var toFormData = __webpack_require__(7675);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(5448);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(7970);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    var isObjectPayload = utils.isObject(data);
    var contentType = headers && headers['Content-Type'];

    var isFileList;

    if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
      var _FormData = this.env && this.env.FormData;
      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
    } else if (isObjectPayload || contentType === 'application/json') {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: __webpack_require__(3784)
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 7874:
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ 7288:
/***/ ((module) => {

module.exports = {
  "version": "0.27.2"
};

/***/ }),

/***/ 1849:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 5327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 7303:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 4372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 1793:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 6268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ 7985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 6016:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 4109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 205:
/***/ ((module) => {

"use strict";


module.exports = function parseProtocol(url) {
  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
};


/***/ }),

/***/ 8713:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 7675:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Convert a data object to FormData
 * @param {Object} obj
 * @param {?Object} [formData]
 * @returns {Object}
 **/

function toFormData(obj, formData) {
  // eslint-disable-next-line no-param-reassign
  formData = formData || new FormData();

  var stack = [];

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  function build(data, parentKey) {
    if (utils.isPlainObject(data) || utils.isArray(data)) {
      if (stack.indexOf(data) !== -1) {
        throw Error('Circular reference detected in ' + parentKey);
      }

      stack.push(data);

      utils.forEach(data, function each(value, key) {
        if (utils.isUndefined(value)) return;
        var fullKey = parentKey ? parentKey + '.' + key : key;
        var arr;

        if (value && !parentKey && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
            // eslint-disable-next-line func-names
            arr.forEach(function(el) {
              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
            });
            return;
          }
        }

        build(value, fullKey);
      });

      stack.pop();
    } else {
      formData.append(parentKey, convertValue(data));
    }
  }

  build(obj);

  return formData;
}

module.exports = toFormData;


/***/ }),

/***/ 4875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(7288).version);
var AxiosError = __webpack_require__(723);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ 4867:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(1849);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

// eslint-disable-next-line func-names
var kindOf = (function(cache) {
  // eslint-disable-next-line func-names
  return function(thing) {
    var str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
})(Object.create(null));

function kindOfTest(type) {
  type = type.toLowerCase();
  return function isKindOf(thing) {
    return kindOf(thing) === type;
  };
}

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
var isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (kindOf(val) !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
var isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
var isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} thing The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(thing) {
  var pattern = '[object FormData]';
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) ||
    toString.call(thing) === pattern ||
    (isFunction(thing.toString) && thing.toString() === pattern)
  );
}

/**
 * Determine if a value is a URLSearchParams object
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
var isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 */

function inherits(constructor, superConstructor, props, descriptors) {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function} [filter]
 * @returns {Object}
 */

function toFlatObject(sourceObj, destObj, filter) {
  var props;
  var i;
  var prop;
  var merged = {};

  destObj = destObj || {};

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if (!merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/*
 * determines whether a string ends with the characters of a specified string
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 * @returns {boolean}
 */
function endsWith(str, searchString, position) {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  var lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object
 * @param {*} [thing]
 * @returns {Array}
 */
function toArray(thing) {
  if (!thing) return null;
  var i = thing.length;
  if (isUndefined(i)) return null;
  var arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

// eslint-disable-next-line func-names
var isTypedArray = (function(TypedArray) {
  // eslint-disable-next-line func-names
  return function(thing) {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM,
  inherits: inherits,
  toFlatObject: toFlatObject,
  kindOf: kindOf,
  kindOfTest: kindOfTest,
  endsWith: endsWith,
  toArray: toArray,
  isTypedArray: isTypedArray,
  isFileList: isFileList
};


/***/ }),

/***/ 9008:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(4957)


/***/ }),

/***/ 2367:
/***/ ((module) => {

"use strict";


/**
 * StripeError is the base error from which all other more specific Stripe errors derive.
 * Specifically for errors returned from Stripe's REST API.
 */
class StripeError extends Error {
  constructor(raw = {}) {
    super(raw.message);
    this.type = this.constructor.name;

    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = raw.message;

    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }

  /**
   * Helper factory which takes raw stripe errors and outputs wrapping instances
   */
  static generate(rawStripeError) {
    switch (rawStripeError.type) {
      case 'card_error':
        return new StripeCardError(rawStripeError);
      case 'invalid_request_error':
        return new StripeInvalidRequestError(rawStripeError);
      case 'api_error':
        return new StripeAPIError(rawStripeError);
      case 'authentication_error':
        return new StripeAuthenticationError(rawStripeError);
      case 'rate_limit_error':
        return new StripeRateLimitError(rawStripeError);
      case 'idempotency_error':
        return new StripeIdempotencyError(rawStripeError);
      case 'invalid_grant':
        return new StripeInvalidGrantError(rawStripeError);
      default:
        return new StripeUnknownError(rawStripeError);
    }
  }
}

// Specific Stripe Error types:

/**
 * CardError is raised when a user enters a card that can't be charged for
 * some reason.
 */
class StripeCardError extends StripeError {}

/**
 * InvalidRequestError is raised when a request is initiated with invalid
 * parameters.
 */
class StripeInvalidRequestError extends StripeError {}

/**
 * APIError is a generic error that may be raised in cases where none of the
 * other named errors cover the problem. It could also be raised in the case
 * that a new error has been introduced in the API, but this version of the
 * Node.JS SDK doesn't know how to handle it.
 */
class StripeAPIError extends StripeError {}

/**
 * AuthenticationError is raised when invalid credentials are used to connect
 * to Stripe's servers.
 */
class StripeAuthenticationError extends StripeError {}

/**
 * PermissionError is raised in cases where access was attempted on a resource
 * that wasn't allowed.
 */
class StripePermissionError extends StripeError {}

/**
 * RateLimitError is raised in cases where an account is putting too much load
 * on Stripe's API servers (usually by performing too many requests). Please
 * back off on request rate.
 */
class StripeRateLimitError extends StripeError {}

/**
 * StripeConnectionError is raised in the event that the SDK can't connect to
 * Stripe's servers. That can be for a variety of different reasons from a
 * downed network to a bad TLS certificate.
 */
class StripeConnectionError extends StripeError {}

/**
 * SignatureVerificationError is raised when the signature verification for a
 * webhook fails
 */
class StripeSignatureVerificationError extends StripeError {}

/**
 * IdempotencyError is raised in cases where an idempotency key was used
 * improperly.
 */
class StripeIdempotencyError extends StripeError {}

/**
 * InvalidGrantError is raised when a specified code doesn't exist, is
 * expired, has been used, or doesn't belong to you; a refresh token doesn't
 * exist, or doesn't belong to you; or if an API key's mode (live or test)
 * doesn't match the mode of a code or refresh token.
 */
class StripeInvalidGrantError extends StripeError {}

/**
 * Any other error from Stripe not specifically captured above
 */
class StripeUnknownError extends StripeError {}

module.exports.generate = StripeError.generate;
module.exports.StripeError = StripeError;
module.exports.StripeCardError = StripeCardError;
module.exports.StripeInvalidRequestError = StripeInvalidRequestError;
module.exports.StripeAPIError = StripeAPIError;
module.exports.StripeAuthenticationError = StripeAuthenticationError;
module.exports.StripePermissionError = StripePermissionError;
module.exports.StripeRateLimitError = StripeRateLimitError;
module.exports.StripeConnectionError = StripeConnectionError;
module.exports.StripeSignatureVerificationError = StripeSignatureVerificationError;
module.exports.StripeIdempotencyError = StripeIdempotencyError;
module.exports.StripeInvalidGrantError = StripeInvalidGrantError;
module.exports.StripeUnknownError = StripeUnknownError;


/***/ }),

/***/ 4371:
/***/ ((module) => {

"use strict";


// ResourceNamespace allows you to create nested resources, i.e. `stripe.issuing.cards`.
// It also works recursively, so you could do i.e. `stripe.billing.invoicing.pay`.

function ResourceNamespace(stripe, resources) {
  for (const name in resources) {
    const camelCaseName = name[0].toLowerCase() + name.substring(1);

    const resource = new resources[name](stripe);

    this[camelCaseName] = resource;
  }
}

module.exports = function(namespace, resources) {
  return function(stripe) {
    return new ResourceNamespace(stripe, resources);
  };
};

module.exports.ResourceNamespace = ResourceNamespace;


/***/ }),

/***/ 3072:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const stripeMethod = __webpack_require__(6018);

// DEPRECATED: These were kept for backwards compatibility in case users were
// using this, but basic methods are now explicitly defined on a resource.
module.exports = {
  create: stripeMethod({
    method: 'POST',
  }),

  list: stripeMethod({
    method: 'GET',
    methodType: 'list',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '{id}',
  }),

  // Avoid 'delete' keyword in JS
  del: stripeMethod({
    method: 'DELETE',
    path: '{id}',
  }),
};


/***/ }),

/***/ 6018:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(6893);
const makeRequest = __webpack_require__(8533);
const makeAutoPaginationMethods = (__webpack_require__(301)/* .makeAutoPaginationMethods */ .x);

/**
 * Create an API method from the declared spec.
 *
 * @param [spec.method='GET'] Request Method (POST, GET, DELETE, PUT)
 * @param [spec.path=''] Path to be appended to the API BASE_PATH, joined with
 *  the instance's path (e.g. 'charges' or 'customers')
 * @param [spec.fullPath=''] Fully qualified path to the method (eg. /v1/a/b/c).
 *  If this is specified, path should not be specified.
 * @param [spec.urlParams=[]] Array of required arguments in the order that they
 *  must be passed by the consumer of the API. Subsequent optional arguments are
 *  optionally passed through a hash (Object) as the penultimate argument
 *  (preceding the also-optional callback argument
 * @param [spec.encode] Function for mutating input parameters to a method.
 *  Usefully for applying transforms to data on a per-method basis.
 * @param [spec.host] Hostname for the request.
 */
function stripeMethod(spec) {
  if (spec.path !== undefined && spec.fullPath !== undefined) {
    throw new Error(
      `Method spec specified both a 'path' (${spec.path}) and a 'fullPath' (${spec.fullPath}).`
    );
  }
  return function(...args) {
    const callback = typeof args[args.length - 1] == 'function' && args.pop();

    spec.urlParams = utils.extractUrlParams(
      spec.fullPath || this.createResourcePathWithSymbols(spec.path || '')
    );

    const requestPromise = utils.callbackifyPromiseWithTimeout(
      makeRequest(this, args, spec, {}),
      callback
    );

    // Please note `spec.methodType === 'search'` is beta functionality and this
    // interface is subject to change/removal at any time.
    if (spec.methodType === 'list' || spec.methodType === 'search') {
      const autoPaginationMethods = makeAutoPaginationMethods(
        this,
        args,
        spec,
        requestPromise
      );
      Object.assign(requestPromise, autoPaginationMethods);
    }

    return requestPromise;
  };
}

module.exports = stripeMethod;


/***/ }),

/***/ 1781:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(6893);
const {
  StripeConnectionError,
  StripeAuthenticationError,
  StripePermissionError,
  StripeRateLimitError,
  StripeError,
  StripeAPIError,
} = __webpack_require__(2367);

const {HttpClient} = __webpack_require__(7715);

// Provide extension mechanism for Stripe Resource Sub-Classes
StripeResource.extend = utils.protoExtend;

// Expose method-creator & prepared (basic) methods
StripeResource.method = __webpack_require__(6018);
StripeResource.BASIC_METHODS = __webpack_require__(3072);

StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
const MAX_RETRY_AFTER_WAIT = 60;

/**
 * Encapsulates request logic for a Stripe Resource
 */
function StripeResource(stripe, deprecatedUrlData) {
  this._stripe = stripe;
  if (deprecatedUrlData) {
    throw new Error(
      'Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.'
    );
  }

  this.basePath = utils.makeURLInterpolator(
    this.basePath || stripe.getApiField('basePath')
  );
  this.resourcePath = this.path;
  this.path = utils.makeURLInterpolator(this.path);

  // DEPRECATED: This was kept for backwards compatibility in case users were
  // using this, but basic methods are now explicitly defined on a resource.
  if (this.includeBasic) {
    this.includeBasic.forEach(function(methodName) {
      this[methodName] = StripeResource.BASIC_METHODS[methodName];
    }, this);
  }

  this.initialize(...arguments);
}

StripeResource.prototype = {
  path: '',

  // Methods that don't use the API's default '/v1' path can override it with this setting.
  basePath: null,

  initialize() {},

  // Function to override the default data processor. This allows full control
  // over how a StripeResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,

  // Function to add a validation checks before sending the request, errors should
  // be thrown, and they will be passed to the callback/promise.
  validateRequest: null,

  createFullPath(commandPath, urlData) {
    const urlParts = [this.basePath(urlData), this.path(urlData)];

    if (typeof commandPath === 'function') {
      const computedCommandPath = commandPath(urlData);
      // If we have no actual command path, we just omit it to avoid adding a
      // trailing slash. This is important for top-level listing requests, which
      // do not have a command path.
      if (computedCommandPath) {
        urlParts.push(computedCommandPath);
      }
    } else {
      urlParts.push(commandPath);
    }

    return this._joinUrlParts(urlParts);
  },

  // Creates a relative resource path with symbols left in (unlike
  // createFullPath which takes some data to replace them with). For example it
  // might produce: /invoices/{id}
  createResourcePathWithSymbols(pathWithSymbols) {
    // If there is no path beyond the resource path, we want to produce just
    // /<resource path> rather than /<resource path>/.
    if (pathWithSymbols) {
      return `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`;
    } else {
      return `/${this.resourcePath}`;
    }
  },

  _joinUrlParts(parts) {
    // Replace any accidentally doubled up slashes. This previously used
    // path.join, which would do this as well. Unfortunately we need to do this
    // as the functions for creating paths are technically part of the public
    // interface and so we need to preserve backwards compatibility.
    return parts.join('/').replace(/\/{2,}/g, '/');
  },

  // DEPRECATED: Here for backcompat in case users relied on this.
  wrapTimeout: utils.callbackifyPromiseWithTimeout,

  _timeoutHandler(timeout, req, callback) {
    return () => {
      const timeoutErr = new TypeError('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req.destroy(timeoutErr);
    };
  },

  _addHeadersDirectlyToObject(obj, headers) {
    // For convenience, make some headers easily accessible on
    // lastResponse.

    // NOTE: Stripe responds with lowercase header names/keys.
    obj.requestId = headers['request-id'];
    obj.stripeAccount = obj.stripeAccount || headers['stripe-account'];
    obj.apiVersion = obj.apiVersion || headers['stripe-version'];
    obj.idempotencyKey = obj.idempotencyKey || headers['idempotency-key'];
  },

  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;

    return utils.removeNullish({
      api_version: headers['stripe-version'],
      account: headers['stripe-account'],
      idempotency_key: headers['idempotency-key'],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime,
    });
  },

  _getRequestId(headers) {
    return headers['request-id'];
  },

  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stripe
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, callback) {
    return (res) => {
      const headers = res.getHeaders();

      const streamCompleteCallback = () => {
        const responseEvent = this._makeResponseEvent(
          requestEvent,
          res.getStatusCode(),
          headers
        );
        this._stripe._emitter.emit('response', responseEvent);
        this._recordRequestMetrics(
          this._getRequestId(headers),
          responseEvent.elapsed
        );
      };

      const stream = res.toStream(streamCompleteCallback);

      // This is here for backwards compatibility, as the stream is a raw
      // HTTP response in Node and the legacy behavior was to mutate this
      // response.
      this._addHeadersDirectlyToObject(stream, headers);

      return callback(null, stream);
    };
  },

  /**
   * Default handler for Stripe responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();

      const responseEvent = this._makeResponseEvent(
        requestEvent,
        statusCode,
        headers
      );
      this._stripe._emitter.emit('response', responseEvent);

      res
        .toJSON()
        .then(
          (jsonResponse) => {
            if (jsonResponse.error) {
              let err;

              // Convert OAuth error responses into a standard format
              // so that the rest of the error logic can be shared
              if (typeof jsonResponse.error === 'string') {
                jsonResponse.error = {
                  type: jsonResponse.error,
                  message: jsonResponse.error_description,
                };
              }

              jsonResponse.error.headers = headers;
              jsonResponse.error.statusCode = statusCode;
              jsonResponse.error.requestId = requestId;

              if (statusCode === 401) {
                err = new StripeAuthenticationError(jsonResponse.error);
              } else if (statusCode === 403) {
                err = new StripePermissionError(jsonResponse.error);
              } else if (statusCode === 429) {
                err = new StripeRateLimitError(jsonResponse.error);
              } else {
                err = StripeError.generate(jsonResponse.error);
              }

              throw err;
            }

            return jsonResponse;
          },
          (e) => {
            throw new StripeAPIError({
              message: 'Invalid JSON received from the Stripe API',
              exception: e,
              requestId: headers['request-id'],
            });
          }
        )
        .then(
          (jsonResponse) => {
            this._recordRequestMetrics(requestId, responseEvent.elapsed);

            // Expose raw response object.
            const rawResponse = res.getRawResponse();
            this._addHeadersDirectlyToObject(rawResponse, headers);
            Object.defineProperty(jsonResponse, 'lastResponse', {
              enumerable: false,
              writable: false,
              value: rawResponse,
            });

            callback.call(this, null, jsonResponse);
          },
          (e) => callback.call(this, e, null)
        );
    };
  },

  _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stripe.${
      requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ''
    }`;
  },

  _errorHandler(req, requestRetries, callback) {
    return (message, detail) => {
      callback.call(
        this,
        new StripeConnectionError({
          message: this._generateConnectionErrorMessage(requestRetries),
          detail: error,
        }),
        null
      );
    };
  },

  // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
  _shouldRetry(res, numRetries, maxRetries, error) {
    if (
      error &&
      numRetries === 0 &&
      HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)
    ) {
      return true;
    }

    // Do not retry if we are out of retries.
    if (numRetries >= maxRetries) {
      return false;
    }

    // Retry on connection error.
    if (!res) {
      return true;
    }

    // The API may ask us not to retry (e.g., if doing so would be a no-op)
    // or advise us to retry (e.g., in cases of lock timeouts); we defer to that.
    if (res.getHeaders()['stripe-should-retry'] === 'false') {
      return false;
    }
    if (res.getHeaders()['stripe-should-retry'] === 'true') {
      return true;
    }

    // Retry on conflict errors.
    if (res.getStatusCode() === 409) {
      return true;
    }

    // Retry on 500, 503, and other internal errors.
    //
    // Note that we expect the stripe-should-retry header to be false
    // in most cases when a 500 is returned, since our idempotency framework
    // would typically replay it anyway.
    if (res.getStatusCode() >= 500) {
      return true;
    }

    return false;
  },

  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();

    // Apply exponential backoff with initialNetworkRetryDelay on the
    // number of numRetries so far as inputs. Do not allow the number to exceed
    // maxNetworkRetryDelay.
    let sleepSeconds = Math.min(
      initialNetworkRetryDelay * Math.pow(numRetries - 1, 2),
      maxNetworkRetryDelay
    );

    // Apply some jitter by randomizing the value in the range of
    // (sleepSeconds / 2) to (sleepSeconds).
    sleepSeconds *= 0.5 * (1 + Math.random());

    // But never sleep less than the base sleep seconds.
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);

    // And never sleep less than the time the API asks us to wait, assuming it's a reasonable ask.
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }

    return sleepSeconds * 1000;
  },

  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries &&
      Number.isInteger(settings.maxNetworkRetries)
      ? settings.maxNetworkRetries
      : this._stripe.getMaxNetworkRetries();
  },

  _defaultIdempotencyKey(method, settings) {
    // If this is a POST and we allow multiple retries, ensure an idempotency key.
    const maxRetries = this._getMaxNetworkRetries(settings);

    if (method === 'POST' && maxRetries > 0) {
      return `stripe-node-retry-${utils.uuid4()}`;
    }
    return null;
  },

  _makeHeaders(
    auth,
    contentLength,
    apiVersion,
    clientUserAgent,
    method,
    userSuppliedHeaders,
    userSuppliedSettings
  ) {
    const defaultHeaders = {
      // Use specified auth token or use default from this stripe instance:
      Authorization: auth ? `Bearer ${auth}` : this._stripe.getApiField('auth'),
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this._getUserAgentString(),
      'X-Stripe-Client-User-Agent': clientUserAgent,
      'X-Stripe-Client-Telemetry': this._getTelemetryHeader(),
      'Stripe-Version': apiVersion,
      'Stripe-Account': this._stripe.getApiField('stripeAccount'),
      'Idempotency-Key': this._defaultIdempotencyKey(
        method,
        userSuppliedSettings
      ),
    };

    // As per https://datatracker.ietf.org/doc/html/rfc7230#section-3.3.2:
    //   A user agent SHOULD send a Content-Length in a request message when
    //   no Transfer-Encoding is sent and the request method defines a meaning
    //   for an enclosed payload body.  For example, a Content-Length header
    //   field is normally sent in a POST request even when the value is 0
    //   (indicating an empty payload body).  A user agent SHOULD NOT send a
    //   Content-Length header field when the request message does not contain
    //   a payload body and the method semantics do not anticipate such a
    //   body.
    //
    // These method types are expected to have bodies and so we should always
    // include a Content-Length.
    const methodHasPayload =
      method == 'POST' || method == 'PUT' || method == 'PATCH';

    // If a content length was specified, we always include it regardless of
    // whether the method semantics anticipate such a body. This keeps us
    // consistent with historical behavior. We do however want to warn on this
    // and fix these cases as they are semantically incorrect.
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        utils.emitWarning(
          `${method} method had non-zero contentLength but no payload is expected for this verb`
        );
      }
      defaultHeaders['Content-Length'] = contentLength;
    }

    return Object.assign(
      utils.removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      utils.normalizeHeaders(userSuppliedHeaders)
    );
  },

  _getUserAgentString() {
    const packageVersion = this._stripe.getConstant('PACKAGE_VERSION');
    const appInfo = this._stripe._appInfo
      ? this._stripe.getAppInfoAsString()
      : '';

    return `Stripe/v1 NodeBindings/${packageVersion} ${appInfo}`.trim();
  },

  _getTelemetryHeader() {
    if (
      this._stripe.getTelemetryEnabled() &&
      this._stripe._prevRequestMetrics.length > 0
    ) {
      const metrics = this._stripe._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics,
      });
    }
  },

  _recordRequestMetrics(requestId, requestDurationMs) {
    if (this._stripe.getTelemetryEnabled() && requestId) {
      if (
        this._stripe._prevRequestMetrics.length >
        StripeResource.MAX_BUFFERED_REQUEST_METRICS
      ) {
        utils.emitWarning(
          'Request metrics buffer is full, dropping telemetry message.'
        );
      } else {
        this._stripe._prevRequestMetrics.push({
          request_id: requestId,
          request_duration_ms: requestDurationMs,
        });
      }
    }
  },

  _request(method, host, path, data, auth, options = {}, callback) {
    let requestData;

    const retryRequest = (
      requestFn,
      apiVersion,
      headers,
      requestRetries,
      retryAfter
    ) => {
      return setTimeout(
        requestFn,
        this._getSleepTimeInMS(requestRetries, retryAfter),
        apiVersion,
        headers,
        requestRetries + 1
      );
    };

    const makeRequest = (apiVersion, headers, numRetries) => {
      // timeout can be set on a per-request basis. Favor that over the global setting
      const timeout =
        options.settings &&
        Number.isInteger(options.settings.timeout) &&
        options.settings.timeout >= 0
          ? options.settings.timeout
          : this._stripe.getApiField('timeout');

      const req = this._stripe
        .getApiField('httpClient')
        .makeRequest(
          host || this._stripe.getApiField('host'),
          this._stripe.getApiField('port'),
          path,
          method,
          headers,
          requestData,
          this._stripe.getApiField('protocol'),
          timeout
        );

      const requestStartTime = Date.now();

      const requestEvent = utils.removeNullish({
        api_version: apiVersion,
        account: headers['Stripe-Account'],
        idempotency_key: headers['Idempotency-Key'],
        method,
        path,
        request_start_time: requestStartTime,
      });

      const requestRetries = numRetries || 0;

      const maxRetries = this._getMaxNetworkRetries(options.settings);

      this._stripe._emitter.emit('request', requestEvent);

      req
        .then((res) => {
          if (this._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(
              makeRequest,
              apiVersion,
              headers,
              requestRetries,
              res.getHeaders()['retry-after']
            );
          } else if (options.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, callback)(res);
          }
        })
        .catch((error) => {
          if (this._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(
              makeRequest,
              apiVersion,
              headers,
              requestRetries,
              null
            );
          } else {
            const isTimeoutError =
              error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;

            return callback.call(
              this,
              new StripeConnectionError({
                message: isTimeoutError
                  ? `Request aborted due to timeout being reached (${timeout}ms)`
                  : this._generateConnectionErrorMessage(requestRetries),
                detail: error,
              })
            );
          }
        });
    };

    const prepareAndMakeRequest = (error, data) => {
      if (error) {
        return callback(error);
      }

      requestData = data;

      this._stripe.getClientUserAgent((clientUserAgent) => {
        const apiVersion = this._stripe.getApiField('version');
        const headers = this._makeHeaders(
          auth,
          requestData.length,
          apiVersion,
          clientUserAgent,
          method,
          options.headers,
          options.settings
        );

        makeRequest(apiVersion, headers);
      });
    };

    if (this.requestDataProcessor) {
      this.requestDataProcessor(
        method,
        data,
        options.headers,
        prepareAndMakeRequest
      );
    } else {
      prepareAndMakeRequest(null, utils.stringifyRequestData(data || {}));
    }
  },
};

module.exports = StripeResource;


/***/ }),

/***/ 2989:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(6893);
const {StripeError, StripeSignatureVerificationError} = __webpack_require__(2367);

const Webhook = {
  DEFAULT_TOLERANCE: 300, // 5 minutes

  constructEvent(payload, header, secret, tolerance, cryptoProvider) {
    this.signature.verifyHeader(
      payload,
      header,
      secret,
      tolerance || Webhook.DEFAULT_TOLERANCE,
      cryptoProvider
    );

    const jsonPayload = JSON.parse(payload);
    return jsonPayload;
  },

  async constructEventAsync(
    payload,
    header,
    secret,
    tolerance,
    cryptoProvider
  ) {
    await this.signature.verifyHeaderAsync(
      payload,
      header,
      secret,
      tolerance || Webhook.DEFAULT_TOLERANCE,
      cryptoProvider
    );

    const jsonPayload = JSON.parse(payload);
    return jsonPayload;
  },

  /**
   * Generates a header to be used for webhook mocking
   *
   * @typedef {object} opts
   * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
   * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
   * @property {string} secret - Stripe webhook secret 'whsec_...'
   * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
   * @property {string} signature - Computed webhook signature
   * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
   */
  generateTestHeaderString: function(opts) {
    if (!opts) {
      throw new StripeError({
        message: 'Options are required',
      });
    }

    opts.timestamp =
      Math.floor(opts.timestamp) || Math.floor(Date.now() / 1000);
    opts.scheme = opts.scheme || signature.EXPECTED_SCHEME;

    opts.cryptoProvider = opts.cryptoProvider || getNodeCryptoProvider();

    opts.signature =
      opts.signature ||
      opts.cryptoProvider.computeHMACSignature(
        opts.timestamp + '.' + opts.payload,
        opts.secret
      );

    const generatedHeader = [
      't=' + opts.timestamp,
      opts.scheme + '=' + opts.signature,
    ].join(',');

    return generatedHeader;
  },
};

const signature = {
  EXPECTED_SCHEME: 'v1',

  verifyHeader(
    encodedPayload,
    encodedHeader,
    secret,
    tolerance,
    cryptoProvider
  ) {
    const {
      decodedHeader: header,
      decodedPayload: payload,
      details,
    } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);

    cryptoProvider = cryptoProvider || getNodeCryptoProvider();
    const expectedSignature = cryptoProvider.computeHMACSignature(
      makeHMACContent(payload, details),
      secret
    );

    validateComputedSignature(
      payload,
      header,
      details,
      expectedSignature,
      tolerance
    );

    return true;
  },

  async verifyHeaderAsync(
    encodedPayload,
    encodedHeader,
    secret,
    tolerance,
    cryptoProvider
  ) {
    const {
      decodedHeader: header,
      decodedPayload: payload,
      details,
    } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);

    cryptoProvider = cryptoProvider || getNodeCryptoProvider();

    const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(
      makeHMACContent(payload, details),
      secret
    );

    return validateComputedSignature(
      payload,
      header,
      details,
      expectedSignature,
      tolerance
    );
  },
};

function makeHMACContent(payload, details) {
  return `${details.timestamp}.${payload}`;
}

function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
  const decodedPayload = Buffer.isBuffer(encodedPayload)
    ? encodedPayload.toString('utf8')
    : encodedPayload;

  // Express's type for `Request#headers` is `string | []string`
  // which is because the `set-cookie` header is an array,
  // but no other headers are an array (docs: https://nodejs.org/api/http.html#http_message_headers)
  // (Express's Request class is an extension of http.IncomingMessage, and doesn't appear to be relevantly modified: https://github.com/expressjs/express/blob/master/lib/request.js#L31)
  if (Array.isArray(encodedHeader)) {
    throw new Error(
      'Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.'
    );
  }

  const decodedHeader = Buffer.isBuffer(encodedHeader)
    ? encodedHeader.toString('utf8')
    : encodedHeader;

  const details = parseHeader(decodedHeader, expectedScheme);

  if (!details || details.timestamp === -1) {
    throw new StripeSignatureVerificationError({
      message: 'Unable to extract timestamp and signatures from header',
      detail: {
        decodedHeader,
        decodedPayload,
      },
    });
  }

  if (!details.signatures.length) {
    throw new StripeSignatureVerificationError({
      message: 'No signatures found with expected scheme',
      detail: {
        decodedHeader,
        decodedPayload,
      },
    });
  }

  return {
    decodedPayload,
    decodedHeader,
    details,
  };
}

function validateComputedSignature(
  payload,
  header,
  details,
  expectedSignature,
  tolerance
) {
  const signatureFound = !!details.signatures.filter(
    utils.secureCompare.bind(utils, expectedSignature)
  ).length;

  if (!signatureFound) {
    throw new StripeSignatureVerificationError({
      message:
        'No signatures found matching the expected signature for payload.' +
        ' Are you passing the raw request body you received from Stripe?' +
        ' https://github.com/stripe/stripe-node#webhook-signing',
      detail: {
        header,
        payload,
      },
    });
  }

  const timestampAge = Math.floor(Date.now() / 1000) - details.timestamp;

  if (tolerance > 0 && timestampAge > tolerance) {
    throw new StripeSignatureVerificationError({
      message: 'Timestamp outside the tolerance zone',
      detail: {
        header,
        payload,
      },
    });
  }

  return true;
}

function parseHeader(header, scheme) {
  if (typeof header !== 'string') {
    return null;
  }

  return header.split(',').reduce(
    (accum, item) => {
      const kv = item.split('=');

      if (kv[0] === 't') {
        accum.timestamp = kv[1];
      }

      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }

      return accum;
    },
    {
      timestamp: -1,
      signatures: [],
    }
  );
}

let webhooksNodeCryptoProviderInstance = null;

/**
 * Lazily instantiate a NodeCryptoProvider instance. This is a stateless object
 * so a singleton can be used here.
 */
function getNodeCryptoProvider() {
  if (!webhooksNodeCryptoProviderInstance) {
    const NodeCryptoProvider = __webpack_require__(3259);
    webhooksNodeCryptoProviderInstance = new NodeCryptoProvider();
  }
  return webhooksNodeCryptoProviderInstance;
}

Webhook.signature = signature;

module.exports = Webhook;


/***/ }),

/***/ 301:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const makeRequest = __webpack_require__(8533);
const utils = __webpack_require__(6893);

function makeAutoPaginationMethods(self, requestArgs, spec, firstPagePromise) {
  const promiseCache = {currentPromise: null};
  const reverseIteration = isReverseIteration(requestArgs);
  let pagePromise = firstPagePromise;
  let i = 0;

  // Search and List methods iterate differently.
  // Search relies on a `next_page` token and can only iterate in one direction.
  // List relies on either an `ending_before` or `starting_after` field with
  // an item ID to paginate and is bi-directional.
  //
  // Please note: spec.methodType === 'search' is beta functionality and is
  // subject to change/removal at any time.
  let getNextPagePromise;
  if (spec.methodType === 'search') {
    getNextPagePromise = (pageResult) => {
      if (!pageResult.next_page) {
        throw Error(
          'Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.'
        );
      }
      return makeRequest(self, requestArgs, spec, {
        page: pageResult.next_page,
      });
    };
  } else {
    getNextPagePromise = (pageResult) => {
      const lastId = getLastId(pageResult, reverseIteration);
      return makeRequest(self, requestArgs, spec, {
        [reverseIteration ? 'ending_before' : 'starting_after']: lastId,
      });
    };
  }

  function iterate(pageResult) {
    if (
      !(
        pageResult &&
        pageResult.data &&
        typeof pageResult.data.length === 'number'
      )
    ) {
      throw Error(
        'Unexpected: Stripe API response does not have a well-formed `data` array.'
      );
    }

    if (i < pageResult.data.length) {
      const idx = reverseIteration ? pageResult.data.length - 1 - i : i;
      const value = pageResult.data[idx];
      i += 1;

      return {value, done: false};
    } else if (pageResult.has_more) {
      // Reset counter, request next page, and recurse.
      i = 0;
      pagePromise = getNextPagePromise(pageResult);
      return pagePromise.then(iterate);
    }
    return {value: undefined, done: true};
  }

  function asyncIteratorNext() {
    return memoizedPromise(promiseCache, (resolve, reject) => {
      return pagePromise
        .then(iterate)
        .then(resolve)
        .catch(reject);
    });
  }

  const autoPagingEach = makeAutoPagingEach(asyncIteratorNext);
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);

  const autoPaginationMethods = {
    autoPagingEach,
    autoPagingToArray,

    // Async iterator functions:
    next: asyncIteratorNext,
    return: () => {
      // This is required for `break`.
      return {};
    },
    [getAsyncIteratorSymbol()]: () => {
      return autoPaginationMethods;
    },
  };
  return autoPaginationMethods;
}

module.exports.x = makeAutoPaginationMethods;

/**
 * ----------------
 * Private Helpers:
 * ----------------
 */

function getAsyncIteratorSymbol() {
  if (typeof Symbol !== 'undefined' && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  // Follow the convention from libraries like iterall: https://github.com/leebyron/iterall#asynciterator-1
  return '@@asyncIterator';
}

function getDoneCallback(args) {
  if (args.length < 2) {
    return undefined;
  }
  const onDone = args[1];
  if (typeof onDone !== 'function') {
    throw Error(
      `The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`
    );
  }
  return onDone;
}

/**
 * We allow four forms of the `onItem` callback (the middle two being equivalent),
 *
 *   1. `.autoPagingEach((item) => { doSomething(item); return false; });`
 *   2. `.autoPagingEach(async (item) => { await doSomething(item); return false; });`
 *   3. `.autoPagingEach((item) => doSomething(item).then(() => false));`
 *   4. `.autoPagingEach((item, next) => { doSomething(item); next(false); });`
 *
 * In addition to standard validation, this helper
 * coalesces the former forms into the latter form.
 */
function getItemCallback(args) {
  if (args.length === 0) {
    return undefined;
  }
  const onItem = args[0];
  if (typeof onItem !== 'function') {
    throw Error(
      `The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`
    );
  }

  // 4. `.autoPagingEach((item, next) => { doSomething(item); next(false); });`
  if (onItem.length === 2) {
    return onItem;
  }

  if (onItem.length > 2) {
    throw Error(
      `The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`
    );
  }

  // This magically handles all three of these usecases (the latter two being functionally identical):
  // 1. `.autoPagingEach((item) => { doSomething(item); return false; });`
  // 2. `.autoPagingEach(async (item) => { await doSomething(item); return false; });`
  // 3. `.autoPagingEach((item) => doSomething(item).then(() => false));`
  return function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  };
}

function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error(
      'Unexpected: No `id` found on the last item while auto-paging a list.'
    );
  }
  return lastId;
}

/**
 * If a user calls `.next()` multiple times in parallel,
 * return the same result until something has resolved
 * to prevent page-turning race conditions.
 */
function memoizedPromise(promiseCache, cb) {
  if (promiseCache.currentPromise) {
    return promiseCache.currentPromise;
  }
  promiseCache.currentPromise = new Promise(cb).then((ret) => {
    promiseCache.currentPromise = undefined;
    return ret;
  });
  return promiseCache.currentPromise;
}

function makeAutoPagingEach(asyncIteratorNext) {
  return function autoPagingEach(/* onItem?, onDone? */) {
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }

    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      onItem
    );
    return utils.callbackifyPromiseWithTimeout(autoPagePromise, onDone);
  };
}

function makeAutoPagingToArray(autoPagingEach) {
  return function autoPagingToArray(opts, onDone) {
    const limit = opts && opts.limit;
    if (!limit) {
      throw Error(
        'You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.'
      );
    }
    if (limit > 10000) {
      throw Error(
        'You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.'
      );
    }
    const promise = new Promise((resolve, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit) {
          return false;
        }
      })
        .then(() => {
          resolve(items);
        })
        .catch(reject);
    });
    return utils.callbackifyPromiseWithTimeout(promise, onDone);
  };
}

function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve();
        return;
      }

      const item = iterResult.value;
      return new Promise((next) => {
        // Bit confusing, perhaps; we pass a `resolve` fn
        // to the user, so they can decide when and if to continue.
        // They can return false, or a promise which resolves to false, to break.
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({done: true});
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }

    asyncIteratorNext()
      .then(handleIteration)
      .catch(reject);
  });
}

function isReverseIteration(requestArgs) {
  const args = [].slice.call(requestArgs);
  const dataFromArgs = utils.getDataFromArgs(args);

  return !!dataFromArgs.ending_before;
}


/***/ }),

/***/ 7848:
/***/ ((module) => {

"use strict";


/**
 * Interface encapsulating the various crypto computations used by the library,
 * allowing pluggable underlying crypto implementations.
 */
class CryptoProvider {
  /**
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignature(payload, secret) {
    throw new Error('computeHMACSignature not implemented.');
  }

  /**
   * Asynchronous version of `computeHMACSignature`. Some implementations may
   * only allow support async signature computation.
   *
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignatureAsync(payload, secret) {
    throw new Error('computeHMACSignatureAsync not implemented.');
  }
}

module.exports = CryptoProvider;


/***/ }),

/***/ 3259:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const crypto = __webpack_require__(6113);

const CryptoProvider = __webpack_require__(7848);

/**
 * `CryptoProvider which uses the Node `crypto` package for its computations.
 */
class NodeCryptoProvider extends CryptoProvider {
  /** @override */
  computeHMACSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const signature = await this.computeHMACSignature(payload, secret);
    return signature;
  }
}

module.exports = NodeCryptoProvider;


/***/ }),

/***/ 5498:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const CryptoProvider = __webpack_require__(7848);

/**
 * `CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
 *
 * This only supports asynchronous operations.
 */
class SubtleCryptoProvider extends CryptoProvider {
  constructor(subtleCrypto) {
    super();

    // If no subtle crypto is interface, default to the global namespace. This
    // is to allow custom interfaces (eg. using the Node webcrypto interface in
    // tests).
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }

  /** @override */
  computeHMACSignature(payload, secret) {
    throw new Error(
      'SubtleCryptoProvider cannot be used in a synchronous context.'
    );
  }

  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const encoder = new TextEncoder('utf-8');

    const key = await this.subtleCrypto.importKey(
      'raw',
      encoder.encode(secret),
      {
        name: 'HMAC',
        hash: {name: 'SHA-256'},
      },
      false,
      ['sign']
    );

    const signatureBuffer = await this.subtleCrypto.sign(
      'hmac',
      key,
      encoder.encode(payload)
    );

    // crypto.subtle returns the signature in base64 format. This must be
    // encoded in hex to match the CryptoProvider contract. We map each byte in
    // the buffer to its corresponding hex octet and then combine into a string.
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);

    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }

    return signatureHexCodes.join('');
  }
}

// Cached mapping of byte to hex representation. We do this once to avoid re-
// computing every time we need to convert the result of a signature to hex.
const byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, '0');
}

module.exports = SubtleCryptoProvider;


/***/ }),

/***/ 8533:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(6893);

function getRequestOpts(self, requestArgs, spec, overrideData) {
  // Extract spec values with defaults.
  const requestMethod = (spec.method || 'GET').toUpperCase();
  const urlParams = spec.urlParams || [];
  const encode = spec.encode || ((data) => data);

  const isUsingFullPath = !!spec.fullPath;
  const commandPath = utils.makeURLInterpolator(
    isUsingFullPath ? spec.fullPath : spec.path || ''
  );
  // When using fullPath, we ignore the resource path as it should already be
  // fully qualified.
  const path = isUsingFullPath
    ? spec.fullPath
    : self.createResourcePathWithSymbols(spec.path);

  // Don't mutate args externally.
  const args = [].slice.call(requestArgs);

  // Generate and validate url params.
  const urlData = urlParams.reduce((urlData, param) => {
    const arg = args.shift();
    if (typeof arg !== 'string') {
      throw new Error(
        `Stripe: Argument "${param}" must be a string, but got: ${arg} (on API request to \`${requestMethod} ${path}\`)`
      );
    }

    urlData[param] = arg;
    return urlData;
  }, {});

  // Pull request data and options (headers, auth) from args.
  const dataFromArgs = utils.getDataFromArgs(args);
  const data = encode(Object.assign({}, dataFromArgs, overrideData));
  const options = utils.getOptionsFromArgs(args);
  const host = options.host || spec.host;
  const streaming = !!spec.streaming;
  // Validate that there are no more args.
  if (args.filter((x) => x != null).length) {
    throw new Error(
      `Stripe: Unknown arguments (${args}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options. (on API request to ${requestMethod} \`${path}\`)`
    );
  }

  // When using full path, we can just invoke the URL interpolator directly
  // as we don't need to use the resource to create a full path.
  const requestPath = isUsingFullPath
    ? commandPath(urlData)
    : self.createFullPath(commandPath, urlData);

  const headers = Object.assign(options.headers, spec.headers);

  if (spec.validator) {
    spec.validator(data, {headers});
  }

  const dataInQuery = spec.method === 'GET' || spec.method === 'DELETE';
  const bodyData = dataInQuery ? {} : data;
  const queryData = dataInQuery ? data : {};

  return {
    requestMethod,
    requestPath,
    bodyData,
    queryData,
    auth: options.auth,
    headers,
    host,
    streaming,
    settings: options.settings,
  };
}

function makeRequest(self, requestArgs, spec, overrideData) {
  return new Promise((resolve, reject) => {
    let opts;
    try {
      opts = getRequestOpts(self, requestArgs, spec, overrideData);
    } catch (err) {
      reject(err);
      return;
    }

    function requestCallback(err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(
          spec.transformResponseData
            ? spec.transformResponseData(response)
            : response
        );
      }
    }

    const emptyQuery = Object.keys(opts.queryData).length === 0;
    const path = [
      opts.requestPath,
      emptyQuery ? '' : '?',
      utils.stringifyRequestData(opts.queryData),
    ].join('');

    const {headers, settings} = opts;

    self._request(
      opts.requestMethod,
      opts.host,
      path,
      opts.bodyData,
      opts.auth,
      {headers, settings, streaming: opts.streaming},
      requestCallback
    );
  });
}

module.exports = makeRequest;


/***/ }),

/***/ 4782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(6893);
const {StripeError} = __webpack_require__(2367);

class StreamProcessingError extends StripeError {}

// Method for formatting HTTP body for the multipart/form-data specification
// Mostly taken from Fermata.js
// https://github.com/natevw/fermata/blob/5d9732a33d776ce925013a265935facd1626cc88/fermata.js#L315-L343
const multipartDataGenerator = (method, data, headers) => {
  const segno = (
    Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)
  ).toString();
  headers['Content-Type'] = `multipart/form-data; boundary=${segno}`;
  let buffer = Buffer.alloc(0);

  function push(l) {
    const prevBuffer = buffer;
    const newBuffer = l instanceof Buffer ? l : Buffer.from(l);
    buffer = Buffer.alloc(prevBuffer.length + newBuffer.length + 2);
    prevBuffer.copy(buffer);
    newBuffer.copy(buffer, prevBuffer.length);
    buffer.write('\r\n', buffer.length - 2);
  }

  function q(s) {
    return `"${s.replace(/"|"/g, '%22').replace(/\r\n|\r|\n/g, ' ')}"`;
  }

  const flattenedData = utils.flattenAndStringify(data);

  for (const k in flattenedData) {
    const v = flattenedData[k];
    push(`--${segno}`);
    if (v.hasOwnProperty('data')) {
      push(
        `Content-Disposition: form-data; name=${q(k)}; filename=${q(
          v.name || 'blob'
        )}`
      );
      push(`Content-Type: ${v.type || 'application/octet-stream'}`);
      push('');
      push(v.data);
    } else {
      push(`Content-Disposition: form-data; name=${q(k)}`);
      push('');
      push(v);
    }
  }
  push(`--${segno}--`);

  return buffer;
};

const streamProcessor = (method, data, headers, callback) => {
  const bufferArray = [];
  data.file.data
    .on('data', (line) => {
      bufferArray.push(line);
    })
    .once('end', () => {
      const bufferData = Object.assign({}, data);
      bufferData.file.data = Buffer.concat(bufferArray);
      const buffer = multipartDataGenerator(method, bufferData, headers);
      callback(null, buffer);
    })
    .on('error', (err) => {
      callback(
        new StreamProcessingError({
          message:
            'An error occurred while attempting to process the file for upload.',
          detail: err,
        }),
        null
      );
    });
};

const multipartRequestDataProcessor = (method, data, headers, callback) => {
  data = data || {};

  if (method !== 'POST') {
    return callback(null, utils.stringifyRequestData(data));
  }

  const isStream = utils.checkForStream(data);
  if (isStream) {
    return streamProcessor(method, data, headers, callback);
  }

  const buffer = multipartDataGenerator(method, data, headers);
  return callback(null, buffer);
};

module.exports.multipartRequestDataProcessor = multipartRequestDataProcessor;


/***/ }),

/***/ 5827:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const {HttpClient, HttpClientResponse} = __webpack_require__(7715);

/**
 * HTTP client which uses a `fetch` function to issue requests.
 *
 * By default relies on the global `fetch` function, but an optional function
 * can be passed in. If passing in a function, it is expected to match the Web
 * Fetch API. As an example, this could be the function provided by the
 * node-fetch package (https://github.com/node-fetch/node-fetch).
 */
class FetchHttpClient extends HttpClient {
  constructor(fetchFn) {
    super();
    this._fetchFn = fetchFn;
  }

  /** @override. */
  getClientName() {
    return 'fetch';
  }

  makeRequest(
    host,
    port,
    path,
    method,
    headers,
    requestData,
    protocol,
    timeout
  ) {
    const isInsecureConnection = protocol === 'http';

    const url = new URL(
      path,
      `${isInsecureConnection ? 'http' : 'https'}://${host}`
    );
    url.port = port;

    const fetchFn = this._fetchFn || fetch;
    const fetchPromise = fetchFn(url.toString(), {
      method,
      headers,
      body: requestData || undefined,
    });

    // The Fetch API does not support passing in a timeout natively, so a
    // timeout promise is constructed to race against the fetch and preempt the
    // request, simulating a timeout.
    //
    // This timeout behavior differs from Node:
    // - Fetch uses a single timeout for the entire length of the request.
    // - Node is more fine-grained and resets the timeout after each stage of
    //   the request.
    //
    // As an example, if the timeout is set to 30s and the connection takes 20s
    // to be established followed by 20s for the body, Fetch would timeout but
    // Node would not. The more fine-grained timeout cannot be implemented with
    // fetch.
    let pendingTimeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      pendingTimeoutId = setTimeout(() => {
        pendingTimeoutId = null;
        reject(HttpClient.makeTimeoutError());
      }, timeout);
    });

    return Promise.race([fetchPromise, timeoutPromise])
      .then((res) => {
        return new FetchHttpClientResponse(res);
      })
      .finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
  }
}

class FetchHttpClientResponse extends HttpClientResponse {
  constructor(res) {
    super(
      res.status,
      FetchHttpClientResponse._transformHeadersToObject(res.headers)
    );
    this._res = res;
  }

  getRawResponse() {
    return this._res;
  }

  toStream(streamCompleteCallback) {
    // Unfortunately `fetch` does not have event handlers for when the stream is
    // completely read. We therefore invoke the streamCompleteCallback right
    // away. This callback emits a response event with metadata and completes
    // metrics, so it's ok to do this without waiting for the stream to be
    // completely read.
    streamCompleteCallback();

    // Fetch's `body` property is expected to be a readable stream of the body.
    return this._res.body;
  }

  toJSON() {
    return this._res.json();
  }

  static _transformHeadersToObject(headers) {
    // Fetch uses a Headers instance so this must be converted to a barebones
    // JS object to meet the HttpClient interface.
    const headersObj = {};

    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error(
          'Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.'
        );
      }

      headersObj[entry[0]] = entry[1];
    }

    return headersObj;
  }
}

module.exports = {FetchHttpClient, FetchHttpClientResponse};


/***/ }),

/***/ 7715:
/***/ ((module) => {

"use strict";


/**
 * Encapsulates the logic for issuing a request to the Stripe API.
 *
 * A custom HTTP client should should implement:
 * 1. A response class which extends HttpClientResponse and wraps around their
 *    own internal representation of a response.
 * 2. A client class which extends HttpClient and implements all methods,
 *    returning their own response class when making requests.
 */
class HttpClient {
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error('getClientName not implemented.');
  }

  makeRequest(
    host,
    port,
    path,
    method,
    headers,
    requestData,
    protocol,
    timeout
  ) {
    throw new Error('makeRequest not implemented.');
  }

  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(HttpClient.TIMEOUT_ERROR_CODE);
    timeoutErr.code = HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
}

HttpClient.CONNECTION_CLOSED_ERROR_CODES = ['ECONNRESET', 'EPIPE'];
HttpClient.TIMEOUT_ERROR_CODE = 'ETIMEDOUT';

class HttpClientResponse {
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }

  getStatusCode() {
    return this._statusCode;
  }

  getHeaders() {
    return this._headers;
  }

  getRawResponse() {
    throw new Error('getRawResponse not implemented.');
  }

  toStream(streamCompleteCallback) {
    throw new Error('toStream not implemented.');
  }

  toJSON() {
    throw new Error('toJSON not implemented.');
  }
}

module.exports = {HttpClient, HttpClientResponse};


/***/ }),

/***/ 1959:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const http = __webpack_require__(3685);
const https = __webpack_require__(5687);

const {HttpClient, HttpClientResponse} = __webpack_require__(7715);

const defaultHttpAgent = new http.Agent({keepAlive: true});
const defaultHttpsAgent = new https.Agent({keepAlive: true});

/**
 * HTTP client which uses the Node `http` and `https` packages to issue
 * requests.`
 */
class NodeHttpClient extends HttpClient {
  constructor(agent) {
    super();
    this._agent = agent;
  }

  /** @override. */
  getClientName() {
    return 'node';
  }

  makeRequest(
    host,
    port,
    path,
    method,
    headers,
    requestData,
    protocol,
    timeout
  ) {
    const isInsecureConnection = protocol === 'http';

    let agent = this._agent;
    if (!agent) {
      agent = isInsecureConnection ? defaultHttpAgent : defaultHttpsAgent;
    }

    const requestPromise = new Promise((resolve, reject) => {
      const req = (isInsecureConnection ? http : https).request({
        host: host,
        port: port,
        path,
        method,
        agent,
        headers,
        ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5',
      });

      req.setTimeout(timeout, () => {
        req.destroy(HttpClient.makeTimeoutError());
      });

      req.on('response', (res) => {
        resolve(new NodeHttpClientResponse(res));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.once('socket', (socket) => {
        if (socket.connecting) {
          socket.once(
            isInsecureConnection ? 'connect' : 'secureConnect',
            () => {
              // Send payload; we're safe:
              req.write(requestData);
              req.end();
            }
          );
        } else {
          // we're already connected
          req.write(requestData);
          req.end();
        }
      });
    });

    return requestPromise;
  }
}

class NodeHttpClientResponse extends HttpClientResponse {
  constructor(res) {
    super(res.statusCode, res.headers || {});
    this._res = res;
  }

  getRawResponse() {
    return this._res;
  }

  toStream(streamCompleteCallback) {
    // The raw response is itself the stream, so we just return that. To be
    // backwards compatible, we should invoke the streamCompleteCallback only
    // once the stream has been fully consumed.
    this._res.once('end', () => streamCompleteCallback());
    return this._res;
  }

  toJSON() {
    return new Promise((resolve, reject) => {
      let response = '';

      this._res.setEncoding('utf8');
      this._res.on('data', (chunk) => {
        response += chunk;
      });
      this._res.once('end', () => {
        try {
          resolve(JSON.parse(response));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

module.exports = {NodeHttpClient, NodeHttpClientResponse};


/***/ }),

/***/ 7943:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const resourceNamespace = __webpack_require__(4371);

module.exports = {
  Accounts: __webpack_require__(5105),
  // Support Accounts for consistency, Account for backwards compatibility
  Account: __webpack_require__(5105),
  AccountLinks: __webpack_require__(1517),
  ApplePayDomains: __webpack_require__(3653),
  ApplicationFees: __webpack_require__(2434),
  Balance: __webpack_require__(1580),
  BalanceTransactions: __webpack_require__(31),
  Charges: __webpack_require__(7942),
  CountrySpecs: __webpack_require__(9346),
  Coupons: __webpack_require__(3457),
  CreditNotes: __webpack_require__(350),
  Customers: __webpack_require__(7858),
  Disputes: __webpack_require__(2073),
  EphemeralKeys: __webpack_require__(6710),
  Events: __webpack_require__(4717),
  ExchangeRates: __webpack_require__(2313),
  Files: __webpack_require__(6606),
  FileLinks: __webpack_require__(1366),
  Invoices: __webpack_require__(1346),
  InvoiceItems: __webpack_require__(3225),
  Mandates: __webpack_require__(3018),
  OAuth: __webpack_require__(7360),
  Orders: __webpack_require__(6948),
  PaymentIntents: __webpack_require__(4922),
  PaymentLinks: __webpack_require__(8305),
  PaymentMethods: __webpack_require__(3715),
  Payouts: __webpack_require__(2206),
  Plans: __webpack_require__(3099),
  Prices: __webpack_require__(2137),
  Products: __webpack_require__(1122),
  PromotionCodes: __webpack_require__(890),
  Quotes: __webpack_require__(5962),
  Refunds: __webpack_require__(6912),
  Reviews: __webpack_require__(4731),
  SetupAttempts: __webpack_require__(4064),
  SetupIntents: __webpack_require__(5721),
  ShippingRates: __webpack_require__(2152),
  Skus: __webpack_require__(8446),
  Sources: __webpack_require__(628),
  Subscriptions: __webpack_require__(6585),
  SubscriptionItems: __webpack_require__(1211),
  SubscriptionSchedules: __webpack_require__(4122),
  TaxCodes: __webpack_require__(3671),
  TaxRates: __webpack_require__(4716),
  Tokens: __webpack_require__(1899),
  Topups: __webpack_require__(5526),
  Transfers: __webpack_require__(3235),
  WebhookEndpoints: __webpack_require__(792),
  Apps: resourceNamespace('apps', {
    Secrets: __webpack_require__(3962),
  }),
  BillingPortal: resourceNamespace('billingPortal', {
    Configurations: __webpack_require__(6568),
    Sessions: __webpack_require__(1398),
  }),
  Checkout: resourceNamespace('checkout', {
    Sessions: __webpack_require__(6566),
  }),
  FinancialConnections: resourceNamespace('financialConnections', {
    Accounts: __webpack_require__(5177),
    Sessions: __webpack_require__(5544),
  }),
  Identity: resourceNamespace('identity', {
    VerificationReports: __webpack_require__(6829),
    VerificationSessions: __webpack_require__(831),
  }),
  Issuing: resourceNamespace('issuing', {
    Authorizations: __webpack_require__(9754),
    Cards: __webpack_require__(6523),
    Cardholders: __webpack_require__(865),
    Disputes: __webpack_require__(7774),
    Transactions: __webpack_require__(3440),
  }),
  Radar: resourceNamespace('radar', {
    EarlyFraudWarnings: __webpack_require__(4554),
    ValueLists: __webpack_require__(3056),
    ValueListItems: __webpack_require__(539),
  }),
  Reporting: resourceNamespace('reporting', {
    ReportRuns: __webpack_require__(8274),
    ReportTypes: __webpack_require__(5679),
  }),
  Sigma: resourceNamespace('sigma', {
    ScheduledQueryRuns: __webpack_require__(2131),
  }),
  Terminal: resourceNamespace('terminal', {
    Configurations: __webpack_require__(6372),
    ConnectionTokens: __webpack_require__(1301),
    Locations: __webpack_require__(5),
    Readers: __webpack_require__(474),
  }),
  TestHelpers: resourceNamespace('testHelpers', {
    Customers: __webpack_require__(6014),
    Refunds: __webpack_require__(499),
    TestClocks: __webpack_require__(6709),
    Issuing: resourceNamespace('issuing', {
      Cards: __webpack_require__(5615),
    }),
    Terminal: resourceNamespace('terminal', {
      Readers: __webpack_require__(5515),
    }),
    Treasury: resourceNamespace('treasury', {
      InboundTransfers: __webpack_require__(8111),
      OutboundPayments: __webpack_require__(3773),
      OutboundTransfers: __webpack_require__(9306),
      ReceivedCredits: __webpack_require__(3321),
      ReceivedDebits: __webpack_require__(6779),
    }),
  }),
  Treasury: resourceNamespace('treasury', {
    CreditReversals: __webpack_require__(4072),
    DebitReversals: __webpack_require__(8469),
    FinancialAccounts: __webpack_require__(5288),
    InboundTransfers: __webpack_require__(43),
    OutboundPayments: __webpack_require__(5096),
    OutboundTransfers: __webpack_require__(91),
    ReceivedCredits: __webpack_require__(1520),
    ReceivedDebits: __webpack_require__(5566),
    Transactions: __webpack_require__(9519),
    TransactionEntries: __webpack_require__(8247),
  }),
};


/***/ }),

/***/ 1517:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'account_links',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),
});


/***/ }),

/***/ 5105:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

// Since path can either be `account` or `accounts`, support both through stripeMethod path;
module.exports = StripeResource.extend({
  path: '',

  create: stripeMethod({
    method: 'POST',
    path: 'accounts',
  }),

  retrieve(id) {
    // No longer allow an api key to be passed as the first string to this function due to ambiguity between
    // old account ids and api keys. To request the account for an api key, send null as the id
    if (typeof id === 'string') {
      return stripeMethod({
        method: 'GET',
        path: 'accounts/{id}',
      }).apply(this, arguments);
    } else {
      if (id === null || id === undefined) {
        // Remove id as stripeMethod would complain of unexpected argument
        [].shift.apply(arguments);
      }
      return stripeMethod({
        method: 'GET',
        path: 'account',
      }).apply(this, arguments);
    }
  },

  update: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: 'accounts',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: 'accounts/{account}',
  }),

  reject: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/reject',
  }),

  retrieveCapability: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/capabilities/{capability}',
  }),

  updateCapability: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/capabilities/{capability}',
  }),

  listCapabilities: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/capabilities',
    methodType: 'list',
  }),

  createExternalAccount: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/external_accounts',
  }),

  retrieveExternalAccount: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/external_accounts/{id}',
  }),

  updateExternalAccount: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/external_accounts/{id}',
  }),

  listExternalAccounts: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/external_accounts',
    methodType: 'list',
  }),

  deleteExternalAccount: stripeMethod({
    method: 'DELETE',
    path: 'accounts/{account}/external_accounts/{id}',
  }),

  createLoginLink: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/login_links',
  }),

  createPerson: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/persons',
  }),

  retrievePerson: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/persons/{person}',
  }),

  updatePerson: stripeMethod({
    method: 'POST',
    path: 'accounts/{account}/persons/{person}',
  }),

  listPersons: stripeMethod({
    method: 'GET',
    path: 'accounts/{account}/persons',
    methodType: 'list',
  }),

  deletePerson: stripeMethod({
    method: 'DELETE',
    path: 'accounts/{account}/persons/{person}',
  }),
});


/***/ }),

/***/ 3653:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'apple_pay/domains',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{domain}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{domain}',
  }),
});


/***/ }),

/***/ 2434:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'application_fees',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  createRefund: stripeMethod({
    method: 'POST',
    path: '/{id}/refunds',
  }),

  retrieveRefund: stripeMethod({
    method: 'GET',
    path: '/{fee}/refunds/{id}',
  }),

  updateRefund: stripeMethod({
    method: 'POST',
    path: '/{fee}/refunds/{id}',
  }),

  listRefunds: stripeMethod({
    method: 'GET',
    path: '/{id}/refunds',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 3962:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'apps/secrets',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  deleteWhere: stripeMethod({
    method: 'POST',
    path: '/delete',
  }),

  find: stripeMethod({
    method: 'GET',
    path: '/find',
  }),
});


/***/ }),

/***/ 1580:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'balance',

  retrieve: stripeMethod({
    method: 'GET',
    path: '',
  }),
});


/***/ }),

/***/ 31:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'balance_transactions',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 6568:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'billing_portal/configurations',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{configuration}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{configuration}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 1398:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'billing_portal/sessions',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),
});


/***/ }),

/***/ 7942:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'charges',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{charge}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{charge}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  capture: stripeMethod({
    method: 'POST',
    path: '/{charge}/capture',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),
});


/***/ }),

/***/ 6566:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'checkout/sessions',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{session}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  expire: stripeMethod({
    method: 'POST',
    path: '/{session}/expire',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{session}/line_items',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 9346:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'country_specs',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{country}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 3457:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'coupons',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{coupon}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{coupon}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{coupon}',
  }),
});


/***/ }),

/***/ 350:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'credit_notes',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  listPreviewLineItems: stripeMethod({
    method: 'GET',
    path: '/preview/lines',
    methodType: 'list',
  }),

  preview: stripeMethod({
    method: 'GET',
    path: '/preview',
  }),

  voidCreditNote: stripeMethod({
    method: 'POST',
    path: '/{id}/void',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{creditNote}/lines',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 7858:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'customers',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{customer}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{customer}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{customer}',
  }),

  createFundingInstructions: stripeMethod({
    method: 'POST',
    path: '/{customer}/funding_instructions',
  }),

  deleteDiscount: stripeMethod({
    method: 'DELETE',
    path: '/{customer}/discount',
  }),

  listPaymentMethods: stripeMethod({
    method: 'GET',
    path: '/{customer}/payment_methods',
    methodType: 'list',
  }),

  retrievePaymentMethod: stripeMethod({
    method: 'GET',
    path: '/{customer}/payment_methods/{paymentMethod}',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),

  retrieveCashBalance: stripeMethod({
    method: 'GET',
    path: '/{customer}/cash_balance',
  }),

  updateCashBalance: stripeMethod({
    method: 'POST',
    path: '/{customer}/cash_balance',
  }),

  createBalanceTransaction: stripeMethod({
    method: 'POST',
    path: '/{customer}/balance_transactions',
  }),

  retrieveBalanceTransaction: stripeMethod({
    method: 'GET',
    path: '/{customer}/balance_transactions/{transaction}',
  }),

  updateBalanceTransaction: stripeMethod({
    method: 'POST',
    path: '/{customer}/balance_transactions/{transaction}',
  }),

  listBalanceTransactions: stripeMethod({
    method: 'GET',
    path: '/{customer}/balance_transactions',
    methodType: 'list',
  }),

  createSource: stripeMethod({
    method: 'POST',
    path: '/{customer}/sources',
  }),

  retrieveSource: stripeMethod({
    method: 'GET',
    path: '/{customer}/sources/{id}',
  }),

  updateSource: stripeMethod({
    method: 'POST',
    path: '/{customer}/sources/{id}',
  }),

  listSources: stripeMethod({
    method: 'GET',
    path: '/{customer}/sources',
    methodType: 'list',
  }),

  deleteSource: stripeMethod({
    method: 'DELETE',
    path: '/{customer}/sources/{id}',
  }),

  verifySource: stripeMethod({
    method: 'POST',
    path: '/{customer}/sources/{id}/verify',
  }),

  createTaxId: stripeMethod({
    method: 'POST',
    path: '/{customer}/tax_ids',
  }),

  retrieveTaxId: stripeMethod({
    method: 'GET',
    path: '/{customer}/tax_ids/{id}',
  }),

  listTaxIds: stripeMethod({
    method: 'GET',
    path: '/{customer}/tax_ids',
    methodType: 'list',
  }),

  deleteTaxId: stripeMethod({
    method: 'DELETE',
    path: '/{customer}/tax_ids/{id}',
  }),
});


/***/ }),

/***/ 2073:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'disputes',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{dispute}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{dispute}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  close: stripeMethod({
    method: 'POST',
    path: '/{dispute}/close',
  }),
});


/***/ }),

/***/ 6710:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'ephemeral_keys',

  create: stripeMethod({
    method: 'POST',
    path: '',
    validator: (data, options) => {
      if (!options.headers || !options.headers['Stripe-Version']) {
        throw new Error(
          'Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node'
        );
      }
    },
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{key}',
  }),
});


/***/ }),

/***/ 4717:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'events',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 2313:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'exchange_rates',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{rateId}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 1366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'file_links',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{link}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{link}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 6606:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const {multipartRequestDataProcessor} = __webpack_require__(4782);
const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'files',

  create: stripeMethod({
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    host: 'files.stripe.com',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{file}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  requestDataProcessor: multipartRequestDataProcessor,
});


/***/ }),

/***/ 5177:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'financial_connections/accounts',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{account}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  disconnect: stripeMethod({
    method: 'POST',
    path: '/{account}/disconnect',
  }),

  listOwners: stripeMethod({
    method: 'GET',
    path: '/{account}/owners',
    methodType: 'list',
  }),

  refresh: stripeMethod({
    method: 'POST',
    path: '/{account}/refresh',
  }),
});


/***/ }),

/***/ 5544:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'financial_connections/sessions',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{session}',
  }),
});


/***/ }),

/***/ 6829:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'identity/verification_reports',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{report}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 831:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'identity/verification_sessions',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{session}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{session}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{session}/cancel',
  }),

  redact: stripeMethod({
    method: 'POST',
    path: '/{session}/redact',
  }),
});


/***/ }),

/***/ 3225:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'invoiceitems',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{invoiceitem}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{invoiceitem}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{invoiceitem}',
  }),
});


/***/ }),

/***/ 1346:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'invoices',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{invoice}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{invoice}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{invoice}',
  }),

  finalizeInvoice: stripeMethod({
    method: 'POST',
    path: '/{invoice}/finalize',
  }),

  listUpcomingLines: stripeMethod({
    method: 'GET',
    path: '/upcoming/lines',
    methodType: 'list',
  }),

  markUncollectible: stripeMethod({
    method: 'POST',
    path: '/{invoice}/mark_uncollectible',
  }),

  pay: stripeMethod({
    method: 'POST',
    path: '/{invoice}/pay',
  }),

  retrieveUpcoming: stripeMethod({
    method: 'GET',
    path: '/upcoming',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),

  sendInvoice: stripeMethod({
    method: 'POST',
    path: '/{invoice}/send',
  }),

  voidInvoice: stripeMethod({
    method: 'POST',
    path: '/{invoice}/void',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{invoice}/lines',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 9754:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'issuing/authorizations',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{authorization}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{authorization}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  approve: stripeMethod({
    method: 'POST',
    path: '/{authorization}/approve',
  }),

  decline: stripeMethod({
    method: 'POST',
    path: '/{authorization}/decline',
  }),
});


/***/ }),

/***/ 865:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'issuing/cardholders',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{cardholder}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{cardholder}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 6523:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'issuing/cards',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{card}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{card}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 7774:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'issuing/disputes',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{dispute}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{dispute}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  submit: stripeMethod({
    method: 'POST',
    path: '/{dispute}/submit',
  }),
});


/***/ }),

/***/ 3440:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'issuing/transactions',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{transaction}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{transaction}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 3018:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'mandates',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{mandate}',
  }),
});


/***/ }),

/***/ 7360:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;
const utils = __webpack_require__(6893);

const oAuthHost = 'connect.stripe.com';

module.exports = StripeResource.extend({
  basePath: '/',

  authorizeUrl(params, options) {
    params = params || {};
    options = options || {};

    let path = 'oauth/authorize';

    // For Express accounts, the path changes
    if (options.express) {
      path = `express/${path}`;
    }

    if (!params.response_type) {
      params.response_type = 'code';
    }

    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }

    if (!params.scope) {
      params.scope = 'read_write';
    }

    return `https://${oAuthHost}/${path}?${utils.stringifyRequestData(params)}`;
  },

  token: stripeMethod({
    method: 'POST',
    path: 'oauth/token',
    host: oAuthHost,
  }),

  deauthorize(spec) {
    if (!spec.client_id) {
      spec.client_id = this._stripe.getClientId();
    }

    return stripeMethod({
      method: 'POST',
      path: 'oauth/deauthorize',
      host: oAuthHost,
    }).apply(this, arguments);
  },
});


/***/ }),

/***/ 6948:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'orders',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{id}/cancel',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{id}/line_items',
    methodType: 'list',
  }),

  reopen: stripeMethod({
    method: 'POST',
    path: '/{id}/reopen',
  }),

  submit: stripeMethod({
    method: 'POST',
    path: '/{id}/submit',
  }),
});


/***/ }),

/***/ 4922:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'payment_intents',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{intent}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{intent}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  applyCustomerBalance: stripeMethod({
    method: 'POST',
    path: '/{intent}/apply_customer_balance',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{intent}/cancel',
  }),

  capture: stripeMethod({
    method: 'POST',
    path: '/{intent}/capture',
  }),

  confirm: stripeMethod({
    method: 'POST',
    path: '/{intent}/confirm',
  }),

  incrementAuthorization: stripeMethod({
    method: 'POST',
    path: '/{intent}/increment_authorization',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),

  verifyMicrodeposits: stripeMethod({
    method: 'POST',
    path: '/{intent}/verify_microdeposits',
  }),
});


/***/ }),

/***/ 8305:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'payment_links',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{paymentLink}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{paymentLink}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{paymentLink}/line_items',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 3715:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'payment_methods',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{paymentMethod}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{paymentMethod}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  attach: stripeMethod({
    method: 'POST',
    path: '/{paymentMethod}/attach',
  }),

  detach: stripeMethod({
    method: 'POST',
    path: '/{paymentMethod}/detach',
  }),
});


/***/ }),

/***/ 2206:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'payouts',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{payout}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{payout}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{payout}/cancel',
  }),

  reverse: stripeMethod({
    method: 'POST',
    path: '/{payout}/reverse',
  }),
});


/***/ }),

/***/ 3099:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'plans',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{plan}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{plan}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{plan}',
  }),
});


/***/ }),

/***/ 2137:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'prices',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{price}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{price}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),
});


/***/ }),

/***/ 1122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'products',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{id}',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),
});


/***/ }),

/***/ 890:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'promotion_codes',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{promotionCode}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{promotionCode}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 5962:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'quotes',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{quote}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{quote}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  accept: stripeMethod({
    method: 'POST',
    path: '/{quote}/accept',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{quote}/cancel',
  }),

  finalizeQuote: stripeMethod({
    method: 'POST',
    path: '/{quote}/finalize',
  }),

  listComputedUpfrontLineItems: stripeMethod({
    method: 'GET',
    path: '/{quote}/computed_upfront_line_items',
    methodType: 'list',
  }),

  listLineItems: stripeMethod({
    method: 'GET',
    path: '/{quote}/line_items',
    methodType: 'list',
  }),

  pdf: stripeMethod({
    host: 'files.stripe.com',
    method: 'GET',
    path: '/{quote}/pdf',
    streaming: true,
  }),
});


/***/ }),

/***/ 4554:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'radar/early_fraud_warnings',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{earlyFraudWarning}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 539:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'radar/value_list_items',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{item}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{item}',
  }),
});


/***/ }),

/***/ 3056:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'radar/value_lists',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{valueList}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{valueList}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{valueList}',
  }),
});


/***/ }),

/***/ 6912:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'refunds',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{refund}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{refund}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{refund}/cancel',
  }),
});


/***/ }),

/***/ 8274:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'reporting/report_runs',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{reportRun}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 5679:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'reporting/report_types',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{reportType}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 4731:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'reviews',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{review}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  approve: stripeMethod({
    method: 'POST',
    path: '/{review}/approve',
  }),
});


/***/ }),

/***/ 8446:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'skus',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{id}',
  }),
});


/***/ }),

/***/ 4064:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'setup_attempts',

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 5721:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'setup_intents',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{intent}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{intent}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{intent}/cancel',
  }),

  confirm: stripeMethod({
    method: 'POST',
    path: '/{intent}/confirm',
  }),

  verifyMicrodeposits: stripeMethod({
    method: 'POST',
    path: '/{intent}/verify_microdeposits',
  }),
});


/***/ }),

/***/ 2152:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'shipping_rates',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{shippingRateToken}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{shippingRateToken}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 2131:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'sigma/scheduled_query_runs',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{scheduledQueryRun}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 628:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'sources',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{source}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{source}',
  }),

  listSourceTransactions: stripeMethod({
    method: 'GET',
    path: '/{source}/source_transactions',
    methodType: 'list',
  }),

  verify: stripeMethod({
    method: 'POST',
    path: '/{source}/verify',
  }),
});


/***/ }),

/***/ 1211:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'subscription_items',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{item}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{item}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{item}',
  }),

  createUsageRecord: stripeMethod({
    method: 'POST',
    path: '/{subscriptionItem}/usage_records',
  }),

  listUsageRecordSummaries: stripeMethod({
    method: 'GET',
    path: '/{subscriptionItem}/usage_record_summaries',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 4122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'subscription_schedules',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{schedule}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{schedule}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{schedule}/cancel',
  }),

  release: stripeMethod({
    method: 'POST',
    path: '/{schedule}/release',
  }),
});


/***/ }),

/***/ 6585:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'subscriptions',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{subscriptionExposedId}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{subscriptionExposedId}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'DELETE',
    path: '/{subscriptionExposedId}',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{subscriptionExposedId}',
  }),

  deleteDiscount: stripeMethod({
    method: 'DELETE',
    path: '/{subscriptionExposedId}/discount',
  }),

  search: stripeMethod({
    method: 'GET',
    path: '/search',
    methodType: 'search',
  }),
});


/***/ }),

/***/ 3671:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'tax_codes',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 4716:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'tax_rates',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{taxRate}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{taxRate}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 6372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'terminal/configurations',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{configuration}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{configuration}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{configuration}',
  }),
});


/***/ }),

/***/ 1301:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'terminal/connection_tokens',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),
});


/***/ }),

/***/ 5:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'terminal/locations',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{location}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{location}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{location}',
  }),
});


/***/ }),

/***/ 474:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'terminal/readers',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{reader}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{reader}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{reader}',
  }),

  cancelAction: stripeMethod({
    method: 'POST',
    path: '/{reader}/cancel_action',
  }),

  processPaymentIntent: stripeMethod({
    method: 'POST',
    path: '/{reader}/process_payment_intent',
  }),

  processSetupIntent: stripeMethod({
    method: 'POST',
    path: '/{reader}/process_setup_intent',
  }),

  setReaderDisplay: stripeMethod({
    method: 'POST',
    path: '/{reader}/set_reader_display',
  }),
});


/***/ }),

/***/ 6014:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/customers',

  fundCashBalance: stripeMethod({
    method: 'POST',
    path: '/{customer}/fund_cash_balance',
  }),
});


/***/ }),

/***/ 5615:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/issuing/cards',

  deliverCard: stripeMethod({
    method: 'POST',
    path: '/{card}/shipping/deliver',
  }),

  failCard: stripeMethod({
    method: 'POST',
    path: '/{card}/shipping/fail',
  }),

  returnCard: stripeMethod({
    method: 'POST',
    path: '/{card}/shipping/return',
  }),

  shipCard: stripeMethod({
    method: 'POST',
    path: '/{card}/shipping/ship',
  }),
});


/***/ }),

/***/ 499:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/refunds',

  expire: stripeMethod({
    method: 'POST',
    path: '/{refund}/expire',
  }),
});


/***/ }),

/***/ 5515:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/terminal/readers',

  presentPaymentMethod: stripeMethod({
    method: 'POST',
    path: '/{reader}/present_payment_method',
  }),
});


/***/ }),

/***/ 6709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/test_clocks',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{testClock}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{testClock}',
  }),

  advance: stripeMethod({
    method: 'POST',
    path: '/{testClock}/advance',
  }),
});


/***/ }),

/***/ 8111:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/treasury/inbound_transfers',

  fail: stripeMethod({
    method: 'POST',
    path: '/{id}/fail',
  }),

  returnInboundTransfer: stripeMethod({
    method: 'POST',
    path: '/{id}/return',
  }),

  succeed: stripeMethod({
    method: 'POST',
    path: '/{id}/succeed',
  }),
});


/***/ }),

/***/ 3773:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/treasury/outbound_payments',

  fail: stripeMethod({
    method: 'POST',
    path: '/{id}/fail',
  }),

  post: stripeMethod({
    method: 'POST',
    path: '/{id}/post',
  }),

  returnOutboundPayment: stripeMethod({
    method: 'POST',
    path: '/{id}/return',
  }),
});


/***/ }),

/***/ 9306:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/treasury/outbound_transfers',

  fail: stripeMethod({
    method: 'POST',
    path: '/{outboundTransfer}/fail',
  }),

  post: stripeMethod({
    method: 'POST',
    path: '/{outboundTransfer}/post',
  }),

  returnOutboundTransfer: stripeMethod({
    method: 'POST',
    path: '/{outboundTransfer}/return',
  }),
});


/***/ }),

/***/ 3321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/treasury/received_credits',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),
});


/***/ }),

/***/ 6779:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'test_helpers/treasury/received_debits',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),
});


/***/ }),

/***/ 1899:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'tokens',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{token}',
  }),
});


/***/ }),

/***/ 5526:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'topups',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{topup}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{topup}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{topup}/cancel',
  }),
});


/***/ }),

/***/ 3235:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'transfers',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{transfer}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{transfer}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  createReversal: stripeMethod({
    method: 'POST',
    path: '/{id}/reversals',
  }),

  retrieveReversal: stripeMethod({
    method: 'GET',
    path: '/{transfer}/reversals/{id}',
  }),

  updateReversal: stripeMethod({
    method: 'POST',
    path: '/{transfer}/reversals/{id}',
  }),

  listReversals: stripeMethod({
    method: 'GET',
    path: '/{id}/reversals',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 4072:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/credit_reversals',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{creditReversal}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 8469:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/debit_reversals',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{debitReversal}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 5288:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/financial_accounts',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{financialAccount}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{financialAccount}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  retrieveFeatures: stripeMethod({
    method: 'GET',
    path: '/{financialAccount}/features',
  }),

  updateFeatures: stripeMethod({
    method: 'POST',
    path: '/{financialAccount}/features',
  }),
});


/***/ }),

/***/ 43:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/inbound_transfers',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{inboundTransfer}/cancel',
  }),
});


/***/ }),

/***/ 5096:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/outbound_payments',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{id}/cancel',
  }),
});


/***/ }),

/***/ 91:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/outbound_transfers',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{outboundTransfer}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  cancel: stripeMethod({
    method: 'POST',
    path: '/{outboundTransfer}/cancel',
  }),
});


/***/ }),

/***/ 1520:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/received_credits',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 5566:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/received_debits',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 8247:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/transaction_entries',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 9519:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'treasury/transactions',

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),
});


/***/ }),

/***/ 792:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// File generated from our OpenAPI spec



const StripeResource = __webpack_require__(1781);
const stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({
  path: 'webhook_endpoints',

  create: stripeMethod({
    method: 'POST',
    path: '',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{webhookEndpoint}',
  }),

  update: stripeMethod({
    method: 'POST',
    path: '/{webhookEndpoint}',
  }),

  list: stripeMethod({
    method: 'GET',
    path: '',
    methodType: 'list',
  }),

  del: stripeMethod({
    method: 'DELETE',
    path: '/{webhookEndpoint}',
  }),
});


/***/ }),

/***/ 5514:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const resources = __webpack_require__(7943);

const DEFAULT_HOST = 'api.stripe.com';
const DEFAULT_PORT = '443';
const DEFAULT_BASE_PATH = '/v1/';
const DEFAULT_API_VERSION = null;

const DEFAULT_TIMEOUT = 80000;

Stripe.PACKAGE_VERSION = (__webpack_require__(5700)/* .version */ .i8);

const utils = __webpack_require__(6893);
const {determineProcessUserAgentProperties, emitWarning} = utils;

Stripe.USER_AGENT = {
  bindings_version: Stripe.PACKAGE_VERSION,
  lang: 'node',
  publisher: 'stripe',
  uname: null,
  typescript: false,
  ...determineProcessUserAgentProperties(),
};

/** @private */
Stripe._UNAME_CACHE = null;

const MAX_NETWORK_RETRY_DELAY_SEC = 2;
const INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;

const APP_INFO_PROPERTIES = ['name', 'version', 'url', 'partner_id'];
const ALLOWED_CONFIG_PROPERTIES = [
  'apiVersion',
  'typescript',
  'maxNetworkRetries',
  'httpAgent',
  'httpClient',
  'timeout',
  'host',
  'port',
  'protocol',
  'telemetry',
  'appInfo',
  'stripeAccount',
];

const EventEmitter = (__webpack_require__(2361).EventEmitter);

Stripe.StripeResource = __webpack_require__(1781);
Stripe.resources = resources;

const {HttpClient, HttpClientResponse} = __webpack_require__(7715);
Stripe.HttpClient = HttpClient;
Stripe.HttpClientResponse = HttpClientResponse;

const CryptoProvider = __webpack_require__(7848);
Stripe.CryptoProvider = CryptoProvider;

function Stripe(key, config = {}) {
  if (!(this instanceof Stripe)) {
    return new Stripe(key, config);
  }

  const props = this._getPropsFromConfig(config);

  Object.defineProperty(this, '_emitter', {
    value: new EventEmitter(),
    enumerable: false,
    configurable: false,
    writable: false,
  });

  this.VERSION = Stripe.PACKAGE_VERSION;

  this.on = this._emitter.on.bind(this._emitter);
  this.once = this._emitter.once.bind(this._emitter);
  this.off = this._emitter.removeListener.bind(this._emitter);

  if (
    props.protocol &&
    props.protocol !== 'https' &&
    (!props.host || /\.stripe\.com$/.test(props.host))
  ) {
    throw new Error(
      'The `https` protocol must be used when sending requests to `*.stripe.com`'
    );
  }

  const agent = props.httpAgent || null;

  this._api = {
    auth: null,
    host: props.host || DEFAULT_HOST,
    port: props.port || DEFAULT_PORT,
    protocol: props.protocol || 'https',
    basePath: DEFAULT_BASE_PATH,
    version: props.apiVersion || DEFAULT_API_VERSION,
    timeout: utils.validateInteger('timeout', props.timeout, DEFAULT_TIMEOUT),
    maxNetworkRetries: utils.validateInteger(
      'maxNetworkRetries',
      props.maxNetworkRetries,
      0
    ),
    agent: agent,
    httpClient: props.httpClient || Stripe.createNodeHttpClient(agent),
    dev: false,
    stripeAccount: props.stripeAccount || null,
  };

  const typescript = props.typescript || false;
  if (typescript !== Stripe.USER_AGENT.typescript) {
    // The mutation here is uncomfortable, but likely fastest;
    // serializing the user agent involves shelling out to the system,
    // and given some users may instantiate the library many times without switching between TS and non-TS,
    // we only want to incur the performance hit when that actually happens.
    Stripe.USER_AGENT.typescript = typescript;
  }

  if (props.appInfo) {
    this._setAppInfo(props.appInfo);
  }

  this._prepResources();
  this._setApiKey(key);

  this.errors = __webpack_require__(2367);
  this.webhooks = __webpack_require__(2989);

  this._prevRequestMetrics = [];
  this._enableTelemetry = props.telemetry !== false;

  // Expose StripeResource on the instance too
  this.StripeResource = Stripe.StripeResource;
}

Stripe.errors = __webpack_require__(2367);
Stripe.webhooks = __webpack_require__(2989);

Stripe.createNodeHttpClient = (agent) => {
  const {NodeHttpClient} = __webpack_require__(1959);
  return new NodeHttpClient(agent);
};

/**
 * Creates an HTTP client for issuing Stripe API requests which uses the Web
 * Fetch API.
 *
 * A fetch function can optionally be passed in as a parameter. If none is
 * passed, will default to the default `fetch` function in the global scope.
 */
Stripe.createFetchHttpClient = (fetchFn) => {
  const {FetchHttpClient} = __webpack_require__(5827);
  return new FetchHttpClient(fetchFn);
};

/**
 * Create a CryptoProvider which uses the built-in Node crypto libraries for
 * its crypto operations.
 */
Stripe.createNodeCryptoProvider = () => {
  const NodeCryptoProvider = __webpack_require__(3259);
  return new NodeCryptoProvider();
};

/**
 * Creates a CryptoProvider which uses the Subtle Crypto API from the Web
 * Crypto API spec for its crypto operations.
 *
 * A SubtleCrypto interface can optionally be passed in as a parameter. If none
 * is passed, will default to the default `crypto.subtle` object in the global
 * scope.
 */
Stripe.createSubtleCryptoProvider = (subtleCrypto) => {
  const SubtleCryptoProvider = __webpack_require__(5498);
  return new SubtleCryptoProvider(subtleCrypto);
};

Stripe.prototype = {
  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   host: 'example.com',
   *   port: '8080',
   *   protocol: 'http',
   * });
   *
   */
  setHost(host, port, protocol) {
    emitWarning(
      '`setHost` is deprecated. Use the `host` config option instead.'
    );
    this._setApiField('host', host);
    if (port) {
      this.setPort(port);
    }
    if (protocol) {
      this.setProtocol(protocol);
    }
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   protocol: 'http',
   * });
   *
   */
  setProtocol(protocol) {
    emitWarning(
      '`setProtocol` is deprecated. Use the `protocol` config option instead.'
    );
    this._setApiField('protocol', protocol.toLowerCase());
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   port: 3000,
   * });
   *
   */
  setPort(port) {
    emitWarning(
      '`setPort` is deprecated. Use the `port` config option instead.'
    );
    this._setApiField('port', port);
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   apiVersion: API_VERSION,
   * });
   *
   */
  setApiVersion(version) {
    emitWarning(
      '`setApiVersion` is deprecated. Use the `apiVersion` config or request option instead.'
    );
    if (version) {
      this._setApiField('version', version);
    }
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY);
   *
   * Or, for Stripe Connect, use `stripeAccount` instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   stripeAccount: 'acct_...',
   * });
   *
   * Or, to use a different apiKey on a given request:
   *
   * stripe.customers.create(params, {apiKey: 'sk_test_...'});
   */
  setApiKey(key) {
    emitWarning(
      '`setApiKey` is deprecated. Use the `apiKey` request option instead.'
    );
    this._setApiKey(key);
  },

  /**
   * @private
   */
  _setApiKey(key) {
    if (key) {
      this._setApiField('auth', `Bearer ${key}`);
    }
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   timeout: TIMEOUT_MS,
   * });
   */
  setTimeout(timeout) {
    emitWarning(
      '`setTimeout` is deprecated. Use the `timeout` config or request option instead.'
    );
    this._setApiField('timeout', timeout == null ? DEFAULT_TIMEOUT : timeout);
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   appInfo: {
   *     name: 'MyPlugin',
   *     version: '1.4.2',
   *     url: 'https://myplugin.com',
   *     partner_id: '1234',
   *   },
   * });
   */
  setAppInfo(info) {
    emitWarning(
      '`setAppInfo` is deprecated. Use the `appInfo` config option instead.'
    );
    this._setAppInfo(info);
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _setAppInfo(info) {
    if (info && typeof info !== 'object') {
      throw new Error('AppInfo must be an object.');
    }

    if (info && !info.name) {
      throw new Error('AppInfo.name is required');
    }

    info = info || {};

    const appInfo = APP_INFO_PROPERTIES.reduce((accum, prop) => {
      if (typeof info[prop] == 'string') {
        accum = accum || {};

        accum[prop] = info[prop];
      }

      return accum;
    }, undefined);

    this._appInfo = appInfo;
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const ProxyAgent = require('https-proxy-agent');
   * const stripe = new Stripe(API_KEY, {
   *   httpAgent: new ProxyAgent(process.env.http_proxy),
   * });
   *
   */
  setHttpAgent(agent) {
    emitWarning(
      '`setHttpAgent` is deprecated. Use the `httpAgent` config option instead.'
    );
    this._setApiField('agent', agent);
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _setApiField(key, value) {
    this._api[key] = value;
  },

  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getApiField(key) {
    return this._api[key];
  },

  setClientId(clientId) {
    this._clientId = clientId;
  },

  getClientId() {
    return this._clientId;
  },

  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getConstant: (c) => {
    switch (c) {
      case 'DEFAULT_HOST':
        return DEFAULT_HOST;
      case 'DEFAULT_PORT':
        return DEFAULT_PORT;
      case 'DEFAULT_BASE_PATH':
        return DEFAULT_BASE_PATH;
      case 'DEFAULT_API_VERSION':
        return DEFAULT_API_VERSION;
      case 'DEFAULT_TIMEOUT':
        return DEFAULT_TIMEOUT;
      case 'MAX_NETWORK_RETRY_DELAY_SEC':
        return MAX_NETWORK_RETRY_DELAY_SEC;
      case 'INITIAL_NETWORK_RETRY_DELAY_SEC':
        return INITIAL_NETWORK_RETRY_DELAY_SEC;
    }
    return Stripe[c];
  },

  getMaxNetworkRetries() {
    return this.getApiField('maxNetworkRetries');
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   maxNetworkRetries: 2,
   * });
   *
   */
  setMaxNetworkRetries(maxNetworkRetries) {
    this._setApiNumberField('maxNetworkRetries', maxNetworkRetries);
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _setApiNumberField(prop, n, defaultVal) {
    const val = utils.validateInteger(prop, n, defaultVal);

    this._setApiField(prop, val);
  },

  getMaxNetworkRetryDelay() {
    return MAX_NETWORK_RETRY_DELAY_SEC;
  },

  getInitialNetworkRetryDelay() {
    return INITIAL_NETWORK_RETRY_DELAY_SEC;
  },

  /**
   * @private
   */
  getUname(cb) {
    if (!Stripe._UNAME_CACHE) {
      Stripe._UNAME_CACHE = new Promise((resolve) => {
        utils.safeExec('uname -a', (err, uname) => {
          resolve(uname);
        });
      });
    }
    Stripe._UNAME_CACHE.then((uname) => cb(uname));
  },

  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent and uses a cached version for a slight
   * speed advantage.
   */
  getClientUserAgent(cb) {
    return this.getClientUserAgentSeeded(Stripe.USER_AGENT, cb);
  },

  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent by encoding a seeded object and
   * fetching a uname from the system.
   */
  getClientUserAgentSeeded(seed, cb) {
    this.getUname((uname) => {
      const userAgent = {};
      for (const field in seed) {
        userAgent[field] = encodeURIComponent(seed[field]);
      }

      // URI-encode in case there are unusual characters in the system's uname.
      userAgent.uname = encodeURIComponent(uname || 'UNKNOWN');

      const client = this.getApiField('httpClient');
      if (client) {
        userAgent.httplib = encodeURIComponent(client.getClientName());
      }

      if (this._appInfo) {
        userAgent.application = this._appInfo;
      }

      cb(JSON.stringify(userAgent));
    });
  },

  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getAppInfoAsString() {
    if (!this._appInfo) {
      return '';
    }

    let formatted = this._appInfo.name;

    if (this._appInfo.version) {
      formatted += `/${this._appInfo.version}`;
    }

    if (this._appInfo.url) {
      formatted += ` (${this._appInfo.url})`;
    }

    return formatted;
  },

  /**
   * @deprecated will be removed in a future major version. Use the config object instead:
   *
   * const stripe = new Stripe(API_KEY, {
   *   telemetry: false,
   * });
   *
   */
  setTelemetryEnabled(enableTelemetry) {
    emitWarning(
      '`setTelemetryEnabled` is deprecated. Use the `telemetry` config option instead.'
    );
    this._enableTelemetry = enableTelemetry;
  },

  getTelemetryEnabled() {
    return this._enableTelemetry;
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _prepResources() {
    for (const name in resources) {
      this[utils.pascalToCamelCase(name)] = new resources[name](this);
    }
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _getPropsFromConfig(config) {
    // If config is null or undefined, just bail early with no props
    if (!config) {
      return {};
    }

    // config can be an object or a string
    const isString = typeof config === 'string';
    const isObject = config === Object(config) && !Array.isArray(config);

    if (!isObject && !isString) {
      throw new Error('Config must either be an object or a string');
    }

    // If config is a string, we assume the old behavior of passing in a string representation of the api version
    if (isString) {
      return {
        apiVersion: config,
      };
    }

    // If config is an object, we assume the new behavior and make sure it doesn't contain any unexpected values
    const values = Object.keys(config).filter(
      (value) => !ALLOWED_CONFIG_PROPERTIES.includes(value)
    );

    if (values.length > 0) {
      throw new Error(
        `Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(
          ', '
        )}`
      );
    }

    return config;
  },
};

module.exports = Stripe;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Stripe = Stripe;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports["default"] = Stripe;


/***/ }),

/***/ 6893:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const EventEmitter = (__webpack_require__(2361).EventEmitter);
const qs = __webpack_require__(7104);
const crypto = __webpack_require__(6113);

const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

// Certain sandboxed environments (our known example right now are CloudFlare
// Workers) may make `child_process` unavailable. Because `exec` isn't critical
// to the operation of stripe-node, we handle this unavailability gracefully.
let exec = null;
try {
  exec = (__webpack_require__(2081).exec);
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

const OPTIONS_KEYS = [
  'apiKey',
  'idempotencyKey',
  'stripeAccount',
  'apiVersion',
  'maxNetworkRetries',
  'timeout',
  'host',
];

const DEPRECATED_OPTIONS = {
  api_key: 'apiKey',
  idempotency_key: 'idempotencyKey',
  stripe_account: 'stripeAccount',
  stripe_version: 'apiVersion',
  stripeVersion: 'apiVersion',
};
const DEPRECATED_OPTIONS_KEYS = Object.keys(DEPRECATED_OPTIONS);

const utils = (module.exports = {
  isOptionsHash(o) {
    return (
      o &&
      typeof o === 'object' &&
      (OPTIONS_KEYS.some((prop) => hasOwn(o, prop)) ||
        DEPRECATED_OPTIONS_KEYS.some((prop) => hasOwn(o, prop)))
    );
  },

  /**
   * Stringifies an Object, accommodating nested objects
   * (forming the conventional key 'parent[child]=value')
   */
  stringifyRequestData: (data) => {
    return (
      qs
        .stringify(data, {
          serializeDate: (d) => Math.floor(d.getTime() / 1000),
        })
        // Don't use strict form encoding by changing the square bracket control
        // characters back to their literals. This is fine by the server, and
        // makes these parameter strings easier to read.
        .replace(/%5B/g, '[')
        .replace(/%5D/g, ']')
    );
  },

  /**
   * Outputs a new function with interpolated object property values.
   * Use like so:
   *   const fn = makeURLInterpolator('some/url/{param1}/{param2}');
   *   fn({ param1: 123, param2: 456 }); // => 'some/url/123/456'
   */
  makeURLInterpolator: (() => {
    const rc = {
      '\n': '\\n',
      '"': '\\"',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    return (str) => {
      const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
      return (outputs) => {
        return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) =>
          encodeURIComponent(outputs[$1] || '')
        );
      };
    };
  })(),

  extractUrlParams: (path) => {
    const params = path.match(/\{\w+\}/g);
    if (!params) {
      return [];
    }

    return params.map((param) => param.replace(/[{}]/g, ''));
  },

  /**
   * Return the data argument from a list of arguments
   *
   * @param {object[]} args
   * @returns {object}
   */
  getDataFromArgs(args) {
    if (!Array.isArray(args) || !args[0] || typeof args[0] !== 'object') {
      return {};
    }

    if (!utils.isOptionsHash(args[0])) {
      return args.shift();
    }

    const argKeys = Object.keys(args[0]);

    const optionKeysInArgs = argKeys.filter((key) =>
      OPTIONS_KEYS.includes(key)
    );

    // In some cases options may be the provided as the first argument.
    // Here we're detecting a case where there are two distinct arguments
    // (the first being args and the second options) and with known
    // option keys in the first so that we can warn the user about it.
    if (
      optionKeysInArgs.length > 0 &&
      optionKeysInArgs.length !== argKeys.length
    ) {
      emitWarning(
        `Options found in arguments (${optionKeysInArgs.join(
          ', '
        )}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options.`
      );
    }

    return {};
  },

  /**
   * Return the options hash from a list of arguments
   */
  getOptionsFromArgs: (args) => {
    const opts = {
      auth: null,
      headers: {},
      settings: {},
    };
    if (args.length > 0) {
      const arg = args[args.length - 1];
      if (typeof arg === 'string') {
        opts.auth = args.pop();
      } else if (utils.isOptionsHash(arg)) {
        const params = {...args.pop()};

        const extraKeys = Object.keys(params).filter(
          (key) => !OPTIONS_KEYS.includes(key)
        );

        if (extraKeys.length) {
          const nonDeprecated = extraKeys.filter((key) => {
            if (!DEPRECATED_OPTIONS[key]) {
              return true;
            }
            const newParam = DEPRECATED_OPTIONS[key];
            if (params[newParam]) {
              throw Error(
                `Both '${newParam}' and '${key}' were provided; please remove '${key}', which is deprecated.`
              );
            }
            /**
             * TODO turn this into a hard error in a future major version (once we have fixed our docs).
             */
            emitWarning(`'${key}' is deprecated; use '${newParam}' instead.`);
            params[newParam] = params[key];
          });
          if (nonDeprecated.length) {
            emitWarning(
              `Invalid options found (${extraKeys.join(', ')}); ignoring.`
            );
          }
        }

        if (params.apiKey) {
          opts.auth = params.apiKey;
        }
        if (params.idempotencyKey) {
          opts.headers['Idempotency-Key'] = params.idempotencyKey;
        }
        if (params.stripeAccount) {
          opts.headers['Stripe-Account'] = params.stripeAccount;
        }
        if (params.apiVersion) {
          opts.headers['Stripe-Version'] = params.apiVersion;
        }
        if (Number.isInteger(params.maxNetworkRetries)) {
          opts.settings.maxNetworkRetries = params.maxNetworkRetries;
        }
        if (Number.isInteger(params.timeout)) {
          opts.settings.timeout = params.timeout;
        }
        if (params.host) {
          opts.host = params.host;
        }
      }
    }
    return opts;
  },

  /**
   * Provide simple "Class" extension mechanism
   */
  protoExtend(sub) {
    const Super = this;
    const Constructor = hasOwn(sub, 'constructor')
      ? sub.constructor
      : function(...args) {
          Super.apply(this, args);
        };

    // This initialization logic is somewhat sensitive to be compatible with
    // divergent JS implementations like the one found in Qt. See here for more
    // context:
    //
    // https://github.com/stripe/stripe-node/pull/334
    Object.assign(Constructor, Super);
    Constructor.prototype = Object.create(Super.prototype);
    Object.assign(Constructor.prototype, sub);

    return Constructor;
  },

  /**
   * Secure compare, from https://github.com/freewil/scmp
   */
  secureCompare: (a, b) => {
    a = Buffer.from(a);
    b = Buffer.from(b);

    // return early here if buffer lengths are not equal since timingSafeEqual
    // will throw if buffer lengths are not equal
    if (a.length !== b.length) {
      return false;
    }

    // use crypto.timingSafeEqual if available (since Node.js v6.6.0),
    // otherwise use our own scmp-internal function.
    if (crypto.timingSafeEqual) {
      return crypto.timingSafeEqual(a, b);
    }

    const len = a.length;
    let result = 0;

    for (let i = 0; i < len; ++i) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  },

  /**
   * Remove empty values from an object
   */
  removeNullish: (obj) => {
    if (typeof obj !== 'object') {
      throw new Error('Argument must be an object');
    }

    return Object.keys(obj).reduce((result, key) => {
      if (obj[key] != null) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  /**
   * Normalize standard HTTP Headers:
   * {'foo-bar': 'hi'}
   * becomes
   * {'Foo-Bar': 'hi'}
   */
  normalizeHeaders: (obj) => {
    if (!(obj && typeof obj === 'object')) {
      return obj;
    }

    return Object.keys(obj).reduce((result, header) => {
      result[utils.normalizeHeader(header)] = obj[header];
      return result;
    }, {});
  },

  /**
   * Stolen from https://github.com/marten-de-vries/header-case-normalizer/blob/master/index.js#L36-L41
   * without the exceptions which are irrelevant to us.
   */
  normalizeHeader: (header) => {
    return header
      .split('-')
      .map(
        (text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
      )
      .join('-');
  },

  /**
   * Determine if file data is a derivative of EventEmitter class.
   * https://nodejs.org/api/events.html#events_events
   */
  checkForStream: (obj) => {
    if (obj.file && obj.file.data) {
      return obj.file.data instanceof EventEmitter;
    }
    return false;
  },

  callbackifyPromiseWithTimeout: (promise, callback) => {
    if (callback) {
      // Ensure callback is called outside of promise stack.
      return promise.then(
        (res) => {
          setTimeout(() => {
            callback(null, res);
          }, 0);
        },
        (err) => {
          setTimeout(() => {
            callback(err, null);
          }, 0);
        }
      );
    }

    return promise;
  },

  /**
   * Allow for special capitalization cases (such as OAuth)
   */
  pascalToCamelCase: (name) => {
    if (name === 'OAuth') {
      return 'oauth';
    } else {
      return name[0].toLowerCase() + name.substring(1);
    }
  },

  emitWarning,

  /**
   * Node's built in `exec` function sometimes throws outright,
   * and sometimes has a callback with an error,
   * depending on the type of error.
   *
   * This unifies that interface.
   */
  safeExec: (cmd, cb) => {
    // Occurs if we couldn't load the `child_process` module, which might
    // happen in certain sandboxed environments like a CloudFlare Worker.
    if (utils._exec === null) {
      cb(new Error('exec not available'), null);
      return;
    }

    try {
      utils._exec(cmd, cb);
    } catch (e) {
      cb(e, null);
    }
  },

  // For mocking in tests.
  _exec: exec,

  isObject: (obj) => {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
  },

  // For use in multipart requests
  flattenAndStringify: (data) => {
    const result = {};

    const step = (obj, prevKey) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];

        const newKey = prevKey ? `${prevKey}[${key}]` : key;

        if (utils.isObject(value)) {
          if (!Buffer.isBuffer(value) && !value.hasOwnProperty('data')) {
            // Non-buffer non-file Objects are recursively flattened
            return step(value, newKey);
          } else {
            // Buffers and file objects are stored without modification
            result[newKey] = value;
          }
        } else {
          // Primitives are converted to strings
          result[newKey] = String(value);
        }
      });
    };

    step(data);

    return result;
  },

  /**
   * https://stackoverflow.com/a/2117523
   */
  uuid4: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  validateInteger: (name, n, defaultVal) => {
    if (!Number.isInteger(n)) {
      if (defaultVal !== undefined) {
        return defaultVal;
      } else {
        throw new Error(`${name} must be an integer`);
      }
    }

    return n;
  },

  determineProcessUserAgentProperties: () => {
    return typeof process === 'undefined'
      ? {}
      : {
          lang_version: process.version,
          platform: process.platform,
        };
  },
});

function emitWarning(warning) {
  if (typeof process.emitWarning !== 'function') {
    return console.warn(
      `Stripe: ${warning}`
    ); /* eslint-disable-line no-console */
  }

  return process.emitWarning(warning, 'Stripe');
}


/***/ }),

/***/ 5700:
/***/ ((module) => {

"use strict";
module.exports = {"i8":"10.2.0"};

/***/ })

};
;