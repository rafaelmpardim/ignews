exports.id = 699;
exports.ids = [699];
exports.modules = {

/***/ 9008:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(4957)


/***/ }),

/***/ 8468:
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "_E": () => (/* binding */ predicates),
/* harmony export */   "eI": () => (/* binding */ createClient)
/* harmony export */ });
/* unused harmony exports Client, ForbiddenError, NotFoundError, ParsingError, Predicates, PrismicError, buildQueryURL, cookie, getEndpoint, getGraphQLEndpoint, getRepositoryEndpoint, getRepositoryName, isRepositoryEndpoint, isRepositoryName, predicate */
/* harmony import */ var _prismicio_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9107);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_prismicio_helpers__WEBPACK_IMPORTED_MODULE_0__]);
_prismicio_helpers__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


const isRepositoryName = (input) => {
  return /^[a-zA-Z0-9][-a-zA-Z0-9]{2,}[a-zA-Z0-9]$/.test(input);
};

class PrismicError extends Error {
  constructor(message = "An invalid API response was returned", url, response) {
    super(message);
    this.url = url;
    this.response = response;
  }
}

const getRepositoryEndpoint = (repositoryName) => {
  if (isRepositoryName(repositoryName)) {
    return `https://${repositoryName}.cdn.prismic.io/api/v2`;
  } else {
    throw new PrismicError(
      `An invalid Prismic repository name was given: ${repositoryName}`,
      void 0,
      void 0
    );
  }
};

const getRepositoryName = (repositoryEndpoint) => {
  try {
    return new URL(repositoryEndpoint).hostname.split(".")[0];
  } catch (e) {
    throw new PrismicError(
      `An invalid Prismic Rest API V2 endpoint was provided: ${repositoryEndpoint}`,
      void 0,
      void 0
    );
  }
};

const getGraphQLEndpoint = (repositoryName) => {
  if (isRepositoryName(repositoryName)) {
    return `https://${repositoryName}.cdn.prismic.io/graphql`;
  } else {
    throw new PrismicError(
      `An invalid Prismic repository name was given: ${repositoryName}`,
      void 0,
      void 0
    );
  }
};

const isRepositoryEndpoint = (input) => {
  try {
    new URL(input);
    return true;
  } catch (e) {
    return false;
  }
};

const castArray = (a) => Array.isArray(a) ? a : [a];

const RENAMED_PARAMS = {
  accessToken: "access_token"
};
const castOrderingToString = (ordering) => typeof ordering === "string" ? ordering : [
  ordering.field,
  ordering.direction === "desc" ? ordering.direction : void 0
].filter(Boolean).join(" ");
const buildQueryURL = (endpoint, args) => {
  var _a;
  const { predicates, ...params } = args;
  const url = new URL(`documents/search`, `${endpoint}/`);
  if (predicates) {
    for (const predicate of castArray(predicates)) {
      url.searchParams.append("q", `[${predicate}]`);
    }
  }
  for (const k in params) {
    const name = (_a = RENAMED_PARAMS[k]) != null ? _a : k;
    let value = params[k];
    if (name === "orderings") {
      const scopedValue = params[name];
      if (scopedValue != null) {
        const v = castArray(scopedValue).map((ordering) => castOrderingToString(ordering)).join(",");
        value = `[${v}]`;
      }
    } else if (name === "routes") {
      if (typeof params[name] === "object") {
        value = JSON.stringify(castArray(params[name]));
      }
    }
    if (value != null) {
      url.searchParams.set(name, castArray(value).join(","));
    }
  }
  return url.toString();
};

const appendPredicates = (objWithPredicates = {}, predicates) => {
  return {
    ...objWithPredicates,
    predicates: [
      ...objWithPredicates.predicates || [],
      ...castArray(predicates)
    ]
  };
};

const castThunk = (a) => typeof a === "function" ? a : () => a;

const findRef = (refs, predicate) => {
  const ref = refs.find((ref2) => predicate(ref2));
  if (!ref) {
    throw new PrismicError("Ref could not be found.", void 0, void 0);
  }
  return ref;
};

const findMasterRef = (refs) => {
  return findRef(refs, (ref) => ref.isMasterRef);
};

const findRefByID = (refs, id) => {
  return findRef(refs, (ref) => ref.id === id);
};

const findRefByLabel = (refs, label) => {
  return findRef(refs, (ref) => ref.label === label);
};

const preview = "io.prismic.preview";

var cookie = /*#__PURE__*/Object.freeze({
	__proto__: null,
	preview: preview
});

const readValue = (value) => {
  return value.replace(/%3B/g, ";");
};
const getPreviewCookie = (cookieJar) => {
  const cookies = cookieJar.split("; ");
  let value;
  for (const cookie of cookies) {
    const parts = cookie.split("=");
    const name = readValue(parts[0]).replace(/%3D/g, "=");
    if (name === preview) {
      value = readValue(parts.slice(1).join("="));
      continue;
    }
  }
  return value;
};

const minifyGraphQLQuery = (query) => {
  return query.replace(
    /(\n| )*( |{|})(\n| )*/gm,
    (_chars, _spaces, brackets) => brackets
  );
};

class ForbiddenError extends PrismicError {
}

class NotFoundError extends PrismicError {
}

class ParsingError extends PrismicError {
}

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (value instanceof Date) {
    return `${value.getTime()}`;
  }
  return `${value}`;
};
const pathWithArgsPredicate = (name) => {
  const fn = (path, ...args) => {
    const formattedArgs = args.map(formatValue).join(", ");
    const joiner = path && args.length ? ", " : "";
    return `[${name}(${path}${joiner}${formattedArgs})]`;
  };
  return fn;
};
const pathPredicate = (name) => {
  const predicateFn = pathWithArgsPredicate(name);
  const fn = (path) => {
    return predicateFn(path);
  };
  return fn;
};
const argsPredicate = (name) => {
  const predicateFn = pathWithArgsPredicate(name);
  const fn = (...args) => {
    return predicateFn("", ...args);
  };
  return fn;
};
const predicate = {
  at: pathWithArgsPredicate("at"),
  not: pathWithArgsPredicate("not"),
  any: pathWithArgsPredicate(
    "any"
  ),
  in: pathWithArgsPredicate("in"),
  fulltext: pathWithArgsPredicate("fulltext"),
  has: pathPredicate("has"),
  missing: pathPredicate("missing"),
  similar: argsPredicate("similar"),
  geopointNear: pathWithArgsPredicate("geopoint.near"),
  numberLessThan: pathWithArgsPredicate("number.lt"),
  numberGreaterThan: pathWithArgsPredicate("number.gt"),
  numberInRange: pathWithArgsPredicate(
    "number.inRange"
  ),
  dateAfter: pathWithArgsPredicate("date.after"),
  dateBefore: pathWithArgsPredicate("date.before"),
  dateBetween: pathWithArgsPredicate("date.between"),
  dateDayOfMonth: pathWithArgsPredicate("date.day-of-month"),
  dateDayOfMonthAfter: pathWithArgsPredicate(
    "date.day-of-month-after"
  ),
  dateDayOfMonthBefore: pathWithArgsPredicate(
    "date.day-of-month-before"
  ),
  dateDayOfWeek: pathWithArgsPredicate("date.day-of-week"),
  dateDayOfWeekAfter: pathWithArgsPredicate(
    "date.day-of-week-after"
  ),
  dateDayOfWeekBefore: pathWithArgsPredicate(
    "date.day-of-week-before"
  ),
  dateMonth: pathWithArgsPredicate("date.month"),
  dateMonthAfter: pathWithArgsPredicate("date.month-after"),
  dateMonthBefore: pathWithArgsPredicate("date.month-before"),
  dateYear: pathWithArgsPredicate("date.year"),
  dateHour: pathWithArgsPredicate("date.hour"),
  dateHourAfter: pathWithArgsPredicate("date.hour-after"),
  dateHourBefore: pathWithArgsPredicate("date.hour-before")
};

const MAX_PAGE_SIZE = 100;
const REPOSITORY_CACHE_TTL = 5e3;
const GET_ALL_QUERY_DELAY = 500;
const typePredicate = (documentType) => predicate.at("document.type", documentType);
const everyTagPredicate = (tags) => predicate.at("document.tags", castArray(tags));
const someTagsPredicate = (tags) => predicate.any("document.tags", castArray(tags));
const createClient = (repositoryNameOrEndpoint, options) => new Client(repositoryNameOrEndpoint, options);
class Client {
  constructor(repositoryNameOrEndpoint, options = {}) {
    this.refState = {
      mode: "Master" /* Master */,
      autoPreviewsEnabled: true
    };
    this.cachedRepositoryExpiration = 0;
    this.graphqlFetch = this.graphQLFetch.bind(this);
    if (isRepositoryEndpoint(repositoryNameOrEndpoint)) {
      if (false) {}
      this.endpoint = repositoryNameOrEndpoint;
    } else {
      this.endpoint = getRepositoryEndpoint(repositoryNameOrEndpoint);
    }
    this.accessToken = options.accessToken;
    this.routes = options.routes;
    this.brokenRoute = options.brokenRoute;
    this.defaultParams = options.defaultParams;
    if (options.ref) {
      this.queryContentFromRef(options.ref);
    }
    if (typeof options.fetch === "function") {
      this.fetchFn = options.fetch;
    } else if (typeof globalThis.fetch === "function") {
      this.fetchFn = globalThis.fetch;
    } else {
      throw new PrismicError(
        "A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.",
        void 0,
        void 0
      );
    }
    if (this.fetchFn === globalThis.fetch) {
      this.fetchFn = this.fetchFn.bind(globalThis);
    }
    this.graphQLFetch = this.graphQLFetch.bind(this);
  }
  enableAutoPreviews() {
    this.refState.autoPreviewsEnabled = true;
  }
  enableAutoPreviewsFromReq(req) {
    this.refState.httpRequest = req;
    this.refState.autoPreviewsEnabled = true;
  }
  disableAutoPreviews() {
    this.refState.autoPreviewsEnabled = false;
  }
  async query(predicates, params) {
    const url = await this.buildQueryURL({ ...params, predicates });
    return await this.fetch(url, params);
  }
  async get(params) {
    const url = await this.buildQueryURL(params);
    return await this.fetch(url, params);
  }
  async getFirst(params) {
    var _a, _b;
    const actualParams = { ...params };
    if (!(params && params.page) && !(params == null ? void 0 : params.pageSize)) {
      actualParams.pageSize = (_b = (_a = this.defaultParams) == null ? void 0 : _a.pageSize) != null ? _b : 1;
    }
    const url = await this.buildQueryURL(actualParams);
    const result = await this.fetch(url, params);
    const firstResult = result.results[0];
    if (firstResult) {
      return firstResult;
    }
    throw new PrismicError("No documents were returned", url, void 0);
  }
  async dangerouslyGetAll(params = {}) {
    var _a;
    const { limit = Infinity, ...actualParams } = params;
    const resolvedParams = {
      ...actualParams,
      pageSize: Math.min(
        limit,
        actualParams.pageSize || ((_a = this.defaultParams) == null ? void 0 : _a.pageSize) || MAX_PAGE_SIZE
      )
    };
    const documents = [];
    let latestResult;
    while ((!latestResult || latestResult.next_page) && documents.length < limit) {
      const page = latestResult ? latestResult.page + 1 : void 0;
      latestResult = await this.get({ ...resolvedParams, page });
      documents.push(...latestResult.results);
      if (latestResult.next_page) {
        await new Promise((res) => setTimeout(res, GET_ALL_QUERY_DELAY));
      }
    }
    return documents.slice(0, limit);
  }
  async getByID(id, params) {
    return await this.getFirst(
      appendPredicates(params, predicate.at("document.id", id))
    );
  }
  async getByIDs(ids, params) {
    return await this.get(
      appendPredicates(params, predicate.in("document.id", ids))
    );
  }
  async getAllByIDs(ids, params) {
    return await this.dangerouslyGetAll(
      appendPredicates(params, predicate.in("document.id", ids))
    );
  }
  async getByUID(documentType, uid, params) {
    return await this.getFirst(
      appendPredicates(params, [
        typePredicate(documentType),
        predicate.at(`my.${documentType}.uid`, uid)
      ])
    );
  }
  async getByUIDs(documentType, uids, params) {
    return await this.get(
      appendPredicates(params, [
        typePredicate(documentType),
        predicate.in(`my.${documentType}.uid`, uids)
      ])
    );
  }
  async getAllByUIDs(documentType, uids, params) {
    return await this.dangerouslyGetAll(
      appendPredicates(params, [
        typePredicate(documentType),
        predicate.in(`my.${documentType}.uid`, uids)
      ])
    );
  }
  async getSingle(documentType, params) {
    return await this.getFirst(
      appendPredicates(params, typePredicate(documentType))
    );
  }
  async getByType(documentType, params) {
    return await this.get(
      appendPredicates(params, typePredicate(documentType))
    );
  }
  async getAllByType(documentType, params) {
    return await this.dangerouslyGetAll(appendPredicates(params, typePredicate(documentType)));
  }
  async getByTag(tag, params) {
    return await this.get(
      appendPredicates(params, someTagsPredicate(tag))
    );
  }
  async getAllByTag(tag, params) {
    return await this.dangerouslyGetAll(
      appendPredicates(params, someTagsPredicate(tag))
    );
  }
  async getByEveryTag(tags, params) {
    return await this.get(
      appendPredicates(params, everyTagPredicate(tags))
    );
  }
  async getAllByEveryTag(tags, params) {
    return await this.dangerouslyGetAll(
      appendPredicates(params, everyTagPredicate(tags))
    );
  }
  async getBySomeTags(tags, params) {
    return await this.get(
      appendPredicates(params, someTagsPredicate(tags))
    );
  }
  async getAllBySomeTags(tags, params) {
    return await this.dangerouslyGetAll(
      appendPredicates(params, someTagsPredicate(tags))
    );
  }
  async getRepository(params) {
    const url = new URL(this.endpoint);
    if (this.accessToken) {
      url.searchParams.set("access_token", this.accessToken);
    }
    return await this.fetch(url.toString(), params);
  }
  async getRefs(params) {
    const repository = await this.getRepository(params);
    return repository.refs;
  }
  async getRefByID(id, params) {
    const refs = await this.getRefs(params);
    return findRefByID(refs, id);
  }
  async getRefByLabel(label, params) {
    const refs = await this.getRefs(params);
    return findRefByLabel(refs, label);
  }
  async getMasterRef(params) {
    const refs = await this.getRefs(params);
    return findMasterRef(refs);
  }
  async getReleases(params) {
    const refs = await this.getRefs(params);
    return refs.filter((ref) => !ref.isMasterRef);
  }
  async getReleaseByID(id, params) {
    const releases = await this.getReleases(params);
    return findRefByID(releases, id);
  }
  async getReleaseByLabel(label, params) {
    const releases = await this.getReleases(params);
    return findRefByLabel(releases, label);
  }
  async getTags(params) {
    try {
      const tagsForm = await this.getCachedRepositoryForm("tags", params);
      const url = new URL(tagsForm.action);
      if (this.accessToken) {
        url.searchParams.set("access_token", this.accessToken);
      }
      return await this.fetch(url.toString(), params);
    } catch (e) {
      const repository = await this.getRepository(params);
      return repository.tags;
    }
  }
  async buildQueryURL({
    signal,
    ...params
  } = {}) {
    const ref = params.ref || await this.getResolvedRefString();
    const integrationFieldsRef = params.integrationFieldsRef || (await this.getCachedRepository({ signal })).integrationFieldsRef || void 0;
    return buildQueryURL(this.endpoint, {
      ...this.defaultParams,
      ...params,
      ref,
      integrationFieldsRef,
      routes: params.routes || this.routes,
      brokenRoute: params.brokenRoute || this.brokenRoute,
      accessToken: params.accessToken || this.accessToken
    });
  }
  async resolvePreviewURL(args) {
    var _a, _b;
    let documentID = args.documentID;
    let previewToken = args.previewToken;
    if (typeof globalThis.location !== "undefined") {
      const searchParams = new URLSearchParams(globalThis.location.search);
      documentID = documentID || searchParams.get("documentId");
      previewToken = previewToken || searchParams.get("token");
    } else if (this.refState.httpRequest) {
      if ("query" in this.refState.httpRequest) {
        documentID = documentID || ((_a = this.refState.httpRequest.query) == null ? void 0 : _a.documentId);
        previewToken = previewToken || ((_b = this.refState.httpRequest.query) == null ? void 0 : _b.token);
      } else if ("url" in this.refState.httpRequest && this.refState.httpRequest.url) {
        const searchParams = new URL(this.refState.httpRequest.url).searchParams;
        documentID = documentID || searchParams.get("documentId");
        previewToken = previewToken || searchParams.get("token");
      }
    }
    if (documentID != null && previewToken != null) {
      const document = await this.getByID(documentID, {
        signal: args.signal,
        ref: previewToken,
        lang: "*"
      });
      const url = _prismicio_helpers__WEBPACK_IMPORTED_MODULE_0__.asLink(document, args.linkResolver);
      if (typeof url === "string") {
        return url;
      }
    }
    return args.defaultURL;
  }
  queryLatestContent() {
    this.refState.mode = "Master" /* Master */;
  }
  queryContentFromReleaseByID(releaseID) {
    this.refState = {
      ...this.refState,
      mode: "ReleaseID" /* ReleaseID */,
      releaseID
    };
  }
  queryContentFromReleaseByLabel(releaseLabel) {
    this.refState = {
      ...this.refState,
      mode: "ReleaseLabel" /* ReleaseLabel */,
      releaseLabel
    };
  }
  queryContentFromRef(ref) {
    this.refState = {
      ...this.refState,
      mode: "Manual" /* Manual */,
      ref
    };
  }
  async graphQLFetch(input, init) {
    const cachedRepository = await this.getCachedRepository();
    const ref = await this.getResolvedRefString();
    const unsanitizedHeaders = {
      "Prismic-ref": ref,
      Authorization: this.accessToken ? `Token ${this.accessToken}` : "",
      ...init ? init.headers : {}
    };
    if (cachedRepository.integrationFieldsRef) {
      unsanitizedHeaders["Prismic-integration-field-ref"] = cachedRepository.integrationFieldsRef;
    }
    const headers = {};
    for (const key in unsanitizedHeaders) {
      if (unsanitizedHeaders[key]) {
        headers[key.toLowerCase()] = unsanitizedHeaders[key];
      }
    }
    const url = new URL(
      input
    );
    url.searchParams.set("ref", ref);
    const query = url.searchParams.get("query");
    if (query) {
      url.searchParams.set(
        "query",
        minifyGraphQLQuery(query)
      );
    }
    return await this.fetchFn(url.toString(), {
      ...init,
      headers
    });
  }
  async getCachedRepository(params) {
    if (!this.cachedRepository || Date.now() >= this.cachedRepositoryExpiration) {
      this.cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL;
      this.cachedRepository = await this.getRepository(params);
    }
    return this.cachedRepository;
  }
  async getCachedRepositoryForm(name, params) {
    const cachedRepository = await this.getCachedRepository(params);
    const form = cachedRepository.forms[name];
    if (!form) {
      throw new PrismicError(
        `Form with name "${name}" could not be found`,
        void 0,
        void 0
      );
    }
    return form;
  }
  async getResolvedRefString(params) {
    var _a, _b;
    if (this.refState.autoPreviewsEnabled) {
      let previewRef;
      let cookieJar;
      if ((_a = this.refState.httpRequest) == null ? void 0 : _a.headers) {
        if ("get" in this.refState.httpRequest.headers && typeof this.refState.httpRequest.headers.get === "function") {
          cookieJar = this.refState.httpRequest.headers.get("cookie");
        } else if ("cookie" in this.refState.httpRequest.headers) {
          cookieJar = this.refState.httpRequest.headers.cookie;
        }
      } else if ((_b = globalThis.document) == null ? void 0 : _b.cookie) {
        cookieJar = globalThis.document.cookie;
      }
      if (cookieJar) {
        previewRef = getPreviewCookie(cookieJar);
      }
      if (previewRef) {
        return previewRef;
      }
    }
    const cachedRepository = await this.getCachedRepository(params);
    const refModeType = this.refState.mode;
    if (refModeType === "ReleaseID" /* ReleaseID */) {
      return findRefByID(cachedRepository.refs, this.refState.releaseID).ref;
    } else if (refModeType === "ReleaseLabel" /* ReleaseLabel */) {
      return findRefByLabel(cachedRepository.refs, this.refState.releaseLabel).ref;
    } else if (refModeType === "Manual" /* Manual */) {
      const res = await castThunk(this.refState.ref)();
      if (typeof res === "string") {
        return res;
      }
    }
    return findMasterRef(cachedRepository.refs).ref;
  }
  async fetch(url, params = {}) {
    const res = await this.fetchFn(url, {
      signal: params.signal
    });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      if (res.status === 404) {
        throw new NotFoundError(
          `Prismic repository not found. Check that "${this.endpoint}" is pointing to the correct repository.`,
          url,
          void 0
        );
      } else {
        throw new PrismicError(void 0, url, void 0);
      }
    }
    switch (res.status) {
      case 200: {
        return json;
      }
      case 400: {
        throw new ParsingError(json.message, url, json);
      }
      case 401:
      case 403: {
        throw new ForbiddenError(
          "error" in json ? json.error : json.message,
          url,
          json
        );
      }
    }
    throw new PrismicError(void 0, url, json);
  }
}

const getEndpoint = (/* unused pure expression or super */ null && (getRepositoryEndpoint));
const predicates = predicate;
const Predicates = (/* unused pure expression or super */ null && (predicate));


//# sourceMappingURL=index.js.map

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;