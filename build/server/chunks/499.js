exports.id = 499;
exports.ids = [499];
exports.modules = {

/***/ 9851:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.NextAuthHandler = NextAuthHandler;

var _logger = _interopRequireWildcard(__webpack_require__(9117));

var _detectHost = __webpack_require__(5644);

var routes = _interopRequireWildcard(__webpack_require__(6945));

var _pages = _interopRequireDefault(__webpack_require__(4015));

var _init = __webpack_require__(2095);

var _assert = __webpack_require__(3282);

var _cookie = __webpack_require__(6593);

var _cookie2 = __webpack_require__(4802);

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function getBody(req) {
  try {
    return await req.json();
  } catch (_unused) {}
}

async function toInternalRequest(req) {
  if (req instanceof Request) {
    var _req$headers$get, _url$searchParams$get, _headers$xForwarded;

    const url = new URL(req.url);
    const nextauth = url.pathname.split("/").slice(3);
    const headers = Object.fromEntries(req.headers.entries());
    const query = Object.fromEntries(url.searchParams.entries());
    query.nextauth = nextauth;
    return {
      action: nextauth[0],
      method: req.method,
      headers,
      body: await getBody(req),
      cookies: (0, _cookie2.parse)((_req$headers$get = req.headers.get("cookie")) !== null && _req$headers$get !== void 0 ? _req$headers$get : ""),
      providerId: nextauth[1],
      error: (_url$searchParams$get = url.searchParams.get("error")) !== null && _url$searchParams$get !== void 0 ? _url$searchParams$get : nextauth[1],
      host: (0, _detectHost.detectHost)((_headers$xForwarded = headers["x-forwarded-host"]) !== null && _headers$xForwarded !== void 0 ? _headers$xForwarded : headers.host),
      query
    };
  }

  return req;
}

async function NextAuthHandler(params) {
  var _req$body$callbackUrl, _req$body, _req$query2, _req$body2;

  const {
    options: userOptions,
    req: incomingRequest
  } = params;
  const req = await toInternalRequest(incomingRequest);
  (0, _logger.setLogger)(userOptions.logger, userOptions.debug);
  const assertionResult = (0, _assert.assertConfig)({
    options: userOptions,
    req
  });

  if (Array.isArray(assertionResult)) {
    assertionResult.forEach(_logger.default.warn);
  } else if (assertionResult instanceof Error) {
    var _req$query;

    const {
      pages,
      theme
    } = userOptions;

    _logger.default.error(assertionResult.code, assertionResult);

    const authOnErrorPage = (pages === null || pages === void 0 ? void 0 : pages.error) && req.action === "signin" && ((_req$query = req.query) === null || _req$query === void 0 ? void 0 : _req$query.callbackUrl.startsWith(pages.error));

    if (!(pages !== null && pages !== void 0 && pages.error) || authOnErrorPage) {
      if (authOnErrorPage) {
        _logger.default.error("AUTH_ON_ERROR_PAGE_ERROR", new Error(`The error page ${pages === null || pages === void 0 ? void 0 : pages.error} should not require authentication`));
      }

      const render = (0, _pages.default)({
        theme
      });
      return render.error({
        error: "configuration"
      });
    }

    return {
      redirect: `${pages.error}?error=Configuration`
    };
  }

  const {
    action,
    providerId,
    error,
    method = "GET"
  } = req;
  const {
    options,
    cookies
  } = await (0, _init.init)({
    userOptions,
    action,
    providerId,
    host: req.host,
    callbackUrl: (_req$body$callbackUrl = (_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.callbackUrl) !== null && _req$body$callbackUrl !== void 0 ? _req$body$callbackUrl : (_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.callbackUrl,
    csrfToken: (_req$body2 = req.body) === null || _req$body2 === void 0 ? void 0 : _req$body2.csrfToken,
    cookies: req.cookies,
    isPost: method === "POST"
  });
  const sessionStore = new _cookie.SessionStore(options.cookies.sessionToken, req, options.logger);

  if (method === "GET") {
    const render = (0, _pages.default)({ ...options,
      query: req.query,
      cookies
    });
    const {
      pages
    } = options;

    switch (action) {
      case "providers":
        return await routes.providers(options.providers);

      case "session":
        {
          const session = await routes.session({
            options,
            sessionStore
          });
          if (session.cookies) cookies.push(...session.cookies);
          return { ...session,
            cookies
          };
        }

      case "csrf":
        return {
          headers: [{
            key: "Content-Type",
            value: "application/json"
          }],
          body: {
            csrfToken: options.csrfToken
          },
          cookies
        };

      case "signin":
        if (pages.signIn) {
          let signinUrl = `${pages.signIn}${pages.signIn.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(options.callbackUrl)}`;
          if (error) signinUrl = `${signinUrl}&error=${encodeURIComponent(error)}`;
          return {
            redirect: signinUrl,
            cookies
          };
        }

        return render.signin();

      case "signout":
        if (pages.signOut) return {
          redirect: pages.signOut,
          cookies
        };
        return render.signout();

      case "callback":
        if (options.provider) {
          const callback = await routes.callback({
            body: req.body,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
            method,
            options,
            sessionStore
          });
          if (callback.cookies) cookies.push(...callback.cookies);
          return { ...callback,
            cookies
          };
        }

        break;

      case "verify-request":
        if (pages.verifyRequest) {
          return {
            redirect: pages.verifyRequest,
            cookies
          };
        }

        return render.verifyRequest();

      case "error":
        if (["Signin", "OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin", "SessionRequired"].includes(error)) {
          return {
            redirect: `${options.url}/signin?error=${error}`,
            cookies
          };
        }

        if (pages.error) {
          return {
            redirect: `${pages.error}${pages.error.includes("?") ? "&" : "?"}error=${error}`,
            cookies
          };
        }

        return render.error({
          error: error
        });

      default:
    }
  } else if (method === "POST") {
    switch (action) {
      case "signin":
        if (options.csrfTokenVerified && options.provider) {
          const signin = await routes.signin({
            query: req.query,
            body: req.body,
            options
          });
          if (signin.cookies) cookies.push(...signin.cookies);
          return { ...signin,
            cookies
          };
        }

        return {
          redirect: `${options.url}/signin?csrf=true`,
          cookies
        };

      case "signout":
        if (options.csrfTokenVerified) {
          const signout = await routes.signout({
            options,
            sessionStore
          });
          if (signout.cookies) cookies.push(...signout.cookies);
          return { ...signout,
            cookies
          };
        }

        return {
          redirect: `${options.url}/signout?csrf=true`,
          cookies
        };

      case "callback":
        if (options.provider) {
          if (options.provider.type === "credentials" && !options.csrfTokenVerified) {
            return {
              redirect: `${options.url}/signin?csrf=true`,
              cookies
            };
          }

          const callback = await routes.callback({
            body: req.body,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
            method,
            options,
            sessionStore
          });
          if (callback.cookies) cookies.push(...callback.cookies);
          return { ...callback,
            cookies
          };
        }

        break;

      case "_log":
        if (userOptions.logger) {
          try {
            var _req$body3;

            const {
              code,
              level,
              ...metadata
            } = (_req$body3 = req.body) !== null && _req$body3 !== void 0 ? _req$body3 : {};

            _logger.default[level](code, metadata);
          } catch (error) {
            _logger.default.error("LOGGER_ERROR", error);
          }
        }

        return {};

      default:
    }
  }

  return {
    status: 400,
    body: `Error: This action with HTTP ${method} is not supported by NextAuth.js`
  };
}

/***/ }),

/***/ 2095:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.init = init;

var _logger = _interopRequireDefault(__webpack_require__(9117));

var _parseUrl = _interopRequireDefault(__webpack_require__(1511));

var _errors = __webpack_require__(3683);

var _providers = _interopRequireDefault(__webpack_require__(8643));

var _utils = __webpack_require__(2117);

var cookie = _interopRequireWildcard(__webpack_require__(6593));

var jwt = _interopRequireWildcard(__webpack_require__(6832));

var _defaultCallbacks = __webpack_require__(5346);

var _csrfToken = __webpack_require__(6578);

var _callbackUrl = __webpack_require__(3130);

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function init({
  userOptions,
  providerId,
  action,
  host,
  cookies: reqCookies,
  callbackUrl: reqCallbackUrl,
  csrfToken: reqCsrfToken,
  isPost
}) {
  var _userOptions$useSecur, _userOptions$events;

  const url = (0, _parseUrl.default)(host);
  const secret = (0, _utils.createSecret)({
    userOptions,
    url
  });
  const {
    providers,
    provider
  } = (0, _providers.default)({
    providers: userOptions.providers,
    url,
    providerId
  });
  const maxAge = 30 * 24 * 60 * 60;
  const options = {
    debug: false,
    pages: {},
    theme: {
      colorScheme: "auto",
      logo: "",
      brandColor: "",
      buttonText: ""
    },
    ...userOptions,
    url,
    action,
    provider,
    cookies: { ...cookie.defaultCookies((_userOptions$useSecur = userOptions.useSecureCookies) !== null && _userOptions$useSecur !== void 0 ? _userOptions$useSecur : url.base.startsWith("https://")),
      ...userOptions.cookies
    },
    secret,
    providers,
    session: {
      strategy: userOptions.adapter ? "database" : "jwt",
      maxAge,
      updateAge: 24 * 60 * 60,
      ...userOptions.session
    },
    jwt: {
      secret,
      maxAge,
      encode: jwt.encode,
      decode: jwt.decode,
      ...userOptions.jwt
    },
    events: (0, _errors.eventsErrorHandler)((_userOptions$events = userOptions.events) !== null && _userOptions$events !== void 0 ? _userOptions$events : {}, _logger.default),
    adapter: (0, _errors.adapterErrorHandler)(userOptions.adapter, _logger.default),
    callbacks: { ..._defaultCallbacks.defaultCallbacks,
      ...userOptions.callbacks
    },
    logger: _logger.default,
    callbackUrl: url.origin
  };
  const cookies = [];
  const {
    csrfToken,
    cookie: csrfCookie,
    csrfTokenVerified
  } = (0, _csrfToken.createCSRFToken)({
    options,
    cookieValue: reqCookies === null || reqCookies === void 0 ? void 0 : reqCookies[options.cookies.csrfToken.name],
    isPost,
    bodyValue: reqCsrfToken
  });
  options.csrfToken = csrfToken;
  options.csrfTokenVerified = csrfTokenVerified;

  if (csrfCookie) {
    cookies.push({
      name: options.cookies.csrfToken.name,
      value: csrfCookie,
      options: options.cookies.csrfToken.options
    });
  }

  const {
    callbackUrl,
    callbackUrlCookie
  } = await (0, _callbackUrl.createCallbackUrl)({
    options,
    cookieValue: reqCookies === null || reqCookies === void 0 ? void 0 : reqCookies[options.cookies.callbackUrl.name],
    paramValue: reqCallbackUrl
  });
  options.callbackUrl = callbackUrl;

  if (callbackUrlCookie) {
    cookies.push({
      name: options.cookies.callbackUrl.name,
      value: callbackUrlCookie,
      options: options.cookies.callbackUrl.options
    });
  }

  return {
    options,
    cookies
  };
}

/***/ }),

/***/ 3282:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.assertConfig = assertConfig;

var _errors = __webpack_require__(3683);

var _parseUrl = _interopRequireDefault(__webpack_require__(1511));

var _cookie = __webpack_require__(6593);

let warned = false;

function isValidHttpUrl(url, baseUrl) {
  try {
    return /^https?:/.test(new URL(url, url.startsWith("/") ? baseUrl : undefined).protocol);
  } catch (_unused) {
    return false;
  }
}

function assertConfig(params) {
  var _req$query, _req$query2, _options$useSecureCoo, _req$cookies, _options$cookies$call, _options$cookies, _options$cookies$call2;

  const {
    options,
    req
  } = params;
  const warnings = [];

  if (!warned) {
    if (!req.host) warnings.push("NEXTAUTH_URL");
    if (!options.secret && "production" !== "production") {}
    if (options.debug) warnings.push("DEBUG_ENABLED");
  }

  if (!options.secret && "production" === "production") {
    return new _errors.MissingSecret("Please define a `secret` in production.");
  }

  if (!((_req$query = req.query) !== null && _req$query !== void 0 && _req$query.nextauth) && !req.action) {
    return new _errors.MissingAPIRoute("Cannot find [...nextauth].{js,ts} in `/pages/api/auth`. Make sure the filename is written correctly.");
  }

  const callbackUrlParam = (_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.callbackUrl;
  const url = (0, _parseUrl.default)(req.host);

  if (callbackUrlParam && !isValidHttpUrl(callbackUrlParam, url.base)) {
    return new _errors.InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlParam}`);
  }

  const {
    callbackUrl: defaultCallbackUrl
  } = (0, _cookie.defaultCookies)((_options$useSecureCoo = options.useSecureCookies) !== null && _options$useSecureCoo !== void 0 ? _options$useSecureCoo : url.base.startsWith("https://"));
  const callbackUrlCookie = (_req$cookies = req.cookies) === null || _req$cookies === void 0 ? void 0 : _req$cookies[(_options$cookies$call = (_options$cookies = options.cookies) === null || _options$cookies === void 0 ? void 0 : (_options$cookies$call2 = _options$cookies.callbackUrl) === null || _options$cookies$call2 === void 0 ? void 0 : _options$cookies$call2.name) !== null && _options$cookies$call !== void 0 ? _options$cookies$call : defaultCallbackUrl.name];

  if (callbackUrlCookie && !isValidHttpUrl(callbackUrlCookie, url.base)) {
    return new _errors.InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlCookie}`);
  }

  let hasCredentials, hasEmail;
  let hasTwitterOAuth2;

  for (const provider of options.providers) {
    if (provider.type === "credentials") hasCredentials = true;else if (provider.type === "email") hasEmail = true;else if (provider.id === "twitter" && provider.version === "2.0") hasTwitterOAuth2 = true;
  }

  if (hasCredentials) {
    var _options$session;

    const dbStrategy = ((_options$session = options.session) === null || _options$session === void 0 ? void 0 : _options$session.strategy) === "database";
    const onlyCredentials = !options.providers.some(p => p.type !== "credentials");

    if (dbStrategy && onlyCredentials) {
      return new _errors.UnsupportedStrategy("Signin in with credentials only supported if JWT strategy is enabled");
    }

    const credentialsNoAuthorize = options.providers.some(p => p.type === "credentials" && !p.authorize);

    if (credentialsNoAuthorize) {
      return new _errors.MissingAuthorize("Must define an authorize() handler to use credentials authentication provider");
    }
  }

  if (hasEmail && !options.adapter) {
    return new _errors.MissingAdapter("E-mail login requires an adapter.");
  }

  if (!warned) {
    if (hasTwitterOAuth2) warnings.push("TWITTER_OAUTH_2_BETA");
    warned = true;
  }

  return warnings;
}

/***/ }),

/***/ 3939:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = callbackHandler;

var _crypto = __webpack_require__(6113);

var _errors = __webpack_require__(3683);

var _utils = __webpack_require__(2117);

async function callbackHandler(params) {
  const {
    sessionToken,
    profile,
    account,
    options
  } = params;
  if (!(account !== null && account !== void 0 && account.providerAccountId) || !account.type) throw new Error("Missing or invalid provider account");
  if (!["email", "oauth"].includes(account.type)) throw new Error("Provider not supported");
  const {
    adapter,
    jwt,
    events,
    session: {
      strategy: sessionStrategy
    }
  } = options;

  if (!adapter) {
    return {
      user: profile,
      account,
      session: {}
    };
  }

  const {
    createUser,
    updateUser,
    getUser,
    getUserByAccount,
    getUserByEmail,
    linkAccount,
    createSession,
    getSessionAndUser,
    deleteSession
  } = adapter;
  let session = null;
  let user = null;
  let isNewUser = false;
  const useJwtSession = sessionStrategy === "jwt";

  if (sessionToken) {
    if (useJwtSession) {
      try {
        session = await jwt.decode({ ...jwt,
          token: sessionToken
        });

        if (session && "sub" in session && session.sub) {
          user = await getUser(session.sub);
        }
      } catch (_unused) {}
    } else {
      const userAndSession = await getSessionAndUser(sessionToken);

      if (userAndSession) {
        session = userAndSession.session;
        user = userAndSession.user;
      }
    }
  }

  if (account.type === "email") {
    const userByEmail = profile.email ? await getUserByEmail(profile.email) : null;

    if (userByEmail) {
      var _user, _events$updateUser;

      if (((_user = user) === null || _user === void 0 ? void 0 : _user.id) !== userByEmail.id && !useJwtSession && sessionToken) {
        await deleteSession(sessionToken);
      }

      user = await updateUser({
        id: userByEmail.id,
        emailVerified: new Date()
      });
      await ((_events$updateUser = events.updateUser) === null || _events$updateUser === void 0 ? void 0 : _events$updateUser.call(events, {
        user
      }));
    } else {
      var _events$createUser;

      const newUser = { ...profile,
        emailVerified: new Date()
      };
      delete newUser.id;
      user = await createUser(newUser);
      await ((_events$createUser = events.createUser) === null || _events$createUser === void 0 ? void 0 : _events$createUser.call(events, {
        user
      }));
      isNewUser = true;
    }

    session = useJwtSession ? {} : await createSession({
      sessionToken: generateSessionToken(),
      userId: user.id,
      expires: (0, _utils.fromDate)(options.session.maxAge)
    });
    return {
      session,
      user,
      isNewUser
    };
  } else if (account.type === "oauth") {
    const userByAccount = await getUserByAccount({
      providerAccountId: account.providerAccountId,
      provider: account.provider
    });

    if (userByAccount) {
      if (user) {
        if (userByAccount.id === user.id) {
          return {
            session,
            user,
            isNewUser
          };
        }

        throw new _errors.AccountNotLinkedError("The account is already associated with another user");
      }

      session = useJwtSession ? {} : await createSession({
        sessionToken: generateSessionToken(),
        userId: userByAccount.id,
        expires: (0, _utils.fromDate)(options.session.maxAge)
      });
      return {
        session,
        user: userByAccount,
        isNewUser
      };
    } else {
      var _events$createUser2, _events$linkAccount2;

      if (user) {
        var _events$linkAccount;

        await linkAccount({ ...account,
          userId: user.id
        });
        await ((_events$linkAccount = events.linkAccount) === null || _events$linkAccount === void 0 ? void 0 : _events$linkAccount.call(events, {
          user,
          account,
          profile
        }));
        return {
          session,
          user,
          isNewUser
        };
      }

      const userByEmail = profile.email ? await getUserByEmail(profile.email) : null;

      if (userByEmail) {
        throw new _errors.AccountNotLinkedError("Another account already exists with the same e-mail address");
      }

      const newUser = { ...profile,
        emailVerified: null
      };
      delete newUser.id;
      user = await createUser(newUser);
      await ((_events$createUser2 = events.createUser) === null || _events$createUser2 === void 0 ? void 0 : _events$createUser2.call(events, {
        user
      }));
      await linkAccount({ ...account,
        userId: user.id
      });
      await ((_events$linkAccount2 = events.linkAccount) === null || _events$linkAccount2 === void 0 ? void 0 : _events$linkAccount2.call(events, {
        user,
        account,
        profile
      }));
      session = useJwtSession ? {} : await createSession({
        sessionToken: generateSessionToken(),
        userId: user.id,
        expires: (0, _utils.fromDate)(options.session.maxAge)
      });
      return {
        session,
        user,
        isNewUser: true
      };
    }
  }
}

function generateSessionToken() {
  var _randomUUID;

  return (_randomUUID = _crypto.randomUUID === null || _crypto.randomUUID === void 0 ? void 0 : (0, _crypto.randomUUID)()) !== null && _randomUUID !== void 0 ? _randomUUID : (0, _crypto.randomBytes)(32).toString("hex");
}

/***/ }),

/***/ 3130:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createCallbackUrl = createCallbackUrl;

async function createCallbackUrl({
  options,
  paramValue,
  cookieValue
}) {
  const {
    url,
    callbacks
  } = options;
  let callbackUrl = url.origin;

  if (paramValue) {
    callbackUrl = await callbacks.redirect({
      url: paramValue,
      baseUrl: url.origin
    });
  } else if (cookieValue) {
    callbackUrl = await callbacks.redirect({
      url: cookieValue,
      baseUrl: url.origin
    });
  }

  return {
    callbackUrl,
    callbackUrlCookie: callbackUrl !== cookieValue ? callbackUrl : undefined
  };
}

/***/ }),

/***/ 6593:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.SessionStore = void 0;
exports.defaultCookies = defaultCookies;

var _classPrivateFieldGet3 = _interopRequireDefault(__webpack_require__(3166));

var _classPrivateFieldSet2 = _interopRequireDefault(__webpack_require__(4141));

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const ALLOWED_COOKIE_SIZE = 4096;
const ESTIMATED_EMPTY_COOKIE_SIZE = 163;
const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;

function defaultCookies(useSecureCookies) {
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  return {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    }
  };
}

var _chunks = new WeakMap();

var _option = new WeakMap();

var _logger = new WeakMap();

var _chunk = new WeakSet();

var _clean = new WeakSet();

class SessionStore {
  constructor(option, req, logger) {
    _classPrivateMethodInitSpec(this, _clean);

    _classPrivateMethodInitSpec(this, _chunk);

    _classPrivateFieldInitSpec(this, _chunks, {
      writable: true,
      value: {}
    });

    _classPrivateFieldInitSpec(this, _option, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _logger, {
      writable: true,
      value: void 0
    });

    (0, _classPrivateFieldSet2.default)(this, _logger, logger);
    (0, _classPrivateFieldSet2.default)(this, _option, option);
    const {
      cookies: _cookies
    } = req;
    const {
      name: cookieName
    } = option;

    if (_cookies instanceof Map) {
      for (const name of _cookies.keys()) {
        if (name.startsWith(cookieName)) (0, _classPrivateFieldGet3.default)(this, _chunks)[name] = _cookies.get(name);
      }
    } else {
      for (const name in _cookies) {
        if (name.startsWith(cookieName)) (0, _classPrivateFieldGet3.default)(this, _chunks)[name] = _cookies[name];
      }
    }
  }

  get value() {
    var _Object$values;

    return (_Object$values = Object.values((0, _classPrivateFieldGet3.default)(this, _chunks))) === null || _Object$values === void 0 ? void 0 : _Object$values.join("");
  }

  chunk(value, options) {
    const cookies = _classPrivateMethodGet(this, _clean, _clean2).call(this);

    const chunked = _classPrivateMethodGet(this, _chunk, _chunk2).call(this, {
      name: (0, _classPrivateFieldGet3.default)(this, _option).name,
      value,
      options: { ...(0, _classPrivateFieldGet3.default)(this, _option).options,
        ...options
      }
    });

    for (const chunk of chunked) {
      cookies[chunk.name] = chunk;
    }

    return Object.values(cookies);
  }

  clean() {
    return Object.values(_classPrivateMethodGet(this, _clean, _clean2).call(this));
  }

}

exports.SessionStore = SessionStore;

function _chunk2(cookie) {
  const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE);

  if (chunkCount === 1) {
    (0, _classPrivateFieldGet3.default)(this, _chunks)[cookie.name] = cookie.value;
    return [cookie];
  }

  const cookies = [];

  for (let i = 0; i < chunkCount; i++) {
    const name = `${cookie.name}.${i}`;
    const value = cookie.value.substr(i * CHUNK_SIZE, CHUNK_SIZE);
    cookies.push({ ...cookie,
      name,
      value
    });
    (0, _classPrivateFieldGet3.default)(this, _chunks)[name] = value;
  }

  (0, _classPrivateFieldGet3.default)(this, _logger).debug("CHUNKING_SESSION_COOKIE", {
    message: `Session cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
    emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
    valueSize: cookie.value.length,
    chunks: cookies.map(c => c.value.length + ESTIMATED_EMPTY_COOKIE_SIZE)
  });
  return cookies;
}

function _clean2() {
  const cleanedChunks = {};

  for (const name in (0, _classPrivateFieldGet3.default)(this, _chunks)) {
    var _classPrivateFieldGet2;

    (_classPrivateFieldGet2 = (0, _classPrivateFieldGet3.default)(this, _chunks)) === null || _classPrivateFieldGet2 === void 0 ? true : delete _classPrivateFieldGet2[name];
    cleanedChunks[name] = {
      name,
      value: "",
      options: { ...(0, _classPrivateFieldGet3.default)(this, _option).options,
        maxAge: 0
      }
    };
  }

  return cleanedChunks;
}

/***/ }),

/***/ 6578:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createCSRFToken = createCSRFToken;

var _crypto = __webpack_require__(6113);

function createCSRFToken({
  options,
  cookieValue,
  isPost,
  bodyValue
}) {
  if (cookieValue) {
    const [csrfToken, csrfTokenHash] = cookieValue.split("|");
    const expectedCsrfTokenHash = (0, _crypto.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");

    if (csrfTokenHash === expectedCsrfTokenHash) {
      const csrfTokenVerified = isPost && csrfToken === bodyValue;
      return {
        csrfTokenVerified,
        csrfToken
      };
    }
  }

  const csrfToken = (0, _crypto.randomBytes)(32).toString("hex");
  const csrfTokenHash = (0, _crypto.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");
  const cookie = `${csrfToken}|${csrfTokenHash}`;
  return {
    cookie,
    csrfToken
  };
}

/***/ }),

/***/ 5346:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.defaultCallbacks = void 0;
const defaultCallbacks = {
  signIn() {
    return true;
  },

  redirect({
    url,
    baseUrl
  }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`;else if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },

  session({
    session
  }) {
    return session;
  },

  jwt({
    token
  }) {
    return token;
  }

};
exports.defaultCallbacks = defaultCallbacks;

/***/ }),

/***/ 9492:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = email;

var _crypto = __webpack_require__(6113);

var _utils = __webpack_require__(2117);

async function email(identifier, options) {
  var _await$provider$gener, _provider$generateVer, _provider$maxAge;

  const {
    url,
    adapter,
    provider,
    callbackUrl,
    theme
  } = options;
  const token = (_await$provider$gener = await ((_provider$generateVer = provider.generateVerificationToken) === null || _provider$generateVer === void 0 ? void 0 : _provider$generateVer.call(provider))) !== null && _await$provider$gener !== void 0 ? _await$provider$gener : (0, _crypto.randomBytes)(32).toString("hex");
  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ((_provider$maxAge = provider.maxAge) !== null && _provider$maxAge !== void 0 ? _provider$maxAge : ONE_DAY_IN_SECONDS) * 1000);
  const params = new URLSearchParams({
    callbackUrl,
    token,
    email: identifier
  });
  const _url = `${url}/callback/${provider.id}?${params}`;
  await Promise.all([provider.sendVerificationRequest({
    identifier,
    token,
    expires,
    url: _url,
    provider,
    theme
  }), adapter.createVerificationToken({
    identifier,
    token: (0, _utils.hashToken)(token, options),
    expires
  })]);
  return `${url}/verify-request?${new URLSearchParams({
    provider: provider.id,
    type: provider.type
  })}`;
}

/***/ }),

/***/ 8640:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = getAuthorizationUrl;

var _client = __webpack_require__(9112);

var _clientLegacy = __webpack_require__(6952);

var _stateHandler = __webpack_require__(6173);

var _pkceHandler = __webpack_require__(1632);

async function getAuthorizationUrl({
  options,
  query
}) {
  var _provider$version;

  const {
    logger,
    provider
  } = options;
  let params = {};

  if (typeof provider.authorization === "string") {
    const parsedUrl = new URL(provider.authorization);
    const parsedParams = Object.fromEntries(parsedUrl.searchParams.entries());
    params = { ...params,
      ...parsedParams
    };
  } else {
    var _provider$authorizati;

    params = { ...params,
      ...((_provider$authorizati = provider.authorization) === null || _provider$authorizati === void 0 ? void 0 : _provider$authorizati.params)
    };
  }

  params = { ...params,
    ...query
  };

  if ((_provider$version = provider.version) !== null && _provider$version !== void 0 && _provider$version.startsWith("1.")) {
    var _provider$authorizati2, _provider$authorizati3;

    const client = (0, _clientLegacy.oAuth1Client)(options);
    const tokens = await client.getOAuthRequestToken(params);
    const url = `${(_provider$authorizati2 = (_provider$authorizati3 = provider.authorization) === null || _provider$authorizati3 === void 0 ? void 0 : _provider$authorizati3.url) !== null && _provider$authorizati2 !== void 0 ? _provider$authorizati2 : provider.authorization}?${new URLSearchParams({
      oauth_token: tokens.oauth_token,
      oauth_token_secret: tokens.oauth_token_secret,
      ...tokens.params
    })}`;
    logger.debug("GET_AUTHORIZATION_URL", {
      url,
      provider
    });
    return {
      redirect: url
    };
  }

  const client = await (0, _client.openidClient)(options);
  const authorizationParams = params;
  const cookies = [];
  const state = await (0, _stateHandler.createState)(options);

  if (state) {
    authorizationParams.state = state.value;
    cookies.push(state.cookie);
  }

  const pkce = await (0, _pkceHandler.createPKCE)(options);

  if (pkce) {
    authorizationParams.code_challenge = pkce.code_challenge;
    authorizationParams.code_challenge_method = pkce.code_challenge_method;
    cookies.push(pkce.cookie);
  }

  const url = client.authorizationUrl(authorizationParams);
  logger.debug("GET_AUTHORIZATION_URL", {
    url,
    cookies,
    provider
  });
  return {
    redirect: url,
    cookies
  };
}

/***/ }),

/***/ 1295:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = oAuthCallback;

var _openidClient = __webpack_require__(6942);

var _client = __webpack_require__(9112);

var _clientLegacy = __webpack_require__(6952);

var _stateHandler = __webpack_require__(6173);

var _pkceHandler = __webpack_require__(1632);

var _errors = __webpack_require__(3683);

async function oAuthCallback(params) {
  var _body$error, _provider$version;

  const {
    options,
    query,
    body,
    method,
    cookies
  } = params;
  const {
    logger,
    provider
  } = options;
  const errorMessage = (_body$error = body === null || body === void 0 ? void 0 : body.error) !== null && _body$error !== void 0 ? _body$error : query === null || query === void 0 ? void 0 : query.error;

  if (errorMessage) {
    const error = new Error(errorMessage);
    logger.error("OAUTH_CALLBACK_HANDLER_ERROR", {
      error,
      error_description: query === null || query === void 0 ? void 0 : query.error_description,
      providerId: provider.id
    });
    logger.debug("OAUTH_CALLBACK_HANDLER_ERROR", {
      body
    });
    throw error;
  }

  if ((_provider$version = provider.version) !== null && _provider$version !== void 0 && _provider$version.startsWith("1.")) {
    try {
      const client = await (0, _clientLegacy.oAuth1Client)(options);
      const {
        oauth_token,
        oauth_verifier
      } = query !== null && query !== void 0 ? query : {};
      const tokens = await client.getOAuthAccessToken(oauth_token, null, oauth_verifier);
      let profile = await client.get(provider.profileUrl, tokens.oauth_token, tokens.oauth_token_secret);

      if (typeof profile === "string") {
        profile = JSON.parse(profile);
      }

      return await getProfile({
        profile,
        tokens,
        provider,
        logger
      });
    } catch (error) {
      logger.error("OAUTH_V1_GET_ACCESS_TOKEN_ERROR", error);
      throw error;
    }
  }

  try {
    var _provider$token, _provider$token2, _provider$userinfo;

    const client = await (0, _client.openidClient)(options);
    let tokens;
    const checks = {};
    const resCookies = [];
    const state = await (0, _stateHandler.useState)(cookies === null || cookies === void 0 ? void 0 : cookies[options.cookies.state.name], options);

    if (state) {
      checks.state = state.value;
      resCookies.push(state.cookie);
    }

    const codeVerifier = cookies === null || cookies === void 0 ? void 0 : cookies[options.cookies.pkceCodeVerifier.name];
    const pkce = await (0, _pkceHandler.usePKCECodeVerifier)(codeVerifier, options);

    if (pkce) {
      checks.code_verifier = pkce.codeVerifier;
      resCookies.push(pkce.cookie);
    }

    const params = { ...client.callbackParams({
        url: `http://n?${new URLSearchParams(query)}`,
        body,
        method
      }),
      ...((_provider$token = provider.token) === null || _provider$token === void 0 ? void 0 : _provider$token.params)
    };

    if ((_provider$token2 = provider.token) !== null && _provider$token2 !== void 0 && _provider$token2.request) {
      const response = await provider.token.request({
        provider,
        params,
        checks,
        client
      });
      tokens = new _openidClient.TokenSet(response.tokens);
    } else if (provider.idToken) {
      tokens = await client.callback(provider.callbackUrl, params, checks);
    } else {
      tokens = await client.oauthCallback(provider.callbackUrl, params, checks);
    }

    if (Array.isArray(tokens.scope)) {
      tokens.scope = tokens.scope.join(" ");
    }

    let profile;

    if ((_provider$userinfo = provider.userinfo) !== null && _provider$userinfo !== void 0 && _provider$userinfo.request) {
      profile = await provider.userinfo.request({
        provider,
        tokens,
        client
      });
    } else if (provider.idToken) {
      profile = tokens.claims();
    } else {
      var _provider$userinfo2;

      profile = await client.userinfo(tokens, {
        params: (_provider$userinfo2 = provider.userinfo) === null || _provider$userinfo2 === void 0 ? void 0 : _provider$userinfo2.params
      });
    }

    const profileResult = await getProfile({
      profile,
      provider,
      tokens,
      logger
    });
    return { ...profileResult,
      cookies: resCookies
    };
  } catch (error) {
    logger.error("OAUTH_CALLBACK_ERROR", {
      error: error,
      providerId: provider.id
    });
    throw new _errors.OAuthCallbackError(error);
  }
}

async function getProfile({
  profile: OAuthProfile,
  tokens,
  provider,
  logger
}) {
  try {
    var _profile$email;

    logger.debug("PROFILE_DATA", {
      OAuthProfile
    });
    const profile = await provider.profile(OAuthProfile, tokens);
    profile.email = (_profile$email = profile.email) === null || _profile$email === void 0 ? void 0 : _profile$email.toLowerCase();
    return {
      profile,
      account: {
        provider: provider.id,
        type: provider.type,
        providerAccountId: profile.id.toString(),
        ...tokens
      },
      OAuthProfile
    };
  } catch (error) {
    logger.error("OAUTH_PARSE_PROFILE_ERROR", error);
    return {
      profile: null,
      account: null,
      OAuthProfile
    };
  }
}

/***/ }),

/***/ 6952:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.oAuth1Client = oAuth1Client;

var _oauth = __webpack_require__(1532);

function oAuth1Client(options) {
  var _provider$version, _provider$encoding;

  const provider = options.provider;
  const oauth1Client = new _oauth.OAuth(provider.requestTokenUrl, provider.accessTokenUrl, provider.clientId, provider.clientSecret, (_provider$version = provider.version) !== null && _provider$version !== void 0 ? _provider$version : "1.0", provider.callbackUrl, (_provider$encoding = provider.encoding) !== null && _provider$encoding !== void 0 ? _provider$encoding : "HMAC-SHA1");
  const originalGet = oauth1Client.get.bind(oauth1Client);

  oauth1Client.get = async (...args) => {
    return await new Promise((resolve, reject) => {
      originalGet(...args, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  };

  const originalGetOAuth1AccessToken = oauth1Client.getOAuthAccessToken.bind(oauth1Client);

  oauth1Client.getOAuthAccessToken = async (...args) => {
    return await new Promise((resolve, reject) => {
      originalGetOAuth1AccessToken(...args, (error, oauth_token, oauth_token_secret) => {
        if (error) {
          return reject(error);
        }

        resolve({
          oauth_token,
          oauth_token_secret
        });
      });
    });
  };

  const originalGetOAuthRequestToken = oauth1Client.getOAuthRequestToken.bind(oauth1Client);

  oauth1Client.getOAuthRequestToken = async (params = {}) => {
    return await new Promise((resolve, reject) => {
      originalGetOAuthRequestToken(params, (error, oauth_token, oauth_token_secret, params) => {
        if (error) {
          return reject(error);
        }

        resolve({
          oauth_token,
          oauth_token_secret,
          params
        });
      });
    });
  };

  return oauth1Client;
}

/***/ }),

/***/ 9112:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.openidClient = openidClient;

var _openidClient = __webpack_require__(6942);

async function openidClient(options) {
  const provider = options.provider;
  if (provider.httpOptions) _openidClient.custom.setHttpOptionsDefaults(provider.httpOptions);
  let issuer;

  if (provider.wellKnown) {
    issuer = await _openidClient.Issuer.discover(provider.wellKnown);
  } else {
    var _provider$authorizati, _provider$authorizati2, _provider$token$url, _provider$token, _provider$userinfo$ur, _provider$userinfo;

    issuer = new _openidClient.Issuer({
      issuer: provider.issuer,
      authorization_endpoint: (_provider$authorizati = (_provider$authorizati2 = provider.authorization) === null || _provider$authorizati2 === void 0 ? void 0 : _provider$authorizati2.url) !== null && _provider$authorizati !== void 0 ? _provider$authorizati : provider.authorization,
      token_endpoint: (_provider$token$url = (_provider$token = provider.token) === null || _provider$token === void 0 ? void 0 : _provider$token.url) !== null && _provider$token$url !== void 0 ? _provider$token$url : provider.token,
      userinfo_endpoint: (_provider$userinfo$ur = (_provider$userinfo = provider.userinfo) === null || _provider$userinfo === void 0 ? void 0 : _provider$userinfo.url) !== null && _provider$userinfo$ur !== void 0 ? _provider$userinfo$ur : provider.userinfo
    });
  }

  const client = new issuer.Client({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    redirect_uris: [provider.callbackUrl],
    ...provider.client
  }, provider.jwks);
  client[_openidClient.custom.clock_tolerance] = 10;
  return client;
}

/***/ }),

/***/ 1632:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createPKCE = createPKCE;
exports.usePKCECodeVerifier = usePKCECodeVerifier;

var jwt = _interopRequireWildcard(__webpack_require__(6832));

var _openidClient = __webpack_require__(6942);

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const PKCE_CODE_CHALLENGE_METHOD = "S256";
const PKCE_MAX_AGE = 60 * 15;

async function createPKCE(options) {
  var _provider$checks;

  const {
    cookies,
    logger,
    provider
  } = options;

  if (!((_provider$checks = provider.checks) !== null && _provider$checks !== void 0 && _provider$checks.includes("pkce"))) {
    return;
  }

  const code_verifier = _openidClient.generators.codeVerifier();

  const code_challenge = _openidClient.generators.codeChallenge(code_verifier);

  const expires = new Date();
  expires.setTime(expires.getTime() + PKCE_MAX_AGE * 1000);
  const encryptedCodeVerifier = await jwt.encode({ ...options.jwt,
    maxAge: PKCE_MAX_AGE,
    token: {
      code_verifier
    }
  });
  logger.debug("CREATE_PKCE_CHALLENGE_VERIFIER", {
    code_challenge,
    code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
    code_verifier,
    PKCE_MAX_AGE
  });
  return {
    code_challenge,
    code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
    cookie: {
      name: cookies.pkceCodeVerifier.name,
      value: encryptedCodeVerifier,
      options: { ...cookies.pkceCodeVerifier.options,
        expires
      }
    }
  };
}

async function usePKCECodeVerifier(codeVerifier, options) {
  var _provider$checks2, _pkce$code_verifier;

  const {
    cookies,
    provider
  } = options;

  if (!(provider !== null && provider !== void 0 && (_provider$checks2 = provider.checks) !== null && _provider$checks2 !== void 0 && _provider$checks2.includes("pkce")) || !codeVerifier) {
    return;
  }

  const pkce = await jwt.decode({ ...options.jwt,
    token: codeVerifier
  });
  return {
    codeVerifier: (_pkce$code_verifier = pkce === null || pkce === void 0 ? void 0 : pkce.code_verifier) !== null && _pkce$code_verifier !== void 0 ? _pkce$code_verifier : undefined,
    cookie: {
      name: cookies.pkceCodeVerifier.name,
      value: "",
      options: { ...cookies.pkceCodeVerifier.options,
        maxAge: 0
      }
    }
  };
}

/***/ }),

/***/ 6173:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createState = createState;
exports.useState = useState;

var _openidClient = __webpack_require__(6942);

const STATE_MAX_AGE = 60 * 15;

async function createState(options) {
  var _provider$checks;

  const {
    logger,
    provider,
    jwt,
    cookies
  } = options;

  if (!((_provider$checks = provider.checks) !== null && _provider$checks !== void 0 && _provider$checks.includes("state"))) {
    return;
  }

  const state = _openidClient.generators.state();

  const encodedState = await jwt.encode({ ...jwt,
    maxAge: STATE_MAX_AGE,
    token: {
      state
    }
  });
  logger.debug("CREATE_STATE", {
    state,
    maxAge: STATE_MAX_AGE
  });
  const expires = new Date();
  expires.setTime(expires.getTime() + STATE_MAX_AGE * 1000);
  return {
    value: state,
    cookie: {
      name: cookies.state.name,
      value: encodedState,
      options: { ...cookies.state.options,
        expires
      }
    }
  };
}

async function useState(state, options) {
  var _provider$checks2, _value$state;

  const {
    cookies,
    provider,
    jwt
  } = options;
  if (!((_provider$checks2 = provider.checks) !== null && _provider$checks2 !== void 0 && _provider$checks2.includes("state")) || !state) return;
  const value = await jwt.decode({ ...options.jwt,
    token: state
  });
  return {
    value: (_value$state = value === null || value === void 0 ? void 0 : value.state) !== null && _value$state !== void 0 ? _value$state : undefined,
    cookie: {
      name: cookies.state.name,
      value: "",
      options: { ...cookies.pkceCodeVerifier.options,
        maxAge: 0
      }
    }
  };
}

/***/ }),

/***/ 8643:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = parseProviders;

var _merge = __webpack_require__(1147);

function parseProviders(params) {
  const {
    url,
    providerId
  } = params;
  const providers = params.providers.map(({
    options,
    ...rest
  }) => {
    var _userOptions$id, _userOptions$id2;

    const defaultOptions = normalizeProvider(rest);
    const userOptions = normalizeProvider(options);
    return (0, _merge.merge)(defaultOptions, { ...userOptions,
      signinUrl: `${url}/signin/${(_userOptions$id = userOptions === null || userOptions === void 0 ? void 0 : userOptions.id) !== null && _userOptions$id !== void 0 ? _userOptions$id : rest.id}`,
      callbackUrl: `${url}/callback/${(_userOptions$id2 = userOptions === null || userOptions === void 0 ? void 0 : userOptions.id) !== null && _userOptions$id2 !== void 0 ? _userOptions$id2 : rest.id}`
    });
  });
  const provider = providers.find(({
    id
  }) => id === providerId);
  return {
    providers,
    provider
  };
}

function normalizeProvider(provider) {
  var _normalized$version;

  if (!provider) return;
  const normalized = Object.entries(provider).reduce((acc, [key, value]) => {
    if (["authorization", "token", "userinfo"].includes(key) && typeof value === "string") {
      var _url$searchParams;

      const url = new URL(value);
      acc[key] = {
        url: `${url.origin}${url.pathname}`,
        params: Object.fromEntries((_url$searchParams = url.searchParams) !== null && _url$searchParams !== void 0 ? _url$searchParams : [])
      };
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  if (normalized.type === "oauth" && !((_normalized$version = normalized.version) !== null && _normalized$version !== void 0 && _normalized$version.startsWith("1."))) {
    var _ref, _normalized$idToken, _normalized$wellKnown, _normalized$authoriza, _normalized$authoriza2, _normalized$authoriza3;

    normalized.idToken = Boolean((_ref = (_normalized$idToken = normalized.idToken) !== null && _normalized$idToken !== void 0 ? _normalized$idToken : (_normalized$wellKnown = normalized.wellKnown) === null || _normalized$wellKnown === void 0 ? void 0 : _normalized$wellKnown.includes("openid-configuration")) !== null && _ref !== void 0 ? _ref : (_normalized$authoriza = normalized.authorization) === null || _normalized$authoriza === void 0 ? void 0 : (_normalized$authoriza2 = _normalized$authoriza.params) === null || _normalized$authoriza2 === void 0 ? void 0 : (_normalized$authoriza3 = _normalized$authoriza2.scope) === null || _normalized$authoriza3 === void 0 ? void 0 : _normalized$authoriza3.includes("openid"));
    if (!normalized.checks) normalized.checks = ["state"];
  }

  return normalized;
}

/***/ }),

/***/ 2117:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createSecret = createSecret;
exports.fromDate = fromDate;
exports.hashToken = hashToken;

var _crypto = __webpack_require__(6113);

function fromDate(time, date = Date.now()) {
  return new Date(date + time * 1000);
}

function hashToken(token, options) {
  var _provider$secret;

  const {
    provider,
    secret
  } = options;
  return (0, _crypto.createHash)("sha256").update(`${token}${(_provider$secret = provider.secret) !== null && _provider$secret !== void 0 ? _provider$secret : secret}`).digest("hex");
}

function createSecret(params) {
  var _userOptions$secret;

  const {
    userOptions,
    url
  } = params;
  return (_userOptions$secret = userOptions.secret) !== null && _userOptions$secret !== void 0 ? _userOptions$secret : (0, _crypto.createHash)("sha256").update(JSON.stringify({ ...url,
    ...userOptions
  })).digest("hex");
}

/***/ }),

/***/ 8065:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = ErrorPage;

var _preact = __webpack_require__(8108);

function ErrorPage(props) {
  var _errors$error$toLower;

  const {
    url,
    error = "default",
    theme
  } = props;
  const signinPageUrl = `${url}/signin`;
  const errors = {
    default: {
      status: 200,
      heading: "Error",
      message: (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "site",
        href: url === null || url === void 0 ? void 0 : url.origin
      }, url === null || url === void 0 ? void 0 : url.host))
    },
    configuration: {
      status: 500,
      heading: "Server error",
      message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "There is a problem with the server configuration."), (0, _preact.h)("p", null, "Check the server logs for more information."))
    },
    accessdenied: {
      status: 403,
      heading: "Access Denied",
      message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "You do not have permission to sign in."), (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in")))
    },
    verification: {
      status: 403,
      heading: "Unable to sign in",
      message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "The sign in link is no longer valid."), (0, _preact.h)("p", null, "It may have been used already or it may have expired.")),
      signin: (0, _preact.h)("p", null, (0, _preact.h)("a", {
        className: "button",
        href: signinPageUrl
      }, "Sign in"))
    }
  };
  const {
    status,
    heading,
    message,
    signin
  } = (_errors$error$toLower = errors[error.toLowerCase()]) !== null && _errors$error$toLower !== void 0 ? _errors$error$toLower : errors.default;
  return {
    status,
    html: (0, _preact.h)("div", {
      className: "error"
    }, (theme === null || theme === void 0 ? void 0 : theme.brandColor) && (0, _preact.h)("style", {
      dangerouslySetInnerHTML: {
        __html: `
        :root {
          --brand-color: ${theme === null || theme === void 0 ? void 0 : theme.brandColor}
        }
      `
      }
    }), (theme === null || theme === void 0 ? void 0 : theme.logo) && (0, _preact.h)("img", {
      src: theme.logo,
      alt: "Logo",
      className: "logo"
    }), (0, _preact.h)("div", {
      className: "card"
    }, (0, _preact.h)("h1", null, heading), (0, _preact.h)("div", {
      className: "message"
    }, message), signin))
  };
}

/***/ }),

/***/ 4015:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = renderPage;

var _preactRenderToString = _interopRequireDefault(__webpack_require__(2284));

var _signin = _interopRequireDefault(__webpack_require__(5611));

var _signout = _interopRequireDefault(__webpack_require__(9462));

var _verifyRequest = _interopRequireDefault(__webpack_require__(1248));

var _error = _interopRequireDefault(__webpack_require__(8065));

var _css = _interopRequireDefault(__webpack_require__(5393));

function renderPage(params) {
  const {
    url,
    theme,
    query,
    cookies
  } = params;

  function send({
    html,
    title,
    status
  }) {
    var _theme$colorScheme;

    return {
      cookies,
      status,
      headers: [{
        key: "Content-Type",
        value: "text/html"
      }],
      body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${(0, _css.default)()}</style><title>${title}</title></head><body class="__next-auth-theme-${(_theme$colorScheme = theme === null || theme === void 0 ? void 0 : theme.colorScheme) !== null && _theme$colorScheme !== void 0 ? _theme$colorScheme : "auto"}"><div class="page">${(0, _preactRenderToString.default)(html)}</div></body></html>`
    };
  }

  return {
    signin(props) {
      return send({
        html: (0, _signin.default)({
          csrfToken: params.csrfToken,
          providers: params.providers,
          callbackUrl: params.callbackUrl,
          theme,
          ...query,
          ...props
        }),
        title: "Sign In"
      });
    },

    signout(props) {
      return send({
        html: (0, _signout.default)({
          csrfToken: params.csrfToken,
          url,
          theme,
          ...props
        }),
        title: "Sign Out"
      });
    },

    verifyRequest(props) {
      return send({
        html: (0, _verifyRequest.default)({
          url,
          theme,
          ...props
        }),
        title: "Verify Request"
      });
    },

    error(props) {
      return send({ ...(0, _error.default)({
          url,
          theme,
          ...props
        }),
        title: "Error"
      });
    }

  };
}

/***/ }),

/***/ 5611:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = SigninPage;

var _preact = __webpack_require__(8108);

var _extends2 = _interopRequireDefault(__webpack_require__(2482));

function SigninPage(props) {
  var _errors$errorType;

  const {
    csrfToken,
    providers,
    callbackUrl,
    theme,
    email,
    error: errorType
  } = props;
  const providersToRender = providers.filter(provider => {
    if (provider.type === "oauth" || provider.type === "email") {
      return true;
    } else if (provider.type === "credentials" && provider.credentials) {
      return true;
    }

    return false;
  });

  if (typeof document !== "undefined" && theme.brandColor) {
    document.documentElement.style.setProperty("--brand-color", theme.brandColor);
  }

  const errors = {
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Try signing in with a different account.",
    OAuthCallback: "Try signing in with a different account.",
    OAuthCreateAccount: "Try signing in with a different account.",
    EmailCreateAccount: "Try signing in with a different account.",
    Callback: "Try signing in with a different account.",
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "The e-mail could not be sent.",
    CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
    SessionRequired: "Please sign in to access this page.",
    default: "Unable to sign in."
  };
  const error = errorType && ((_errors$errorType = errors[errorType]) !== null && _errors$errorType !== void 0 ? _errors$errorType : errors.default);
  return (0, _preact.h)("div", {
    className: "signin"
  }, theme.brandColor && (0, _preact.h)("style", {
    dangerouslySetInnerHTML: {
      __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `
    }
  }), theme.logo && (0, _preact.h)("img", {
    src: theme.logo,
    alt: "Logo",
    className: "logo"
  }), (0, _preact.h)("div", {
    className: "card"
  }, error && (0, _preact.h)("div", {
    className: "error"
  }, (0, _preact.h)("p", null, error)), providersToRender.map((provider, i) => (0, _preact.h)("div", {
    key: provider.id,
    className: "provider"
  }, provider.type === "oauth" && (0, _preact.h)("form", {
    action: provider.signinUrl,
    method: "POST"
  }, (0, _preact.h)("input", {
    type: "hidden",
    name: "csrfToken",
    value: csrfToken
  }), callbackUrl && (0, _preact.h)("input", {
    type: "hidden",
    name: "callbackUrl",
    value: callbackUrl
  }), (0, _preact.h)("button", {
    type: "submit",
    className: "button"
  }, "Sign in with ", provider.name)), (provider.type === "email" || provider.type === "credentials") && i > 0 && providersToRender[i - 1].type !== "email" && providersToRender[i - 1].type !== "credentials" && (0, _preact.h)("hr", null), provider.type === "email" && (0, _preact.h)("form", {
    action: provider.signinUrl,
    method: "POST"
  }, (0, _preact.h)("input", {
    type: "hidden",
    name: "csrfToken",
    value: csrfToken
  }), (0, _preact.h)("label", {
    className: "section-header",
    htmlFor: `input-email-for-${provider.id}-provider`
  }, "Email"), (0, _preact.h)("input", {
    id: `input-email-for-${provider.id}-provider`,
    autoFocus: true,
    type: "email",
    name: "email",
    value: email,
    placeholder: "email@example.com",
    required: true
  }), (0, _preact.h)("button", {
    type: "submit"
  }, "Sign in with ", provider.name)), provider.type === "credentials" && (0, _preact.h)("form", {
    action: provider.callbackUrl,
    method: "POST"
  }, (0, _preact.h)("input", {
    type: "hidden",
    name: "csrfToken",
    value: csrfToken
  }), Object.keys(provider.credentials).map(credential => {
    var _provider$credentials, _provider$credentials2, _provider$credentials3;

    return (0, _preact.h)("div", {
      key: `input-group-${provider.id}`
    }, (0, _preact.h)("label", {
      className: "section-header",
      htmlFor: `input-${credential}-for-${provider.id}-provider`
    }, (_provider$credentials = provider.credentials[credential].label) !== null && _provider$credentials !== void 0 ? _provider$credentials : credential), (0, _preact.h)("input", (0, _extends2.default)({
      name: credential,
      id: `input-${credential}-for-${provider.id}-provider`,
      type: (_provider$credentials2 = provider.credentials[credential].type) !== null && _provider$credentials2 !== void 0 ? _provider$credentials2 : "text",
      placeholder: (_provider$credentials3 = provider.credentials[credential].placeholder) !== null && _provider$credentials3 !== void 0 ? _provider$credentials3 : ""
    }, provider.credentials[credential])));
  }), (0, _preact.h)("button", {
    type: "submit"
  }, "Sign in with ", provider.name)), (provider.type === "email" || provider.type === "credentials") && i + 1 < providersToRender.length && (0, _preact.h)("hr", null)))));
}

/***/ }),

/***/ 9462:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = SignoutPage;

var _preact = __webpack_require__(8108);

function SignoutPage(props) {
  const {
    url,
    csrfToken,
    theme
  } = props;
  return (0, _preact.h)("div", {
    className: "signout"
  }, theme.brandColor && (0, _preact.h)("style", {
    dangerouslySetInnerHTML: {
      __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `
    }
  }), theme.logo && (0, _preact.h)("img", {
    src: theme.logo,
    alt: "Logo",
    className: "logo"
  }), (0, _preact.h)("div", {
    className: "card"
  }, (0, _preact.h)("h1", null, "Signout"), (0, _preact.h)("p", null, "Are you sure you want to sign out?"), (0, _preact.h)("form", {
    action: `${url}/signout`,
    method: "POST"
  }, (0, _preact.h)("input", {
    type: "hidden",
    name: "csrfToken",
    value: csrfToken
  }), (0, _preact.h)("button", {
    type: "submit"
  }, "Sign out"))));
}

/***/ }),

/***/ 1248:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = VerifyRequestPage;

var _preact = __webpack_require__(8108);

function VerifyRequestPage(props) {
  const {
    url,
    theme
  } = props;
  return (0, _preact.h)("div", {
    className: "verify-request"
  }, theme.brandColor && (0, _preact.h)("style", {
    dangerouslySetInnerHTML: {
      __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `
    }
  }), theme.logo && (0, _preact.h)("img", {
    src: theme.logo,
    alt: "Logo",
    className: "logo"
  }), (0, _preact.h)("div", {
    className: "card"
  }, (0, _preact.h)("h1", null, "Check your email"), (0, _preact.h)("p", null, "A sign in link has been sent to your email address."), (0, _preact.h)("p", null, (0, _preact.h)("a", {
    className: "site",
    href: url.origin
  }, url.host))));
}

/***/ }),

/***/ 8937:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = callback;

var _callback = _interopRequireDefault(__webpack_require__(1295));

var _callbackHandler = _interopRequireDefault(__webpack_require__(3939));

var _utils = __webpack_require__(2117);

async function callback(params) {
  const {
    options,
    query,
    body,
    method,
    headers,
    sessionStore
  } = params;
  const {
    provider,
    adapter,
    url,
    callbackUrl,
    pages,
    jwt,
    events,
    callbacks,
    session: {
      strategy: sessionStrategy,
      maxAge: sessionMaxAge
    },
    logger
  } = options;
  const cookies = [];
  const useJwtSession = sessionStrategy === "jwt";

  if (provider.type === "oauth") {
    try {
      const {
        profile,
        account,
        OAuthProfile,
        cookies: oauthCookies
      } = await (0, _callback.default)({
        query,
        body,
        method,
        options,
        cookies: params.cookies
      });
      if (oauthCookies) cookies.push(...oauthCookies);

      try {
        var _events$signIn;

        logger.debug("OAUTH_CALLBACK_RESPONSE", {
          profile,
          account,
          OAuthProfile
        });

        if (!profile) {
          return {
            redirect: `${url}/signin`,
            cookies
          };
        }

        let userOrProfile = profile;

        if (adapter) {
          const {
            getUserByAccount
          } = adapter;
          const userByAccount = await getUserByAccount({
            providerAccountId: account.providerAccountId,
            provider: provider.id
          });
          if (userByAccount) userOrProfile = userByAccount;
        }

        try {
          const isAllowed = await callbacks.signIn({
            user: userOrProfile,
            account,
            profile: OAuthProfile
          });

          if (!isAllowed) {
            return {
              redirect: `${url}/error?error=AccessDenied`,
              cookies
            };
          } else if (typeof isAllowed === "string") {
            return {
              redirect: isAllowed,
              cookies
            };
          }
        } catch (error) {
          return {
            redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
            cookies
          };
        }

        const {
          user,
          session,
          isNewUser
        } = await (0, _callbackHandler.default)({
          sessionToken: sessionStore.value,
          profile,
          account,
          options
        });

        if (useJwtSession) {
          var _user$id;

          const defaultToken = {
            name: user.name,
            email: user.email,
            picture: user.image,
            sub: (_user$id = user.id) === null || _user$id === void 0 ? void 0 : _user$id.toString()
          };
          const token = await callbacks.jwt({
            token: defaultToken,
            user,
            account,
            profile: OAuthProfile,
            isNewUser
          });
          const newToken = await jwt.encode({ ...jwt,
            token
          });
          const cookieExpires = new Date();
          cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);
          const sessionCookies = sessionStore.chunk(newToken, {
            expires: cookieExpires
          });
          cookies.push(...sessionCookies);
        } else {
          cookies.push({
            name: options.cookies.sessionToken.name,
            value: session.sessionToken,
            options: { ...options.cookies.sessionToken.options,
              expires: session.expires
            }
          });
        }

        await ((_events$signIn = events.signIn) === null || _events$signIn === void 0 ? void 0 : _events$signIn.call(events, {
          user,
          account,
          profile,
          isNewUser
        }));

        if (isNewUser && pages.newUser) {
          return {
            redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(callbackUrl)}`,
            cookies
          };
        }

        return {
          redirect: callbackUrl,
          cookies
        };
      } catch (error) {
        if (error.name === "AccountNotLinkedError") {
          return {
            redirect: `${url}/error?error=OAuthAccountNotLinked`,
            cookies
          };
        } else if (error.name === "CreateUserError") {
          return {
            redirect: `${url}/error?error=OAuthCreateAccount`,
            cookies
          };
        }

        logger.error("OAUTH_CALLBACK_HANDLER_ERROR", error);
        return {
          redirect: `${url}/error?error=Callback`,
          cookies
        };
      }
    } catch (error) {
      if (error.name === "OAuthCallbackError") {
        logger.error("CALLBACK_OAUTH_ERROR", error);
        return {
          redirect: `${url}/error?error=OAuthCallback`,
          cookies
        };
      }

      logger.error("OAUTH_CALLBACK_ERROR", error);
      return {
        redirect: `${url}/error?error=Callback`,
        cookies
      };
    }
  } else if (provider.type === "email") {
    try {
      var _ref, _events$signIn2;

      const {
        useVerificationToken,
        getUserByEmail
      } = adapter;
      const token = query === null || query === void 0 ? void 0 : query.token;
      const identifier = query === null || query === void 0 ? void 0 : query.email;
      const invite = await (useVerificationToken === null || useVerificationToken === void 0 ? void 0 : useVerificationToken({
        identifier,
        token: (0, _utils.hashToken)(token, options)
      }));
      const invalidInvite = !invite || invite.expires.valueOf() < Date.now();

      if (invalidInvite) {
        return {
          redirect: `${url}/error?error=Verification`,
          cookies
        };
      }

      const profile = (_ref = identifier ? await getUserByEmail(identifier) : null) !== null && _ref !== void 0 ? _ref : {
        email: identifier
      };
      const account = {
        providerAccountId: profile.email,
        type: "email",
        provider: provider.id
      };

      try {
        const signInCallbackResponse = await callbacks.signIn({
          user: profile,
          account,
          email: {
            email: identifier
          }
        });

        if (!signInCallbackResponse) {
          return {
            redirect: `${url}/error?error=AccessDenied`,
            cookies
          };
        } else if (typeof signInCallbackResponse === "string") {
          return {
            redirect: signInCallbackResponse,
            cookies
          };
        }
      } catch (error) {
        return {
          redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
          cookies
        };
      }

      const {
        user,
        session,
        isNewUser
      } = await (0, _callbackHandler.default)({
        sessionToken: sessionStore.value,
        profile,
        account,
        options
      });

      if (useJwtSession) {
        var _user$id2;

        const defaultToken = {
          name: user.name,
          email: user.email,
          picture: user.image,
          sub: (_user$id2 = user.id) === null || _user$id2 === void 0 ? void 0 : _user$id2.toString()
        };
        const token = await callbacks.jwt({
          token: defaultToken,
          user,
          account,
          isNewUser
        });
        const newToken = await jwt.encode({ ...jwt,
          token
        });
        const cookieExpires = new Date();
        cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);
        const sessionCookies = sessionStore.chunk(newToken, {
          expires: cookieExpires
        });
        cookies.push(...sessionCookies);
      } else {
        cookies.push({
          name: options.cookies.sessionToken.name,
          value: session.sessionToken,
          options: { ...options.cookies.sessionToken.options,
            expires: session.expires
          }
        });
      }

      await ((_events$signIn2 = events.signIn) === null || _events$signIn2 === void 0 ? void 0 : _events$signIn2.call(events, {
        user,
        account,
        isNewUser
      }));

      if (isNewUser && pages.newUser) {
        return {
          redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(callbackUrl)}`,
          cookies
        };
      }

      return {
        redirect: callbackUrl,
        cookies
      };
    } catch (error) {
      if (error.name === "CreateUserError") {
        return {
          redirect: `${url}/error?error=EmailCreateAccount`,
          cookies
        };
      }

      logger.error("CALLBACK_EMAIL_ERROR", error);
      return {
        redirect: `${url}/error?error=Callback`,
        cookies
      };
    }
  } else if (provider.type === "credentials" && method === "POST") {
    var _user$id3, _events$signIn3;

    const credentials = body;
    let user;

    try {
      user = await provider.authorize(credentials, {
        query,
        body,
        headers,
        method
      });

      if (!user) {
        return {
          status: 401,
          redirect: `${url}/error?${new URLSearchParams({
            error: "CredentialsSignin",
            provider: provider.id
          })}`,
          cookies
        };
      }
    } catch (error) {
      return {
        status: 401,
        redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
        cookies
      };
    }

    const account = {
      providerAccountId: user.id,
      type: "credentials",
      provider: provider.id
    };

    try {
      const isAllowed = await callbacks.signIn({
        user,
        account,
        credentials
      });

      if (!isAllowed) {
        return {
          status: 403,
          redirect: `${url}/error?error=AccessDenied`,
          cookies
        };
      } else if (typeof isAllowed === "string") {
        return {
          redirect: isAllowed,
          cookies
        };
      }
    } catch (error) {
      return {
        redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
        cookies
      };
    }

    const defaultToken = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: (_user$id3 = user.id) === null || _user$id3 === void 0 ? void 0 : _user$id3.toString()
    };
    const token = await callbacks.jwt({
      token: defaultToken,
      user,
      account,
      isNewUser: false
    });
    const newToken = await jwt.encode({ ...jwt,
      token
    });
    const cookieExpires = new Date();
    cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);
    const sessionCookies = sessionStore.chunk(newToken, {
      expires: cookieExpires
    });
    cookies.push(...sessionCookies);
    await ((_events$signIn3 = events.signIn) === null || _events$signIn3 === void 0 ? void 0 : _events$signIn3.call(events, {
      user,
      account
    }));
    return {
      redirect: callbackUrl,
      cookies
    };
  }

  return {
    status: 500,
    body: `Error: Callback for provider type ${provider.type} not supported`,
    cookies
  };
}

/***/ }),

/***/ 6945:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "callback", ({
  enumerable: true,
  get: function () {
    return _callback.default;
  }
}));
Object.defineProperty(exports, "providers", ({
  enumerable: true,
  get: function () {
    return _providers.default;
  }
}));
Object.defineProperty(exports, "session", ({
  enumerable: true,
  get: function () {
    return _session.default;
  }
}));
Object.defineProperty(exports, "signin", ({
  enumerable: true,
  get: function () {
    return _signin.default;
  }
}));
Object.defineProperty(exports, "signout", ({
  enumerable: true,
  get: function () {
    return _signout.default;
  }
}));

var _callback = _interopRequireDefault(__webpack_require__(8937));

var _signin = _interopRequireDefault(__webpack_require__(4647));

var _signout = _interopRequireDefault(__webpack_require__(6227));

var _session = _interopRequireDefault(__webpack_require__(1993));

var _providers = _interopRequireDefault(__webpack_require__(2927));

/***/ }),

/***/ 2927:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = providers;

function providers(providers) {
  return {
    headers: [{
      key: "Content-Type",
      value: "application/json"
    }],
    body: providers.reduce((acc, {
      id,
      name,
      type,
      signinUrl,
      callbackUrl
    }) => {
      acc[id] = {
        id,
        name,
        type,
        signinUrl,
        callbackUrl
      };
      return acc;
    }, {})
  };
}

/***/ }),

/***/ 1993:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = session;

var _utils = __webpack_require__(2117);

async function session(params) {
  const {
    options,
    sessionStore
  } = params;
  const {
    adapter,
    jwt,
    events,
    callbacks,
    logger,
    session: {
      strategy: sessionStrategy,
      maxAge: sessionMaxAge
    }
  } = options;
  const response = {
    body: {},
    headers: [{
      key: "Content-Type",
      value: "application/json"
    }],
    cookies: []
  };
  const sessionToken = sessionStore.value;
  if (!sessionToken) return response;

  if (sessionStrategy === "jwt") {
    try {
      var _response$cookies, _events$session;

      const decodedToken = await jwt.decode({ ...jwt,
        token: sessionToken
      });
      const newExpires = (0, _utils.fromDate)(sessionMaxAge);
      const session = {
        user: {
          name: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.name,
          email: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.email,
          image: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.picture
        },
        expires: newExpires.toISOString()
      };
      const token = await callbacks.jwt({
        token: decodedToken
      });
      const newSession = await callbacks.session({
        session,
        token
      });
      response.body = newSession;
      const newToken = await jwt.encode({ ...jwt,
        token,
        maxAge: options.session.maxAge
      });
      const sessionCookies = sessionStore.chunk(newToken, {
        expires: newExpires
      });
      (_response$cookies = response.cookies) === null || _response$cookies === void 0 ? void 0 : _response$cookies.push(...sessionCookies);
      await ((_events$session = events.session) === null || _events$session === void 0 ? void 0 : _events$session.call(events, {
        session: newSession,
        token
      }));
    } catch (error) {
      var _response$cookies2;

      logger.error("JWT_SESSION_ERROR", error);
      (_response$cookies2 = response.cookies) === null || _response$cookies2 === void 0 ? void 0 : _response$cookies2.push(...sessionStore.clean());
    }
  } else {
    try {
      const {
        getSessionAndUser,
        deleteSession,
        updateSession
      } = adapter;
      let userAndSession = await getSessionAndUser(sessionToken);

      if (userAndSession && userAndSession.session.expires.valueOf() < Date.now()) {
        await deleteSession(sessionToken);
        userAndSession = null;
      }

      if (userAndSession) {
        var _response$cookies3, _events$session2;

        const {
          user,
          session
        } = userAndSession;
        const sessionUpdateAge = options.session.updateAge;
        const sessionIsDueToBeUpdatedDate = session.expires.valueOf() - sessionMaxAge * 1000 + sessionUpdateAge * 1000;
        const newExpires = (0, _utils.fromDate)(sessionMaxAge);

        if (sessionIsDueToBeUpdatedDate <= Date.now()) {
          await updateSession({
            sessionToken,
            expires: newExpires
          });
        }

        const sessionPayload = await callbacks.session({
          session: {
            user: {
              name: user.name,
              email: user.email,
              image: user.image
            },
            expires: session.expires.toISOString()
          },
          user
        });
        response.body = sessionPayload;
        (_response$cookies3 = response.cookies) === null || _response$cookies3 === void 0 ? void 0 : _response$cookies3.push({
          name: options.cookies.sessionToken.name,
          value: sessionToken,
          options: { ...options.cookies.sessionToken.options,
            expires: newExpires
          }
        });
        await ((_events$session2 = events.session) === null || _events$session2 === void 0 ? void 0 : _events$session2.call(events, {
          session: sessionPayload
        }));
      } else if (sessionToken) {
        var _response$cookies4;

        (_response$cookies4 = response.cookies) === null || _response$cookies4 === void 0 ? void 0 : _response$cookies4.push(...sessionStore.clean());
      }
    } catch (error) {
      logger.error("SESSION_ERROR", error);
    }
  }

  return response;
}

/***/ }),

/***/ 4647:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = signin;

var _authorizationUrl = _interopRequireDefault(__webpack_require__(8640));

var _signin = _interopRequireDefault(__webpack_require__(9492));

async function signin(params) {
  const {
    options,
    query,
    body
  } = params;
  const {
    url,
    adapter,
    callbacks,
    logger,
    provider
  } = options;

  if (!provider.type) {
    return {
      status: 500,
      text: `Error: Type not specified for ${provider.name}`
    };
  }

  if (provider.type === "oauth") {
    try {
      const response = await (0, _authorizationUrl.default)({
        options,
        query
      });
      return response;
    } catch (error) {
      logger.error("SIGNIN_OAUTH_ERROR", {
        error: error,
        providerId: provider.id
      });
      return {
        redirect: `${url}/error?error=OAuthSignin`
      };
    }
  } else if (provider.type === "email") {
    var _provider$normalizeId, _ref;

    let email = body === null || body === void 0 ? void 0 : body.email;
    if (!email) return {
      redirect: `${url}/error?error=EmailSignin`
    };
    const normalizer = (_provider$normalizeId = provider.normalizeIdentifier) !== null && _provider$normalizeId !== void 0 ? _provider$normalizeId : identifier => {
      let [local, domain] = identifier.toLowerCase().trim().split("@");
      domain = domain.split(",")[0];
      return `${local}@${domain}`;
    };

    try {
      email = normalizer(body === null || body === void 0 ? void 0 : body.email);
    } catch (error) {
      logger.error("SIGNIN_EMAIL_ERROR", {
        error,
        providerId: provider.id
      });
      return {
        redirect: `${url}/error?error=EmailSignin`
      };
    }

    const {
      getUserByEmail
    } = adapter;
    const user = (_ref = email ? await getUserByEmail(email) : null) !== null && _ref !== void 0 ? _ref : {
      email,
      id: email
    };
    const account = {
      providerAccountId: email,
      userId: email,
      type: "email",
      provider: provider.id
    };

    try {
      const signInCallbackResponse = await callbacks.signIn({
        user,
        account,
        email: {
          verificationRequest: true
        }
      });

      if (!signInCallbackResponse) {
        return {
          redirect: `${url}/error?error=AccessDenied`
        };
      } else if (typeof signInCallbackResponse === "string") {
        return {
          redirect: signInCallbackResponse
        };
      }
    } catch (error) {
      return {
        redirect: `${url}/error?${new URLSearchParams({
          error: error
        })}`
      };
    }

    try {
      const redirect = await (0, _signin.default)(email, options);
      return {
        redirect
      };
    } catch (error) {
      logger.error("SIGNIN_EMAIL_ERROR", {
        error,
        providerId: provider.id
      });
      return {
        redirect: `${url}/error?error=EmailSignin`
      };
    }
  }

  return {
    redirect: `${url}/signin`
  };
}

/***/ }),

/***/ 6227:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = signout;

async function signout(params) {
  const {
    options,
    sessionStore
  } = params;
  const {
    adapter,
    events,
    jwt,
    callbackUrl,
    logger,
    session
  } = options;
  const sessionToken = sessionStore === null || sessionStore === void 0 ? void 0 : sessionStore.value;

  if (!sessionToken) {
    return {
      redirect: callbackUrl
    };
  }

  if (session.strategy === "jwt") {
    try {
      var _events$signOut;

      const decodedJwt = await jwt.decode({ ...jwt,
        token: sessionToken
      });
      await ((_events$signOut = events.signOut) === null || _events$signOut === void 0 ? void 0 : _events$signOut.call(events, {
        token: decodedJwt
      }));
    } catch (error) {
      logger.error("SIGNOUT_ERROR", error);
    }
  } else {
    try {
      var _events$signOut2;

      const session = await adapter.deleteSession(sessionToken);
      await ((_events$signOut2 = events.signOut) === null || _events$signOut2 === void 0 ? void 0 : _events$signOut2.call(events, {
        session
      }));
    } catch (error) {
      logger.error("SIGNOUT_ERROR", error);
    }
  }

  const sessionCookies = sessionStore.clean();
  return {
    redirect: callbackUrl,
    cookies: sessionCookies
  };
}

/***/ }),

/***/ 3846:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 5393:
/***/ ((module) => {

module.exports = function() { return ":root{--border-width:1px;--border-radius:0.3rem;--color-error:#c94b4b;--color-info:#157efb;--color-info-text:#fff}.__next-auth-theme-auto,.__next-auth-theme-light{--color-background:#fff;--color-text:#000;--color-primary:#444;--color-control-border:#bbb;--color-button-active-background:#f9f9f9;--color-button-active-border:#aaa;--color-seperator:#ccc}.__next-auth-theme-dark{--color-background:#000;--color-text:#fff;--color-primary:#ccc;--color-control-border:#555;--color-button-active-background:#060606;--color-button-active-border:#666;--color-seperator:#444}@media (prefers-color-scheme:dark){.__next-auth-theme-auto{--color-background:#000;--color-text:#fff;--color-primary:#ccc;--color-control-border:#555;--color-button-active-background:#060606;--color-button-active-border:#666;--color-seperator:#444}}body{background-color:var(--color-background);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;margin:0;padding:0}h1{font-weight:400;margin-bottom:1.5rem;padding:0 1rem}h1,p{color:var(--color-text)}form{margin:0;padding:0}label{font-weight:500;margin-bottom:.25rem;text-align:left}input[type],label{color:var(--color-text);display:block}input[type]{background:var(--color-background);border:var(--border-width) solid var(--color-control-border);border-radius:var(--border-radius);box-shadow:inset 0 .1rem .2rem rgba(0,0,0,.2);box-sizing:border-box;font-size:1rem;padding:.5rem 1rem;width:100%}input[type]:focus{box-shadow:none}p{font-size:1.1rem;line-height:2rem;margin:0 0 1.5rem;padding:0 1rem}a.button{line-height:1rem;text-decoration:none}a.button,a.button:link,a.button:visited,button{background-color:var(--color-background);color:var(--color-primary)}a.button,button{border:var(--border-width) solid var(--color-control-border);border-radius:var(--border-radius);box-shadow:0 .15rem .3rem rgba(0,0,0,.15),inset 0 .1rem .2rem var(--color-background),inset 0 -.1rem .1rem rgba(0,0,0,.05);font-size:1rem;font-weight:500;margin:0 0 .75rem;padding:.75rem 1rem;position:relative;transition:all .1s ease-in-out}a.button:hover,button:hover{cursor:pointer}a.button:active,button:active{background-color:var(--color-button-active-background);border-color:var(--color-button-active-border);box-shadow:0 .15rem .3rem rgba(0,0,0,.15),inset 0 .1rem .2rem var(--color-background),inset 0 -.1rem .1rem rgba(0,0,0,.1);cursor:pointer}a.site{color:var(--color-primary);font-size:1rem;line-height:2rem;text-decoration:none}a.site:hover{text-decoration:underline}.page{display:grid;height:100%;margin:0;padding:0;place-items:center;position:absolute;width:100%}.page>div{padding:.5rem;text-align:center}.error a.button{display:inline-block;margin-top:.5rem;padding-left:2rem;padding-right:2rem}.error .message{margin-bottom:1.5rem}.signin a.button,.signin button,.signin input[type=text]{display:block;margin-left:auto;margin-right:auto}.signin hr{border:0;border-top:1px solid var(--color-seperator);display:block;margin:1.5em auto 0;overflow:visible}.signin hr:before{background:var(--color-background);color:#888;content:\"or\";padding:0 .4rem;position:relative;top:-.6rem}.signin .error{background:#f5f5f5;background:var(--color-info);border-radius:.3rem;font-weight:500}.signin .error p{color:var(--color-info-text);font-size:.9rem;line-height:1.2rem;padding:.5rem 1rem;text-align:left}.signin form,.signin>div{display:block}.signin form input[type],.signin>div input[type]{margin-bottom:.5rem}.signin form button,.signin>div button{width:100%}.signin form,.signin>div{max-width:300px}.signout .message{margin-bottom:1.5rem}.logo{display:inline-block;margin-top:100px;max-height:150px;max-width:300px}.card{border:1px solid var(--color-control-border);border-radius:5px;margin:50px auto;max-width:-webkit-max-content;max-width:-moz-max-content;max-width:max-content;padding:20px 50px}.card .header{color:var(--color-primary)}.section-header{color:var(--brand-color,var(--color-text))}" }

/***/ }),

/***/ 5413:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var _exportNames = {};
Object.defineProperty(exports, "default", ({
  enumerable: true,
  get: function () {
    return _next.default;
  }
}));

var _types = __webpack_require__(3846);

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

var _next = _interopRequireWildcard(__webpack_require__(3250));

Object.keys(_next).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _next[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _next[key];
    }
  });
});

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/***/ }),

/***/ 6832:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4587);

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var _exportNames = {
  encode: true,
  decode: true,
  getToken: true
};
exports.decode = decode;
exports.encode = encode;
exports.getToken = getToken;

var _jose = __webpack_require__(1567);

var _hkdf = _interopRequireDefault(__webpack_require__(9819));

var _uuid = __webpack_require__(5828);

var _cookie = __webpack_require__(6593);

var _types = __webpack_require__(7802);

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60;

const now = () => Date.now() / 1000 | 0;

async function encode(params) {
  const {
    token = {},
    secret,
    maxAge = DEFAULT_MAX_AGE
  } = params;
  const encryptionSecret = await getDerivedEncryptionKey(secret);
  return await new _jose.EncryptJWT(token).setProtectedHeader({
    alg: "dir",
    enc: "A256GCM"
  }).setIssuedAt().setExpirationTime(now() + maxAge).setJti((0, _uuid.v4)()).encrypt(encryptionSecret);
}

async function decode(params) {
  const {
    token,
    secret
  } = params;
  if (!token) return null;
  const encryptionSecret = await getDerivedEncryptionKey(secret);
  const {
    payload
  } = await (0, _jose.jwtDecrypt)(token, encryptionSecret, {
    clockTolerance: 15
  });
  return payload;
}

async function getToken(params) {
  var _process$env$NEXTAUTH, _process$env$NEXTAUTH2;

  const {
    req,
    secureCookie = (_process$env$NEXTAUTH = (_process$env$NEXTAUTH2 = process.env.NEXTAUTH_URL) === null || _process$env$NEXTAUTH2 === void 0 ? void 0 : _process$env$NEXTAUTH2.startsWith("https://")) !== null && _process$env$NEXTAUTH !== void 0 ? _process$env$NEXTAUTH : !!process.env.VERCEL,
    cookieName = secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    raw,
    decode: _decode = decode,
    logger = console,
    secret = process.env.NEXTAUTH_SECRET
  } = params !== null && params !== void 0 ? params : {};
  if (!req) throw new Error("Must pass `req` to JWT getToken()");
  const sessionStore = new _cookie.SessionStore({
    name: cookieName,
    options: {
      secure: secureCookie
    }
  }, {
    cookies: req.cookies,
    headers: req.headers
  }, logger);
  let token = sessionStore.value;
  const authorizationHeader = req.headers instanceof Headers ? req.headers.get("authorization") : req.headers.authorization;

  if (!token && (authorizationHeader === null || authorizationHeader === void 0 ? void 0 : authorizationHeader.split(" ")[0]) === "Bearer") {
    const urlEncodedToken = authorizationHeader.split(" ")[1];
    token = decodeURIComponent(urlEncodedToken);
  }

  if (!token) return null;
  if (raw) return token;

  try {
    return await _decode({
      token,
      secret
    });
  } catch (_unused) {
    return null;
  }
}

async function getDerivedEncryptionKey(secret) {
  return await (0, _hkdf.default)("sha256", secret, "", "NextAuth.js Generated Encryption Key", 32);
}

/***/ }),

/***/ 7802:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 3250:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.unstable_getServerSession = unstable_getServerSession;

var _core = __webpack_require__(9851);

var _detectHost = __webpack_require__(5644);

var _utils = __webpack_require__(4880);

async function NextAuthNextHandler(req, res, options) {
  var _ref, _options$secret, _options$jwt, _ref2, _handler$status, _handler$cookies, _handler$headers;

  const {
    nextauth,
    ...query
  } = req.query;
  options.secret = (_ref = (_options$secret = options.secret) !== null && _options$secret !== void 0 ? _options$secret : (_options$jwt = options.jwt) === null || _options$jwt === void 0 ? void 0 : _options$jwt.secret) !== null && _ref !== void 0 ? _ref : process.env.NEXTAUTH_SECRET;
  const handler = await (0, _core.NextAuthHandler)({
    req: {
      host: (0, _detectHost.detectHost)(req.headers["x-forwarded-host"]),
      body: req.body,
      query,
      cookies: req.cookies,
      headers: req.headers,
      method: req.method,
      action: nextauth === null || nextauth === void 0 ? void 0 : nextauth[0],
      providerId: nextauth === null || nextauth === void 0 ? void 0 : nextauth[1],
      error: (_ref2 = req.query.error) !== null && _ref2 !== void 0 ? _ref2 : nextauth === null || nextauth === void 0 ? void 0 : nextauth[1]
    },
    options
  });
  res.status((_handler$status = handler.status) !== null && _handler$status !== void 0 ? _handler$status : 200);
  (_handler$cookies = handler.cookies) === null || _handler$cookies === void 0 ? void 0 : _handler$cookies.forEach(cookie => (0, _utils.setCookie)(res, cookie));
  (_handler$headers = handler.headers) === null || _handler$headers === void 0 ? void 0 : _handler$headers.forEach(h => res.setHeader(h.key, h.value));

  if (handler.redirect) {
    var _req$body;

    if (((_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.json) !== "true") {
      res.status(302).setHeader("Location", handler.redirect);
      return res.end();
    }

    return res.json({
      url: handler.redirect
    });
  }

  return res.send(handler.body);
}

function NextAuth(...args) {
  if (args.length === 1) {
    return async (req, res) => await NextAuthNextHandler(req, res, args[0]);
  }

  return NextAuthNextHandler(args[0], args[1], args[2]);
}

var _default = NextAuth;
exports["default"] = _default;
let experimentalWarningShown = false;

async function unstable_getServerSession(...args) {
  var _options$secret2;

  if (!experimentalWarningShown && "production" !== "production") {}

  const [req, res, options] = args;
  options.secret = (_options$secret2 = options.secret) !== null && _options$secret2 !== void 0 ? _options$secret2 : process.env.NEXTAUTH_SECRET;
  const session = await (0, _core.NextAuthHandler)({
    options,
    req: {
      host: (0, _detectHost.detectHost)(req.headers["x-forwarded-host"]),
      action: "session",
      method: "GET",
      cookies: req.cookies,
      headers: req.headers
    }
  });
  const {
    body,
    cookies
  } = session;
  cookies === null || cookies === void 0 ? void 0 : cookies.forEach(cookie => (0, _utils.setCookie)(res, cookie));
  if (body && Object.keys(body).length) return body;
  return null;
}

/***/ }),

/***/ 4880:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.setCookie = setCookie;

var _cookie = __webpack_require__(4802);

function setCookie(res, cookie) {
  var _res$getHeader;

  let setCookieHeader = (_res$getHeader = res.getHeader("Set-Cookie")) !== null && _res$getHeader !== void 0 ? _res$getHeader : [];

  if (!Array.isArray(setCookieHeader)) {
    setCookieHeader = [setCookieHeader];
  }

  const {
    name,
    value,
    options
  } = cookie;
  const cookieHeader = (0, _cookie.serialize)(name, value, options);
  setCookieHeader.push(cookieHeader);
  res.setHeader("Set-Cookie", setCookieHeader);
}

/***/ }),

/***/ 9915:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
exports.Z = Github;

function Github(options) {
  return {
    id: "github",
    name: "GitHub",
    type: "oauth",
    authorization: {
      url: "https://github.com/login/oauth/authorize",
      params: {
        scope: "read:user user:email"
      }
    },
    token: "https://github.com/login/oauth/access_token",
    userinfo: {
      url: "https://api.github.com/user",

      async request({
        client,
        tokens
      }) {
        const profile = await client.userinfo(tokens.access_token);

        if (!profile.email) {
          const res = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${tokens.access_token}`
            }
          });

          if (res.ok) {
            var _emails$find;

            const emails = await res.json();
            profile.email = ((_emails$find = emails.find(e => e.primary)) !== null && _emails$find !== void 0 ? _emails$find : emails[0]).email;
          }
        }

        return profile;
      }

    },

    profile(profile) {
      var _profile$name;

      return {
        id: profile.id.toString(),
        name: (_profile$name = profile.name) !== null && _profile$name !== void 0 ? _profile$name : profile.login,
        email: profile.email,
        image: profile.avatar_url
      };
    },

    options
  };
}

/***/ }),

/***/ 5644:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.detectHost = detectHost;

function detectHost(forwardedHost) {
  if (process.env.VERCEL) return forwardedHost;
  return process.env.NEXTAUTH_URL;
}

/***/ }),

/***/ 1147:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.merge = merge;

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function merge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {
          [key]: {}
        });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return merge(target, ...sources);
}

/***/ }),

/***/ 3858:
/***/ ((module) => {

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

module.exports = _classApplyDescriptorGet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2705:
/***/ ((module) => {

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

module.exports = _classApplyDescriptorSet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2227:
/***/ ((module) => {

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

module.exports = _classExtractFieldDescriptor, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3166:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classApplyDescriptorGet = __webpack_require__(3858);

var classExtractFieldDescriptor = __webpack_require__(2227);

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = classExtractFieldDescriptor(receiver, privateMap, "get");
  return classApplyDescriptorGet(receiver, descriptor);
}

module.exports = _classPrivateFieldGet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4141:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classApplyDescriptorSet = __webpack_require__(2705);

var classExtractFieldDescriptor = __webpack_require__(2227);

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
  classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}

module.exports = _classPrivateFieldSet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2482:
/***/ ((module) => {

function _extends() {
  module.exports = _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _extends.apply(this, arguments);
}

module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

};
;