/**
 * Language Colors
 * Color mappings from GitHub Linguist
 * Source: https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 */

export const LANGUAGE_COLORS: Record<string, string> = {
  // Popular languages
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  R: '#198CE7',
  MATLAB: '#e16737',
  Dart: '#00B4AB',
  Objective: '#438eff',
  Shell: '#89e051',
  PowerShell: '#012456',
  Lua: '#000080',
  Perl: '#0298c3',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Erlang: '#B83998',
  'Vim Script': '#199f4b',
  Emacs: '#c065db',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Jupyter: '#DA5B0B',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  CMake: '#DA3434',
  Assembly: '#6E4C13',
  WebAssembly: '#04133b',
  Solidity: '#AA6746',
  VHDL: '#adb2cb',
  Verilog: '#b2b7f8',
  TeX: '#3D6117',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  TOML: '#9c4221',
  XML: '#0060ac',
  Groovy: '#4298b8',
  Gradle: '#02303a',
};

/**
 * Default color for unknown languages
 */
export const DEFAULT_LANGUAGE_COLOR = '#cccccc';

/**
 * Special color for forked repositories
 */
export const FORK_COLOR = '#ededed';

/**
 * Get color for a language, with fallback to default
 */
export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR;
}
