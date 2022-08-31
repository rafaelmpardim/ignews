"use strict";
exports.id = 950;
exports.ids = [950];
exports.modules = {

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


/***/ }),

/***/ 9371:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "A": () => (/* binding */ stripe)
/* harmony export */ });
/* harmony import */ var _node_modules_stripe_lib_stripe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3133);
/* harmony import */ var _node_modules_stripe_lib_stripe__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_stripe_lib_stripe__WEBPACK_IMPORTED_MODULE_0__);

const stripe = new (_node_modules_stripe_lib_stripe__WEBPACK_IMPORTED_MODULE_0___default())(process.env.STRIPE_API_KEY, {
    apiVersion: "2020-08-27",
    appInfo: {
        name: "Ignews"
    }
});


/***/ })

};
;