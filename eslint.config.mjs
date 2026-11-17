import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // Exceptions raisonnées pour un site francophone :
    // les apostrophes françaises (d', l', n') déclencheraient cette règle partout.
    "react/no-unescaped-entities": "off",
    // <img> assumé : images locales légères (31–133 Ko), pas de pipeline d'optimisation
    // souhaité pour ce site ; next/image ajouterait une complexité inutile ici.
    "@next/next/no-img-element": "off",
  },
}, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "skills/**",
    // Scripts d'exploitation (seed, icônes) hors périmètre applicatif
    "scripts/**",
  ]
}];

export default eslintConfig;
