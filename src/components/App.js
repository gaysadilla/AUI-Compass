"use strict";
/// <reference types="react" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
// Screen states
var Screen;
(function (Screen) {
    Screen[Screen["Landing"] = 0] = "Landing";
    Screen[Screen["DeprecationSearchMode"] = 1] = "DeprecationSearchMode";
    Screen[Screen["Searching"] = 2] = "Searching";
    Screen[Screen["Results"] = 3] = "Results";
})(Screen || (Screen = {}));
const App = () => {
    const [screen, setScreen] = (0, react_1.useState)(Screen.Landing);
    const [results, setResults] = (0, react_1.useState)([]);
    // Navigation handlers
    const goToDeprecationAssistant = () => setScreen(Screen.DeprecationSearchMode);
    const goToSearch = () => {
        setScreen(Screen.Searching);
        // Send search message to plugin backend
        parent.postMessage({ pluginMessage: { type: 'search', data: { scope: 'page' } } }, '*');
    };
    const goToResults = () => setScreen(Screen.Results);
    const goToLanding = () => setScreen(Screen.Landing);
    // Listen for SEARCH_COMPLETE from plugin backend
    (0, react_1.useEffect)(() => {
        function handleMessage(event) {
            const msg = event.data.pluginMessage;
            if (msg && msg.type === 'search-complete') {
                console.log('AUI Compass: UI RECEIVED SEARCH_COMPLETE', msg.data);
                setResults(msg.data.components || []);
                setScreen(Screen.Results);
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    // UI3-like card style
    const cardStyle = {
        border: '1px solid #e5e5e5',
        borderRadius: 12,
        padding: 24,
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        minWidth: 220,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 16
    };
    // Main render
    console.log('AUI Compass: UI RENDER');
    return (react_1.default.createElement("div", { style: { padding: 32, background: '#f7f7f8', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } },
        screen === Screen.Landing && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 32 } },
                react_1.default.createElement("img", { src: "/icon.svg", alt: "AUI Compass", style: { width: 48, height: 48, marginRight: 16 } }),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h1", { style: { fontSize: 28, fontWeight: 700, margin: 0 } }, "AUI Compass"),
                    react_1.default.createElement("div", { style: { color: '#666', fontSize: 16 } }, "AUI's Plugin Suite to take your designs to the next level"))),
            react_1.default.createElement("div", { style: { display: 'flex', gap: 24, flexWrap: 'wrap' } },
                react_1.default.createElement("div", { style: cardStyle },
                    react_1.default.createElement("div", { style: { fontWeight: 600, fontSize: 18, marginBottom: 8 } },
                        "AUI Health Check ",
                        react_1.default.createElement("span", { style: { color: '#bfa700', fontSize: 12, marginLeft: 8 } }, "(Coming soon)")),
                    react_1.default.createElement("div", { style: { color: '#888', fontSize: 14 } }, "Get a quick status check of your AUI usage across your file")),
                react_1.default.createElement("div", { style: Object.assign(Object.assign({}, cardStyle), { border: '2px solid #18a0fb', cursor: 'pointer', position: 'relative' }), onClick: goToDeprecationAssistant },
                    react_1.default.createElement("div", { style: { fontWeight: 600, fontSize: 18, marginBottom: 8 } },
                        "Deprecation Assistant ",
                        react_1.default.createElement("span", { style: { color: '#a06bfa', fontSize: 12, marginLeft: 8 } }, "(In Beta)")),
                    react_1.default.createElement("div", { style: { color: '#888', fontSize: 14 } }, "Swap to the newest version of component with no data loss"),
                    react_1.default.createElement("span", { style: { position: 'absolute', top: 12, right: 12, background: '#18a0fb', color: '#fff', borderRadius: 8, fontSize: 12, padding: '2px 8px' } }, "Start")),
                react_1.default.createElement("div", { style: cardStyle },
                    react_1.default.createElement("div", { style: { fontWeight: 600, fontSize: 18, marginBottom: 8 } },
                        "Component Modules ",
                        react_1.default.createElement("span", { style: { color: '#bfa700', fontSize: 12, marginLeft: 8 } }, "(Coming soon)")),
                    react_1.default.createElement("div", { style: { color: '#888', fontSize: 14 } }, "Discover related component and modules for all of AUI's offerings")),
                react_1.default.createElement("div", { style: cardStyle },
                    react_1.default.createElement("div", { style: { fontWeight: 600, fontSize: 18, marginBottom: 8 } },
                        "Icon Gallery ",
                        react_1.default.createElement("span", { style: { color: '#bfa700', fontSize: 12, marginLeft: 8 } }, "(Coming soon)")),
                    react_1.default.createElement("div", { style: { color: '#888', fontSize: 14 } }, "View all available icons from AUI in one easy to view place"))))),
        screen === Screen.DeprecationSearchMode && (react_1.default.createElement("div", { style: { maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } },
            react_1.default.createElement("button", { onClick: goToLanding, style: { background: 'none', border: 'none', color: '#18a0fb', fontSize: 14, marginBottom: 16, cursor: 'pointer' } },
                '<',
                " Back"),
            react_1.default.createElement("h2", { style: { fontSize: 22, fontWeight: 700, marginBottom: 8 } }, "Deprecation Assistant"),
            react_1.default.createElement("div", { style: { color: '#666', marginBottom: 24 } }, "Our Deprecation Assistant automatically updates deprecated design system components across your Figma files, saving hours of manual work while ensuring your designs stay consistent with the latest standards."),
            react_1.default.createElement("div", { style: { marginBottom: 16, color: '#18a0fb', cursor: 'pointer', fontSize: 14, fontWeight: 500 } }, "How does this work?"),
            react_1.default.createElement("div", { style: { display: 'flex', gap: 16, marginTop: 16 } },
                react_1.default.createElement("button", { onClick: goToSearch, style: { flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' } }, "Current selection"),
                react_1.default.createElement("button", { onClick: goToSearch, style: { flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' } }, "Current page"),
                react_1.default.createElement("button", { onClick: goToSearch, style: { flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' } }, "Entire file")))),
        screen === Screen.Searching && (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 } },
            react_1.default.createElement("div", { className: "spinner", style: { width: 48, height: 48, border: '4px solid #e5e5e5', borderTop: '4px solid #18a0fb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 } }),
            react_1.default.createElement("div", { style: { fontSize: 18, color: '#666' } }, "Searching current page..."))),
        screen === Screen.Results && (react_1.default.createElement("div", { style: { maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } },
            react_1.default.createElement("h2", { style: { fontSize: 22, fontWeight: 700, marginBottom: 8 } },
                results.length,
                " deprecated components found"),
            react_1.default.createElement("div", { style: { color: '#666', marginBottom: 24 } }, "Select the component you want to update"),
            react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 } }, results.map((item, idx) => (react_1.default.createElement("div", { key: item.key, style: { border: '1px solid #e5e5e5', borderRadius: 10, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f7f8', cursor: 'pointer' } },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { style: { fontWeight: 600, fontSize: 17 } }, item.name),
                    react_1.default.createElement("div", { style: { color: '#bfa700', fontSize: 13, fontWeight: 500 } },
                        item.instanceCount,
                        " instances"),
                    react_1.default.createElement("div", { style: { color: '#888', fontSize: 13 } },
                        "Deprecated: ",
                        new Date(item.deprecatedDate).toLocaleString('default', { month: 'short', year: 'numeric' }))),
                react_1.default.createElement("div", { style: { color: '#18a0fb', fontWeight: 700, fontSize: 22 } }, '>'))))),
            react_1.default.createElement("div", { style: { display: 'flex', gap: 12, marginTop: 32 } },
                react_1.default.createElement("button", { style: { flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e5e5', background: '#f7f7f8', color: '#aaa', fontWeight: 500, fontSize: 15, cursor: 'not-allowed' } }, "Undo last change"),
                react_1.default.createElement("button", { style: { flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e5e5', background: '#f7f7f8', color: '#aaa', fontWeight: 500, fontSize: 15, cursor: 'not-allowed' } }, "Undo all changes")))),
        react_1.default.createElement("style", null, `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `)));
};
exports.default = App;
