(() => {
var exports = {};
exports.id = 405;
exports.ids = [405];
exports.modules = {

/***/ 9515:
/***/ ((module) => {

// Exports
module.exports = {
	"subscribeButton": "styles_subscribeButton__52c6u"
};


/***/ }),

/***/ 8339:
/***/ ((module) => {

// Exports
module.exports = {
	"contentContainer": "home_contentContainer__HYuN8",
	"hero": "home_hero__lhpWS"
};


/***/ }),

/***/ 1081:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ Home),
  "getStaticProps": () => (/* binding */ getStaticProps)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: ./node_modules/next/head.js
var head = __webpack_require__(9008);
var head_default = /*#__PURE__*/__webpack_require__.n(head);
// EXTERNAL MODULE: ./node_modules/next-auth/react/index.js
var react = __webpack_require__(3299);
// EXTERNAL MODULE: ./node_modules/next/router.js
var next_router = __webpack_require__(1163);
// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__(9669);
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);
;// CONCATENATED MODULE: ./src/services/api.ts

const api = axios_default().create({
    baseURL: "/api"
});

// EXTERNAL MODULE: ./node_modules/@stripe/stripe-js/pure.js
var pure = __webpack_require__(8156);
;// CONCATENATED MODULE: ./src/services/stripe-js.ts

async function getStripeJs() {
    const stripeJs = await (0,pure.loadStripe)("pk_test_51LX4BLHPsdRhfk5Zrc96AapmXFruUQwbhtuYtAe4e2Wz3AQDmeGnPEK2dqAFX8G4H8Q6VoQosVWSdBFthKnkJlOR00qCwoQvOZ");
    return stripeJs;
}

// EXTERNAL MODULE: ./src/components/SubscribeButton/styles.module.scss
var styles_module = __webpack_require__(9515);
var styles_module_default = /*#__PURE__*/__webpack_require__.n(styles_module);
;// CONCATENATED MODULE: ./src/components/SubscribeButton/index.tsx






function SubscribeButton({ priceId  }) {
    const { data: session  } = (0,react.useSession)();
    const router = (0,next_router.useRouter)();
    async function handleSubscribe() {
        if (!session) {
            (0,react.signIn)();
            return;
        }
        if (session?.activeSubscription) {
            router.push("/posts");
            return;
        }
        try {
            const response = await api.post("/subscribe");
            const { sessionId  } = response.data;
            const stripe = await getStripeJs();
            stripe.redirectToCheckout({
                sessionId: sessionId
            });
        } catch (err) {
            alert(err.message);
        }
    }
    return /*#__PURE__*/ jsx_runtime_.jsx("button", {
        className: (styles_module_default()).subscribeButton,
        type: "button",
        onClick: handleSubscribe,
        children: "Subscribe now"
    });
}

// EXTERNAL MODULE: ./node_modules/stripe/lib/stripe.js
var stripe = __webpack_require__(5514);
var stripe_default = /*#__PURE__*/__webpack_require__.n(stripe);
;// CONCATENATED MODULE: ./src/services/stripe.ts

const stripe_stripe = new (stripe_default())(process.env.STRIPE_API_KEY, {
    apiVersion: "2020-08-27",
    appInfo: {
        name: "Ignews"
    }
});

// EXTERNAL MODULE: ./src/pages/home.module.scss
var home_module = __webpack_require__(8339);
var home_module_default = /*#__PURE__*/__webpack_require__.n(home_module);
;// CONCATENATED MODULE: ./src/pages/index.tsx





function Home({ product  }) {
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx((head_default()), {
                children: /*#__PURE__*/ jsx_runtime_.jsx("title", {
                    children: "ig.news | Home"
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("main", {
                className: (home_module_default()).contentContainer,
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("section", {
                        className: (home_module_default()).hero,
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                children: "\uD83D\uDC4F Hey, welcome"
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("h1", {
                                children: [
                                    "News about the ",
                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                        children: "React"
                                    }),
                                    " world."
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                children: [
                                    "Get access to all the publications",
                                    /*#__PURE__*/ jsx_runtime_.jsx("br", {}),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                                        children: [
                                            "for ",
                                            product.amount,
                                            " month"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(SubscribeButton, {
                                priceId: product.priceId
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("img", {
                        src: "/images/avatar.svg",
                        alt: "Gril coding"
                    })
                ]
            })
        ]
    });
};
const getStaticProps = async ()=>{
    const price = await stripe_stripe.prices.retrieve("price_1LX4FtHPsdRhfk5ZmDEdm9Xx");
    const product = {
        priceId: price.id,
        amount: new Intl.NumberFormat("es-US", {
            style: "currency",
            currency: "USD"
        }).format(price.unit_amount / 100)
    };
    return {
        props: {
            product
        },
        revalidate: 60 * 60 * 24 // 24 hours
    };
};


/***/ }),

/***/ 6953:
/***/ ((module) => {

"use strict";
module.exports = require("follow-redirects");

/***/ }),

/***/ 8941:
/***/ ((module) => {

"use strict";
module.exports = require("form-data");

/***/ }),

/***/ 2796:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head-manager-context.js");

/***/ }),

/***/ 4957:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head.js");

/***/ }),

/***/ 4014:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 8524:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/is-plain-object.js");

/***/ }),

/***/ 8020:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 4406:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/page-path/denormalize-page-path.js");

/***/ }),

/***/ 4964:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 1751:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix.js");

/***/ }),

/***/ 6220:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/compare-states.js");

/***/ }),

/***/ 299:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-next-pathname-info.js");

/***/ }),

/***/ 3938:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-url.js");

/***/ }),

/***/ 9565:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 5789:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-next-pathname-info.js");

/***/ }),

/***/ 1428:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 8854:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-path.js");

/***/ }),

/***/ 1292:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 4567:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix.js");

/***/ }),

/***/ 979:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 3297:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js");

/***/ }),

/***/ 6052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/resolve-rewrites.js");

/***/ }),

/***/ 4226:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 5052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 9232:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 7104:
/***/ ((module) => {

"use strict";
module.exports = require("qs");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 2081:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 7310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [952,273,299,163,738], () => (__webpack_exec__(1081)));
module.exports = __webpack_exports__;

})();