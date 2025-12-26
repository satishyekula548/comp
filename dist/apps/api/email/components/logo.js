"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = Logo;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function Logo() {
    return ((0, jsx_runtime_1.jsx)(components_1.Section, { className: "mt-[32px]", children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: 'https://assets.trycomp.ai/logo.png', width: "45", height: "45", alt: "Comp AI", className: "mx-auto my-0 block" }) }));
}
