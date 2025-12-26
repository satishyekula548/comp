"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = Footer;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function Footer() {
    return ((0, jsx_runtime_1.jsxs)(components_1.Section, { className: "w-full", children: [(0, jsx_runtime_1.jsx)(components_1.Hr, {}), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "font-regular text-[14px]", children: ["AI that handles compliance for you -", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: "https://trycomp.ai?utm_source=email&utm_medium=footer", children: "Comp AI" }), "."] }), (0, jsx_runtime_1.jsx)(components_1.Text, { className: "text-xs text-[#B8B8B8]", children: "Comp AI | 2261 Market Street, San Francisco, CA 94114" })] }));
}
