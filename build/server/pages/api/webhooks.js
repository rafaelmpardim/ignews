"use strict";
(() => {
var exports = {};
exports.id = 857;
exports.ids = [857,540];
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

/***/ 7582:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "saveSubscription": () => (/* binding */ saveSubscription)
/* harmony export */ });
/* harmony import */ var _services_fauna__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(751);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9368);
/* harmony import */ var _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_stripe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9371);



async function saveSubscription(subscriptionId, customerId, createAction = false) {
    const userRef = await _services_fauna__WEBPACK_IMPORTED_MODULE_0__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Select("ref", _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Index("user_by_stripe_customer_id"), customerId))));
    const subscription = await _services_stripe__WEBPACK_IMPORTED_MODULE_2__/* .stripe.subscriptions.retrieve */ .A.subscriptions.retrieve(subscriptionId);
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id
    };
    if (createAction) {
        await _services_fauna__WEBPACK_IMPORTED_MODULE_0__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Create(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Collection("subscriptions"), {
            data: subscriptionData
        }));
    } else {
        await _services_fauna__WEBPACK_IMPORTED_MODULE_0__/* .fauna.query */ .r.query(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Replace(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Select("ref", _node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Get(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Match(_node_modules_faunadb_index__WEBPACK_IMPORTED_MODULE_1__.query.Index("subscription_by_id"), subscriptionId))), {
            data: subscriptionData
        }));
    }
}


/***/ }),

/***/ 8132:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "config": () => (/* binding */ config),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _services_stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9371);
/* harmony import */ var _lib_manageSubscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7582);
/* eslint-disable import/no-anonymous-default-export */ 

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable){
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}
const config = {
    api: {
        bodyParser: false
    }
};
const relevantEvents = new Set([
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted"
]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async (req, res)=>{
    if (req.method === "POST") {
        const buf = await buffer(req);
        const secret = req.headers["stripe-signature"];
        let event;
        try {
            event = _services_stripe__WEBPACK_IMPORTED_MODULE_0__/* .stripe.webhooks.constructEvent */ .A.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`);
        }
        const { type  } = event;
        if (relevantEvents.has(type)) {
            try {
                switch(type){
                    case "customer.subscription.updated":
                    case "customer.subscription.deleted":
                        const subscription = event.data.object;
                        await (0,_lib_manageSubscription__WEBPACK_IMPORTED_MODULE_1__.saveSubscription)(subscription.id, subscription.customer.toString(), false);
                        break;
                    case "checkout.session.completed":
                        const checkoutSession = event.data.object;
                        await (0,_lib_manageSubscription__WEBPACK_IMPORTED_MODULE_1__.saveSubscription)(checkoutSession.subscription.toString(), checkoutSession.customer.toString(), true);
                        break;
                    default:
                        throw new Error("Unhandled event");
                }
            } catch (err1) {
                return res.json({
                    error: "Webhook handler failed"
                });
            }
        }
        res.json({
            received: true
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
var __webpack_exports__ = __webpack_require__.X(0, [368,133,950], () => (__webpack_exec__(8132)));
module.exports = __webpack_exports__;

})();