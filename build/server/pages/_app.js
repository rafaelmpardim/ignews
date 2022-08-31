(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 7198:
/***/ ((module) => {

// Exports
module.exports = {
	"headerContainer": "styles_headerContainer__uAgJk",
	"headerContent": "styles_headerContent__h9eUe",
	"active": "styles_active__l7I1o"
};


/***/ }),

/***/ 5822:
/***/ ((module) => {

// Exports
module.exports = {
	"sigInButton": "styles_sigInButton__t3Cs9",
	"closeIcon": "styles_closeIcon__yr0aw"
};


/***/ }),

/***/ 7832:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ MyApp)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
;// CONCATENATED MODULE: external "react-icons/fa/index"
const index_namespaceObject = require("react-icons/fa/index");
;// CONCATENATED MODULE: external "react-icons/fi/index"
const fi_index_namespaceObject = require("react-icons/fi/index");
// EXTERNAL MODULE: ./node_modules/next-auth/react/index.js
var react = __webpack_require__(3299);
// EXTERNAL MODULE: ./src/components/SignInButton/styles.module.scss
var styles_module = __webpack_require__(5822);
var styles_module_default = /*#__PURE__*/__webpack_require__.n(styles_module);
;// CONCATENATED MODULE: ./src/components/SignInButton/index.tsx





function SignInButton() {
    const { data: session  } = (0,react.useSession)();
    if (session) {
        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
            className: (styles_module_default()).sigInButton,
            type: "button",
            onClick: ()=>(0,react.signOut)(),
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx(index_namespaceObject.FaGithub, {
                    color: "#04d361"
                }),
                session.user.name,
                /*#__PURE__*/ jsx_runtime_.jsx(fi_index_namespaceObject.FiX, {
                    color: "#737380",
                    className: (styles_module_default()).closeIcon
                })
            ]
        });
    } else {
        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
            className: (styles_module_default()).sigInButton,
            type: "button",
            onClick: ()=>(0,react.signIn)(),
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx(index_namespaceObject.FaGithub, {
                    color: "#eba417"
                }),
                "Sign in with Github"
            ]
        });
    }
}

// EXTERNAL MODULE: ./src/components/Header/styles.module.scss
var Header_styles_module = __webpack_require__(7198);
var Header_styles_module_default = /*#__PURE__*/__webpack_require__.n(Header_styles_module);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
// EXTERNAL MODULE: ./node_modules/next/router.js
var router = __webpack_require__(1163);
;// CONCATENATED MODULE: ./src/components/ActiveLink/index.tsx




function ActiveLink({ children , activeClassName , ...rest }) {
    const { asPath  } = (0,router.useRouter)();
    const className = asPath === rest.href ? activeClassName : "";
    return /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
        ...rest,
        children: /*#__PURE__*/ (0,external_react_.cloneElement)(children, {
            className
        })
    });
} // 

;// CONCATENATED MODULE: ./src/components/Header/index.tsx




function Header() {
    return /*#__PURE__*/ jsx_runtime_.jsx("header", {
        className: (Header_styles_module_default()).headerContainer,
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: (Header_styles_module_default()).headerContent,
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx("img", {
                    src: "/images/logo.svg",
                    alt: "ig.news"
                }),
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("nav", {
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx(ActiveLink, {
                            activeClassName: (Header_styles_module_default()).active,
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: "Home"
                            })
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx(ActiveLink, {
                            activeClassName: (Header_styles_module_default()).active,
                            href: "/posts",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: "Posts"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ jsx_runtime_.jsx(SignInButton, {})
            ]
        })
    });
}

;// CONCATENATED MODULE: ./src/pages/_app.tsx




function MyApp({ Component , pageProps: { session , ...pageProps }  }) {
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(react.SessionProvider, {
        session: session,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Header, {}),
            /*#__PURE__*/ jsx_runtime_.jsx(Component, {
                ...pageProps
            })
        ]
    });
};


/***/ }),

/***/ 3280:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/app-router-context.js");

/***/ }),

/***/ 2796:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head-manager-context.js");

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

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [952,273,299,664,163], () => (__webpack_exec__(7832)));
module.exports = __webpack_exports__;

})();