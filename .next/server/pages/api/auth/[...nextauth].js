"use strict";
(() => {
var exports = {};
exports.id = 748;
exports.ids = [748];
exports.modules = {

/***/ 9819:
/***/ ((module) => {

module.exports = require("@panva/hkdf");

/***/ }),

/***/ 1238:
/***/ ((module) => {

module.exports = require("base64-js");

/***/ }),

/***/ 5634:
/***/ ((module) => {

module.exports = require("boxen");

/***/ }),

/***/ 5022:
/***/ ((module) => {

module.exports = require("chalk");

/***/ }),

/***/ 4802:
/***/ ((module) => {

module.exports = require("cookie");

/***/ }),

/***/ 9031:
/***/ ((module) => {

module.exports = require("cross-fetch");

/***/ }),

/***/ 2956:
/***/ ((module) => {

module.exports = require("fn-annotate");

/***/ }),

/***/ 1567:
/***/ ((module) => {

module.exports = require("jose");

/***/ }),

/***/ 8653:
/***/ ((module) => {

module.exports = require("node-abort-controller");

/***/ }),

/***/ 1532:
/***/ ((module) => {

module.exports = require("oauth");

/***/ }),

/***/ 965:
/***/ ((module) => {

module.exports = require("object-assign");

/***/ }),

/***/ 6942:
/***/ ((module) => {

module.exports = require("openid-client");

/***/ }),

/***/ 8108:
/***/ ((module) => {

module.exports = require("preact");

/***/ }),

/***/ 2284:
/***/ ((module) => {

module.exports = require("preact-render-to-string");

/***/ }),

/***/ 7100:
/***/ ((module) => {

module.exports = require("util-deprecate");

/***/ }),

/***/ 5828:
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ 6113:
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ 3685:
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ 5158:
/***/ ((module) => {

module.exports = require("http2");

/***/ }),

/***/ 5687:
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ 2037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 3837:
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ 5677:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_next_auth_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5413);
/* harmony import */ var _node_modules_next_auth_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_next_auth_index__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9915);
/* harmony import */ var _services_fauna__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(751);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9368);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__);




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_next_auth_index__WEBPACK_IMPORTED_MODULE_0___default()({
    providers: [
        (0,_node_modules_next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        }), 
    ],
    callbacks: {
        async session ({ session , token , user  }) {
            try {
                const userActiveSubscription = await _services_fauna__WEBPACK_IMPORTED_MODULE_2__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Intersection([
                    _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("subscription_by_user_ref"), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Select("ref", _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("user_by_email"), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Casefold(session.user.email))))),
                    _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("subscription_by_status"), "active")
                ])));
                return {
                    ...session,
                    activeSubscription: userActiveSubscription
                };
            } catch  {
                return {
                    ...session,
                    activeSubscription: null
                };
            }
        },
        async signIn ({ user  }) {
            const { email  } = user;
            try {
                await _services_fauna__WEBPACK_IMPORTED_MODULE_2__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.If(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Not(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Exists(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("user_by_email"), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Casefold(user.email)))), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Create(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Collection("users"), {
                    data: {
                        email
                    }
                }), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("user_by_email"), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Casefold(user.email)))));
                return true;
            } catch  {
                return false;
            }
        }
    }
}));


/***/ }),

/***/ 751:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "r": () => (/* binding */ fauna)
/* harmony export */ });
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9368);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_0__);

const fauna = new _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_0__.Client({
    secret: process.env.FAUNADB_KEY
});


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [368,359,499], () => (__webpack_exec__(5677)));
module.exports = __webpack_exports__;

})();