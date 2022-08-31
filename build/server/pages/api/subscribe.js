"use strict";
(() => {
var exports = {};
exports.id = 761;
exports.ids = [761];
exports.modules = {

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

/***/ 9031:
/***/ ((module) => {

module.exports = require("cross-fetch");

/***/ }),

/***/ 2956:
/***/ ((module) => {

module.exports = require("fn-annotate");

/***/ }),

/***/ 8653:
/***/ ((module) => {

module.exports = require("node-abort-controller");

/***/ }),

/***/ 965:
/***/ ((module) => {

module.exports = require("object-assign");

/***/ }),

/***/ 7104:
/***/ ((module) => {

module.exports = require("qs");

/***/ }),

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 7100:
/***/ ((module) => {

module.exports = require("util-deprecate");

/***/ }),

/***/ 2081:
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ 6113:
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

module.exports = require("events");

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

/***/ 5072:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_next_auth_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2087);
/* harmony import */ var _node_modules_next_auth_react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_next_auth_react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _services_stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9371);
/* harmony import */ var _services_fauna__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(751);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9368);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__);
/* eslint-disable import/no-anonymous-default-export */ 



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async (req, res)=>{
    if (req.method === "POST") {
        const session = await (0,_node_modules_next_auth_react__WEBPACK_IMPORTED_MODULE_0__.getSession)({
            req
        });
        const user = await _services_fauna__WEBPACK_IMPORTED_MODULE_2__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Index("user_by_email"), _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Casefold(session.user.email))));
        let customerId = user.data.stripe_customer_id;
        if (!customerId) {
            const stripeCustomer = await _services_stripe__WEBPACK_IMPORTED_MODULE_1__/* .stripe.customers.create */ .A.customers.create({
                email: session.user.email
            });
            await _services_fauna__WEBPACK_IMPORTED_MODULE_2__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Update(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Ref(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_3__.query.Collection("users"), user.ref.id), {
                data: {
                    stripe_customer_id: stripeCustomer.id
                }
            }));
            customerId = stripeCustomer.id;
        }
        const stripeCheckoutSession = await _services_stripe__WEBPACK_IMPORTED_MODULE_1__/* .stripe.checkout.sessions.create */ .A.checkout.sessions.create({
            customer: customerId,
            payment_method_types: [
                "card"
            ],
            billing_address_collection: "required",
            line_items: [
                {
                    price: "price_1LX4FtHPsdRhfk5ZmDEdm9Xx",
                    quantity: 1
                }
            ],
            mode: "subscription",
            allow_promotion_codes: true,
            success_url: process.env.isDevelopment ? process.env.STRIPE_SUCCESS_URL : "https://blog.madeincode.com.br/posts",
            cancel_url: process.env.isDevelopment ? process.env.STRIPE_CANCEL_URL : "https://blog.madeincode.com.br"
        });
        return res.status(200).json({
            sessionId: stripeCheckoutSession.id
        });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method not allowed");
    }
});


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [368,133,359,87,950], () => (__webpack_exec__(5072)));
module.exports = __webpack_exports__;

})();