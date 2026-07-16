"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/supplier/route";
exports.ids = ["app/api/supplier/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsupplier%2Froute&page=%2Fapi%2Fsupplier%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsupplier%2Froute.ts&appDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsupplier%2Froute&page=%2Fapi%2Fsupplier%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsupplier%2Froute.ts&appDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_sule_Projects_inventory_dashboard_src_app_api_supplier_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/supplier/route.ts */ \"(rsc)/./src/app/api/supplier/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/supplier/route\",\n        pathname: \"/api/supplier\",\n        filename: \"route\",\n        bundlePath: \"app/api/supplier/route\"\n    },\n    resolvedPagePath: \"/home/sule/Projects/inventory_dashboard/src/app/api/supplier/route.ts\",\n    nextConfigOutput,\n    userland: _home_sule_Projects_inventory_dashboard_src_app_api_supplier_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/supplier/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdXBwbGllciUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGc3VwcGxpZXIlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZzdXBwbGllciUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGc3VsZSUyRlByb2plY3RzJTJGaW52ZW50b3J5X2Rhc2hib2FyZCUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRnN1bGUlMkZQcm9qZWN0cyUyRmludmVudG9yeV9kYXNoYm9hcmQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3FCO0FBQ2xHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW52ZW50b3J5LWRhc2hib2FyZC8/ZGY5YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9zdWxlL1Byb2plY3RzL2ludmVudG9yeV9kYXNoYm9hcmQvc3JjL2FwcC9hcGkvc3VwcGxpZXIvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3N1cHBsaWVyL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc3VwcGxpZXJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3N1cHBsaWVyL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL2hvbWUvc3VsZS9Qcm9qZWN0cy9pbnZlbnRvcnlfZGFzaGJvYXJkL3NyYy9hcHAvYXBpL3N1cHBsaWVyL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9zdXBwbGllci9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsupplier%2Froute&page=%2Fapi%2Fsupplier%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsupplier%2Froute.ts&appDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/supplier/route.ts":
/*!***************************************!*\
  !*** ./src/app/api/supplier/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _lib_apiAuth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/apiAuth */ \"(rsc)/./src/lib/apiAuth.ts\");\n\n\n\nasync function GET() {\n    const { error, session } = await (0,_lib_apiAuth__WEBPACK_IMPORTED_MODULE_2__.requirePermission)(\"pengadaan.view\");\n    if (error) return error;\n    const data = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.supplier.findMany({\n        where: {\n            companyId: (0,_lib_apiAuth__WEBPACK_IMPORTED_MODULE_2__.getCompanyId)(session)\n        },\n        orderBy: {\n            nama: \"asc\"\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n}\nasync function POST(req) {\n    const { error, session } = await (0,_lib_apiAuth__WEBPACK_IMPORTED_MODULE_2__.requirePermission)(\"pengadaan.manage\");\n    if (error) return error;\n    const body = await req.json();\n    if (!body.nama) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        message: \"Nama supplier wajib diisi\"\n    }, {\n        status: 400\n    });\n    const supplier = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.supplier.create({\n        data: {\n            nama: body.nama,\n            alamat: body.alamat,\n            telepon: body.telepon,\n            email: body.email,\n            companyId: (0,_lib_apiAuth__WEBPACK_IMPORTED_MODULE_2__.getCompanyId)(session)\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(supplier, {\n        status: 201\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9zdXBwbGllci9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUF3RDtBQUNsQjtBQUMwQjtBQUV6RCxlQUFlSTtJQUNwQixNQUFNLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFLEdBQUcsTUFBTUosK0RBQWlCQSxDQUFDO0lBQ25ELElBQUlHLE9BQU8sT0FBT0E7SUFDbEIsTUFBTUUsT0FBTyxNQUFNTiwrQ0FBTUEsQ0FBQ08sUUFBUSxDQUFDQyxRQUFRLENBQUM7UUFDMUNDLE9BQU87WUFBRUMsV0FBV1IsMERBQVlBLENBQUNHO1FBQVU7UUFDM0NNLFNBQVM7WUFBRUMsTUFBTTtRQUFNO0lBQ3pCO0lBQ0EsT0FBT2IscURBQVlBLENBQUNjLElBQUksQ0FBQ1A7QUFDM0I7QUFFTyxlQUFlUSxLQUFLQyxHQUFnQjtJQUN6QyxNQUFNLEVBQUVYLEtBQUssRUFBRUMsT0FBTyxFQUFFLEdBQUcsTUFBTUosK0RBQWlCQSxDQUFDO0lBQ25ELElBQUlHLE9BQU8sT0FBT0E7SUFDbEIsTUFBTVksT0FBTyxNQUFNRCxJQUFJRixJQUFJO0lBQzNCLElBQUksQ0FBQ0csS0FBS0osSUFBSSxFQUFFLE9BQU9iLHFEQUFZQSxDQUFDYyxJQUFJLENBQUM7UUFBRUksU0FBUztJQUE0QixHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUNqRyxNQUFNWCxXQUFXLE1BQU1QLCtDQUFNQSxDQUFDTyxRQUFRLENBQUNZLE1BQU0sQ0FBQztRQUM1Q2IsTUFBTTtZQUNKTSxNQUFNSSxLQUFLSixJQUFJO1lBQ2ZRLFFBQVFKLEtBQUtJLE1BQU07WUFDbkJDLFNBQVNMLEtBQUtLLE9BQU87WUFDckJDLE9BQU9OLEtBQUtNLEtBQUs7WUFDakJaLFdBQVdSLDBEQUFZQSxDQUFDRztRQUMxQjtJQUNGO0lBQ0EsT0FBT04scURBQVlBLENBQUNjLElBQUksQ0FBQ04sVUFBVTtRQUFFVyxRQUFRO0lBQUk7QUFDbkQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pbnZlbnRvcnktZGFzaGJvYXJkLy4vc3JjL2FwcC9hcGkvc3VwcGxpZXIvcm91dGUudHM/MDQ4NCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5pbXBvcnQgeyByZXF1aXJlUGVybWlzc2lvbiwgZ2V0Q29tcGFueUlkIH0gZnJvbSBcIkAvbGliL2FwaUF1dGhcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3QgeyBlcnJvciwgc2Vzc2lvbiB9ID0gYXdhaXQgcmVxdWlyZVBlcm1pc3Npb24oXCJwZW5nYWRhYW4udmlld1wiKTtcbiAgaWYgKGVycm9yKSByZXR1cm4gZXJyb3I7XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBwcmlzbWEuc3VwcGxpZXIuZmluZE1hbnkoe1xuICAgIHdoZXJlOiB7IGNvbXBhbnlJZDogZ2V0Q29tcGFueUlkKHNlc3Npb24hKSB9LFxuICAgIG9yZGVyQnk6IHsgbmFtYTogXCJhc2NcIiB9LFxuICB9KTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgZXJyb3IsIHNlc3Npb24gfSA9IGF3YWl0IHJlcXVpcmVQZXJtaXNzaW9uKFwicGVuZ2FkYWFuLm1hbmFnZVwiKTtcbiAgaWYgKGVycm9yKSByZXR1cm4gZXJyb3I7XG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpO1xuICBpZiAoIWJvZHkubmFtYSkgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogXCJOYW1hIHN1cHBsaWVyIHdhamliIGRpaXNpXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgY29uc3Qgc3VwcGxpZXIgPSBhd2FpdCBwcmlzbWEuc3VwcGxpZXIuY3JlYXRlKHtcbiAgICBkYXRhOiB7XG4gICAgICBuYW1hOiBib2R5Lm5hbWEsXG4gICAgICBhbGFtYXQ6IGJvZHkuYWxhbWF0LFxuICAgICAgdGVsZXBvbjogYm9keS50ZWxlcG9uLFxuICAgICAgZW1haWw6IGJvZHkuZW1haWwsXG4gICAgICBjb21wYW55SWQ6IGdldENvbXBhbnlJZChzZXNzaW9uISksXG4gICAgfSxcbiAgfSk7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihzdXBwbGllciwgeyBzdGF0dXM6IDIwMSB9KTtcbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJyZXF1aXJlUGVybWlzc2lvbiIsImdldENvbXBhbnlJZCIsIkdFVCIsImVycm9yIiwic2Vzc2lvbiIsImRhdGEiLCJzdXBwbGllciIsImZpbmRNYW55Iiwid2hlcmUiLCJjb21wYW55SWQiLCJvcmRlckJ5IiwibmFtYSIsImpzb24iLCJQT1NUIiwicmVxIiwiYm9keSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJjcmVhdGUiLCJhbGFtYXQiLCJ0ZWxlcG9uIiwiZW1haWwiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/supplier/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/apiAuth.ts":
/*!****************************!*\
  !*** ./src/lib/apiAuth.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getCompanyId: () => (/* binding */ getCompanyId),\n/* harmony export */   requirePermission: () => (/* binding */ requirePermission)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _lib_rbac__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/rbac */ \"(rsc)/./src/lib/rbac.ts\");\n\n\n\n\n/**\n * Dipakai di awal setiap route handler untuk memastikan user login\n * dan memiliki izin yang sesuai. Jika modul baru ditambahkan, cukup\n * tentukan Permission baru di rbac.ts lalu panggil helper ini.\n */ async function requirePermission(permission) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) {\n        return {\n            session: null,\n            error: next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                message: \"Unauthorized\"\n            }, {\n                status: 401\n            })\n        };\n    }\n    if (!(0,_lib_rbac__WEBPACK_IMPORTED_MODULE_3__.can)(session.user.role, permission)) {\n        return {\n            session: null,\n            error: next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                message: \"Forbidden\"\n            }, {\n                status: 403\n            })\n        };\n    }\n    return {\n        session,\n        error: null\n    };\n}\n/**\n * MULTI-TENANT: setiap query WAJIB di-scope dengan companyId user yang\n * login, supaya data satu perusahaan tidak pernah terlihat/tertimpa oleh\n * perusahaan lain. Pakai ini di setiap route setelah requirePermission().\n */ function getCompanyId(session) {\n    return Number(session.user.companyId);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2FwaUF1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUE2QztBQUNGO0FBQ0Y7QUFDSTtBQUc3Qzs7OztDQUlDLEdBQ00sZUFBZUksa0JBQWtCQyxVQUFzQjtJQUM1RCxNQUFNQyxVQUFVLE1BQU1OLDJEQUFnQkEsQ0FBQ0Usa0RBQVdBO0lBRWxELElBQUksQ0FBQ0ksU0FBUztRQUNaLE9BQU87WUFBRUEsU0FBUztZQUFNQyxPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO2dCQUFFQyxTQUFTO1lBQWUsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQUc7SUFDakc7SUFFQSxJQUFJLENBQUNQLDhDQUFHQSxDQUFDRyxRQUFRSyxJQUFJLENBQUNDLElBQUksRUFBRVAsYUFBYTtRQUN2QyxPQUFPO1lBQUVDLFNBQVM7WUFBTUMsT0FBT04scURBQVlBLENBQUNPLElBQUksQ0FBQztnQkFBRUMsU0FBUztZQUFZLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUFHO0lBQzlGO0lBRUEsT0FBTztRQUFFSjtRQUFTQyxPQUFPO0lBQUs7QUFDaEM7QUFFQTs7OztDQUlDLEdBQ00sU0FBU00sYUFBYVAsT0FBZ0I7SUFDM0MsT0FBT1EsT0FBT1IsUUFBUUssSUFBSSxDQUFDSSxTQUFTO0FBQ3RDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW52ZW50b3J5LWRhc2hib2FyZC8uL3NyYy9saWIvYXBpQXV0aC50cz8xNWNhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcbmltcG9ydCB7IGNhbiwgUGVybWlzc2lvbiB9IGZyb20gXCJAL2xpYi9yYmFjXCI7XG5pbXBvcnQgdHlwZSB7IFNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5cbi8qKlxuICogRGlwYWthaSBkaSBhd2FsIHNldGlhcCByb3V0ZSBoYW5kbGVyIHVudHVrIG1lbWFzdGlrYW4gdXNlciBsb2dpblxuICogZGFuIG1lbWlsaWtpIGl6aW4geWFuZyBzZXN1YWkuIEppa2EgbW9kdWwgYmFydSBkaXRhbWJhaGthbiwgY3VrdXBcbiAqIHRlbnR1a2FuIFBlcm1pc3Npb24gYmFydSBkaSByYmFjLnRzIGxhbHUgcGFuZ2dpbCBoZWxwZXIgaW5pLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZVBlcm1pc3Npb24ocGVybWlzc2lvbjogUGVybWlzc2lvbikge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG5cbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgcmV0dXJuIHsgc2Vzc2lvbjogbnVsbCwgZXJyb3I6IE5leHRSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogXCJVbmF1dGhvcml6ZWRcIiB9LCB7IHN0YXR1czogNDAxIH0pIH07XG4gIH1cblxuICBpZiAoIWNhbihzZXNzaW9uLnVzZXIucm9sZSwgcGVybWlzc2lvbikpIHtcbiAgICByZXR1cm4geyBzZXNzaW9uOiBudWxsLCBlcnJvcjogTmV4dFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiBcIkZvcmJpZGRlblwiIH0sIHsgc3RhdHVzOiA0MDMgfSkgfTtcbiAgfVxuXG4gIHJldHVybiB7IHNlc3Npb24sIGVycm9yOiBudWxsIH07XG59XG5cbi8qKlxuICogTVVMVEktVEVOQU5UOiBzZXRpYXAgcXVlcnkgV0FKSUIgZGktc2NvcGUgZGVuZ2FuIGNvbXBhbnlJZCB1c2VyIHlhbmdcbiAqIGxvZ2luLCBzdXBheWEgZGF0YSBzYXR1IHBlcnVzYWhhYW4gdGlkYWsgcGVybmFoIHRlcmxpaGF0L3RlcnRpbXBhIG9sZWhcbiAqIHBlcnVzYWhhYW4gbGFpbi4gUGFrYWkgaW5pIGRpIHNldGlhcCByb3V0ZSBzZXRlbGFoIHJlcXVpcmVQZXJtaXNzaW9uKCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wYW55SWQoc2Vzc2lvbjogU2Vzc2lvbik6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoc2Vzc2lvbi51c2VyLmNvbXBhbnlJZCk7XG59XG4iXSwibmFtZXMiOlsiZ2V0U2VydmVyU2Vzc2lvbiIsIk5leHRSZXNwb25zZSIsImF1dGhPcHRpb25zIiwiY2FuIiwicmVxdWlyZVBlcm1pc3Npb24iLCJwZXJtaXNzaW9uIiwic2Vzc2lvbiIsImVycm9yIiwianNvbiIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJ1c2VyIiwicm9sZSIsImdldENvbXBhbnlJZCIsIk51bWJlciIsImNvbXBhbnlJZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/apiAuth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\nconst authOptions = {\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    },\n                    include: {\n                        company: true\n                    }\n                });\n                if (!user || !user.active) return null;\n                // Perusahaan dinonaktifkan (mis. langganan berhenti) -> tolak login.\n                if (!user.company || !user.company.isActive) return null;\n                const valid = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(credentials.password, user.password);\n                if (!valid) return null;\n                return {\n                    id: String(user.id),\n                    name: user.name,\n                    email: user.email,\n                    role: user.role,\n                    companyId: String(user.companyId),\n                    companyName: user.company.nama\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n                token.companyId = user.companyId;\n                token.companyName = user.companyName;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n                session.user.companyId = token.companyId;\n                session.user.companyName = token.companyName;\n            }\n            return session;\n        }\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDa0U7QUFDcEM7QUFDUTtBQUUvQixNQUFNRyxjQUErQjtJQUMxQ0MsU0FBUztRQUFFQyxVQUFVO0lBQU07SUFDM0JDLE9BQU87UUFDTEMsUUFBUTtJQUNWO0lBQ0FDLFdBQVc7UUFDVFIsMkVBQW1CQSxDQUFDO1lBQ2xCUyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFFMUQsTUFBTUUsT0FBTyxNQUFNZCwrQ0FBTUEsQ0FBQ2MsSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUFFUCxPQUFPRCxZQUFZQyxLQUFLO29CQUFDO29CQUNsQ1EsU0FBUzt3QkFBRUMsU0FBUztvQkFBSztnQkFDM0I7Z0JBQ0EsSUFBSSxDQUFDSixRQUFRLENBQUNBLEtBQUtLLE1BQU0sRUFBRSxPQUFPO2dCQUNsQyxxRUFBcUU7Z0JBQ3JFLElBQUksQ0FBQ0wsS0FBS0ksT0FBTyxJQUFJLENBQUNKLEtBQUtJLE9BQU8sQ0FBQ0UsUUFBUSxFQUFFLE9BQU87Z0JBRXBELE1BQU1DLFFBQVEsTUFBTXRCLHVEQUFjLENBQUNTLFlBQVlJLFFBQVEsRUFBRUUsS0FBS0YsUUFBUTtnQkFDdEUsSUFBSSxDQUFDUyxPQUFPLE9BQU87Z0JBRW5CLE9BQU87b0JBQ0xFLElBQUlDLE9BQU9WLEtBQUtTLEVBQUU7b0JBQ2xCaEIsTUFBTU8sS0FBS1AsSUFBSTtvQkFDZkUsT0FBT0ssS0FBS0wsS0FBSztvQkFDakJnQixNQUFNWCxLQUFLVyxJQUFJO29CQUNmQyxXQUFXRixPQUFPVixLQUFLWSxTQUFTO29CQUNoQ0MsYUFBYWIsS0FBS0ksT0FBTyxDQUFDVSxJQUFJO2dCQUNoQztZQUNGO1FBQ0Y7S0FDRDtJQUNEQyxXQUFXO1FBQ1QsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVqQixJQUFJLEVBQUU7WUFDdkIsSUFBSUEsTUFBTTtnQkFDUmlCLE1BQU1SLEVBQUUsR0FBRyxLQUFjQSxFQUFFO2dCQUMzQlEsTUFBTU4sSUFBSSxHQUFHLEtBQWNBLElBQUk7Z0JBQy9CTSxNQUFNTCxTQUFTLEdBQUcsS0FBY0EsU0FBUztnQkFDekNLLE1BQU1KLFdBQVcsR0FBRyxLQUFjQSxXQUFXO1lBQy9DO1lBQ0EsT0FBT0k7UUFDVDtRQUNBLE1BQU03QixTQUFRLEVBQUVBLE9BQU8sRUFBRTZCLEtBQUssRUFBRTtZQUM5QixJQUFJN0IsUUFBUVksSUFBSSxFQUFFO2dCQUNmWixRQUFRWSxJQUFJLENBQVNTLEVBQUUsR0FBR1EsTUFBTVIsRUFBRTtnQkFDbENyQixRQUFRWSxJQUFJLENBQVNXLElBQUksR0FBR00sTUFBTU4sSUFBSTtnQkFDdEN2QixRQUFRWSxJQUFJLENBQVNZLFNBQVMsR0FBR0ssTUFBTUwsU0FBUztnQkFDaER4QixRQUFRWSxJQUFJLENBQVNhLFdBQVcsR0FBR0ksTUFBTUosV0FBVztZQUN2RDtZQUNBLE9BQU96QjtRQUNUO0lBQ0Y7SUFDQThCLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUNyQyxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW52ZW50b3J5LWRhc2hib2FyZC8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgc2Vzc2lvbjogeyBzdHJhdGVneTogXCJqd3RcIiB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiBcImNyZWRlbnRpYWxzXCIsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfSxcbiAgICAgICAgICBpbmNsdWRlOiB7IGNvbXBhbnk6IHRydWUgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdXNlciB8fCAhdXNlci5hY3RpdmUpIHJldHVybiBudWxsO1xuICAgICAgICAvLyBQZXJ1c2FoYWFuIGRpbm9uYWt0aWZrYW4gKG1pcy4gbGFuZ2dhbmFuIGJlcmhlbnRpKSAtPiB0b2xhayBsb2dpbi5cbiAgICAgICAgaWYgKCF1c2VyLmNvbXBhbnkgfHwgIXVzZXIuY29tcGFueS5pc0FjdGl2ZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShjcmVkZW50aWFscy5wYXNzd29yZCwgdXNlci5wYXNzd29yZCk7XG4gICAgICAgIGlmICghdmFsaWQpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IFN0cmluZyh1c2VyLmlkKSxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICAgIGNvbXBhbnlJZDogU3RyaW5nKHVzZXIuY29tcGFueUlkKSxcbiAgICAgICAgICBjb21wYW55TmFtZTogdXNlci5jb21wYW55Lm5hbWEsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9ICh1c2VyIGFzIGFueSkuaWQ7XG4gICAgICAgIHRva2VuLnJvbGUgPSAodXNlciBhcyBhbnkpLnJvbGU7XG4gICAgICAgIHRva2VuLmNvbXBhbnlJZCA9ICh1c2VyIGFzIGFueSkuY29tcGFueUlkO1xuICAgICAgICB0b2tlbi5jb21wYW55TmFtZSA9ICh1c2VyIGFzIGFueSkuY29tcGFueU5hbWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkuaWQgPSB0b2tlbi5pZDtcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLnJvbGUgPSB0b2tlbi5yb2xlO1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkuY29tcGFueUlkID0gdG9rZW4uY29tcGFueUlkO1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkuY29tcGFueU5hbWUgPSB0b2tlbi5jb21wYW55TmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH0sXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxufTtcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiYmNyeXB0IiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJwYWdlcyIsInNpZ25JbiIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaW5jbHVkZSIsImNvbXBhbnkiLCJhY3RpdmUiLCJpc0FjdGl2ZSIsInZhbGlkIiwiY29tcGFyZSIsImlkIiwiU3RyaW5nIiwicm9sZSIsImNvbXBhbnlJZCIsImNvbXBhbnlOYW1lIiwibmFtYSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFFOUMsTUFBTUMsa0JBQWtCQztBQUVqQixNQUFNQyxTQUFTRixnQkFBZ0JFLE1BQU0sSUFBSSxJQUFJSCx3REFBWUEsR0FBRztBQUVuRSxJQUFJSSxJQUFxQyxFQUFFSCxnQkFBZ0JFLE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pbnZlbnRvcnktZGFzaGJvYXJkLy4vc3JjL2xpYi9wcmlzbWEudHM/MDFkNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQgfTtcblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPz8gbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/rbac.ts":
/*!*************************!*\
  !*** ./src/lib/rbac.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ROLE_LABEL: () => (/* binding */ ROLE_LABEL),\n/* harmony export */   can: () => (/* binding */ can)\n/* harmony export */ });\n/**\n * Role Based Access Control\n * -------------------------------------------------------------\n * Menambahkan modul baru? cukup daftarkan izinnya di sini.\n * Tidak perlu menyentuh middleware atau halaman lain.\n */ const rolePermissions = {\n    ADMIN: [\n        \"dashboard.view\",\n        \"barang.view\",\n        \"barang.manage\",\n        \"pengadaan.view\",\n        \"pengadaan.manage\",\n        \"penjualan.view\",\n        \"penjualan.manage\",\n        \"akuntansi.view\",\n        \"akuntansi.manage\",\n        \"users.manage\"\n    ],\n    MANAGER: [\n        \"dashboard.view\",\n        \"barang.view\",\n        \"barang.manage\",\n        \"pengadaan.view\",\n        \"pengadaan.manage\",\n        \"penjualan.view\",\n        \"penjualan.manage\",\n        \"akuntansi.view\",\n        \"akuntansi.manage\"\n    ],\n    STAFF: [\n        \"dashboard.view\",\n        \"barang.view\",\n        \"pengadaan.view\",\n        \"pengadaan.manage\",\n        \"penjualan.view\",\n        \"penjualan.manage\"\n    ]\n};\nfunction can(role, permission) {\n    if (!role) return false;\n    return rolePermissions[role]?.includes(permission) ?? false;\n}\nconst ROLE_LABEL = {\n    ADMIN: \"Administrator\",\n    MANAGER: \"Manajer\",\n    STAFF: \"Staff\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3JiYWMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7Q0FLQyxHQWVELE1BQU1BLGtCQUE4QztJQUNsREMsT0FBTztRQUNMO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO0tBQ0Q7SUFDREMsU0FBUztRQUNQO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNEO0lBQ0RDLE9BQU87UUFBQztRQUFrQjtRQUFlO1FBQWtCO1FBQW9CO1FBQWtCO0tBQW1CO0FBQ3RIO0FBRU8sU0FBU0MsSUFBSUMsSUFBc0IsRUFBRUMsVUFBc0I7SUFDaEUsSUFBSSxDQUFDRCxNQUFNLE9BQU87SUFDbEIsT0FBT0wsZUFBZSxDQUFDSyxLQUFLLEVBQUVFLFNBQVNELGVBQWU7QUFDeEQ7QUFFTyxNQUFNRSxhQUFtQztJQUM5Q1AsT0FBTztJQUNQQyxTQUFTO0lBQ1RDLE9BQU87QUFDVCxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW52ZW50b3J5LWRhc2hib2FyZC8uL3NyYy9saWIvcmJhYy50cz8zNjMxIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUm9sZSBCYXNlZCBBY2Nlc3MgQ29udHJvbFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogTWVuYW1iYWhrYW4gbW9kdWwgYmFydT8gY3VrdXAgZGFmdGFya2FuIGl6aW5ueWEgZGkgc2luaS5cbiAqIFRpZGFrIHBlcmx1IG1lbnllbnR1aCBtaWRkbGV3YXJlIGF0YXUgaGFsYW1hbiBsYWluLlxuICovXG5leHBvcnQgdHlwZSBSb2xlID0gXCJBRE1JTlwiIHwgXCJNQU5BR0VSXCIgfCBcIlNUQUZGXCI7XG5cbmV4cG9ydCB0eXBlIFBlcm1pc3Npb24gPVxuICB8IFwiZGFzaGJvYXJkLnZpZXdcIlxuICB8IFwiYmFyYW5nLnZpZXdcIlxuICB8IFwiYmFyYW5nLm1hbmFnZVwiXG4gIHwgXCJwZW5nYWRhYW4udmlld1wiXG4gIHwgXCJwZW5nYWRhYW4ubWFuYWdlXCJcbiAgfCBcInBlbmp1YWxhbi52aWV3XCJcbiAgfCBcInBlbmp1YWxhbi5tYW5hZ2VcIlxuICB8IFwiYWt1bnRhbnNpLnZpZXdcIlxuICB8IFwiYWt1bnRhbnNpLm1hbmFnZVwiXG4gIHwgXCJ1c2Vycy5tYW5hZ2VcIjtcblxuY29uc3Qgcm9sZVBlcm1pc3Npb25zOiBSZWNvcmQ8Um9sZSwgUGVybWlzc2lvbltdPiA9IHtcbiAgQURNSU46IFtcbiAgICBcImRhc2hib2FyZC52aWV3XCIsXG4gICAgXCJiYXJhbmcudmlld1wiLFxuICAgIFwiYmFyYW5nLm1hbmFnZVwiLFxuICAgIFwicGVuZ2FkYWFuLnZpZXdcIixcbiAgICBcInBlbmdhZGFhbi5tYW5hZ2VcIixcbiAgICBcInBlbmp1YWxhbi52aWV3XCIsXG4gICAgXCJwZW5qdWFsYW4ubWFuYWdlXCIsXG4gICAgXCJha3VudGFuc2kudmlld1wiLFxuICAgIFwiYWt1bnRhbnNpLm1hbmFnZVwiLFxuICAgIFwidXNlcnMubWFuYWdlXCIsXG4gIF0sXG4gIE1BTkFHRVI6IFtcbiAgICBcImRhc2hib2FyZC52aWV3XCIsXG4gICAgXCJiYXJhbmcudmlld1wiLFxuICAgIFwiYmFyYW5nLm1hbmFnZVwiLFxuICAgIFwicGVuZ2FkYWFuLnZpZXdcIixcbiAgICBcInBlbmdhZGFhbi5tYW5hZ2VcIixcbiAgICBcInBlbmp1YWxhbi52aWV3XCIsXG4gICAgXCJwZW5qdWFsYW4ubWFuYWdlXCIsXG4gICAgXCJha3VudGFuc2kudmlld1wiLFxuICAgIFwiYWt1bnRhbnNpLm1hbmFnZVwiLFxuICBdLFxuICBTVEFGRjogW1wiZGFzaGJvYXJkLnZpZXdcIiwgXCJiYXJhbmcudmlld1wiLCBcInBlbmdhZGFhbi52aWV3XCIsIFwicGVuZ2FkYWFuLm1hbmFnZVwiLCBcInBlbmp1YWxhbi52aWV3XCIsIFwicGVuanVhbGFuLm1hbmFnZVwiXSxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW4ocm9sZTogUm9sZSB8IHVuZGVmaW5lZCwgcGVybWlzc2lvbjogUGVybWlzc2lvbik6IGJvb2xlYW4ge1xuICBpZiAoIXJvbGUpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHJvbGVQZXJtaXNzaW9uc1tyb2xlXT8uaW5jbHVkZXMocGVybWlzc2lvbikgPz8gZmFsc2U7XG59XG5cbmV4cG9ydCBjb25zdCBST0xFX0xBQkVMOiBSZWNvcmQ8Um9sZSwgc3RyaW5nPiA9IHtcbiAgQURNSU46IFwiQWRtaW5pc3RyYXRvclwiLFxuICBNQU5BR0VSOiBcIk1hbmFqZXJcIixcbiAgU1RBRkY6IFwiU3RhZmZcIixcbn07XG4iXSwibmFtZXMiOlsicm9sZVBlcm1pc3Npb25zIiwiQURNSU4iLCJNQU5BR0VSIiwiU1RBRkYiLCJjYW4iLCJyb2xlIiwicGVybWlzc2lvbiIsImluY2x1ZGVzIiwiUk9MRV9MQUJFTCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/rbac.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/@babel","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsupplier%2Froute&page=%2Fapi%2Fsupplier%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsupplier%2Froute.ts&appDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsule%2FProjects%2Finventory_dashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();