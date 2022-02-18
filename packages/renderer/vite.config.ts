import { builtinModules } from 'module'
import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import resolve from 'vite-plugin-resolve'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import pkg from '../../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  resolve: {
    alias: [
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
      },
    ],
  },
  plugins: [
    vue(),
    resolveElectron(
      /**
       * Here you can specify other modules
       * 🚧 You have to make sure that your module is in `dependencies` and not in the` devDependencies`,
       *    which will ensure that the electron-builder can package it correctly
       * @example
       * {
       *   'electron-store': 'const Store = require("electron-store"); export default Store;',
       * }
       */
    ),
    Pages({
      extensions: ['vue'],
    }),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),

    Components({
      extensions: ['vue'],
      include: [/\.vue$/],
      dts: 'src/components.d.ts',
      resolvers: [
        // auto import icons
        IconsResolver({
          prefix: false,
          // enabledCollections: ['carbon']
        }),
      ],
    }),

    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve(__dirname, 'locales/**')],
    }),

    Icons({
      autoInstall: true,
    }),

    Layouts(),
  ],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer',
  },
  server: {
    port: pkg.env.PORT,
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
    ],
  },
})

/**
 * For usage of Electron and NodeJS APIs in the Renderer process
 * @see https://github.com/caoxiemeihao/electron-vue-vite/issues/52
 */
export function resolveElectron(
  resolves: Parameters<typeof resolve>[0] = {},
): Plugin {
  const builtins = builtinModules.filter(t => !t.startsWith('_'))

  /**
   * @see https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme
   */
  return resolve({
    electron: electronExport(),
    ...builtinModulesExport(builtins),
    ...resolves,
  })

  function electronExport() {
    return `
/**
 * For all exported modules see https://www.electronjs.org/docs/latest/api/clipboard -> Renderer Process Modules
 */
const electron = require("electron");
const {
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
  deprecate,
} = electron;

export {
  electron as default,
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
  deprecate,
}
`
  }

  function builtinModulesExport(modules: string[]) {
    return modules
      .map((moduleId) => {
        const nodeModule = require(moduleId)
        const requireModule = `const M = require("${moduleId}");`
        const exportDefault = 'export default M;'
        const exportMembers
          = `${Object.keys(nodeModule)
            .map(attr => `export const ${attr} = M.${attr}`)
            .join(';\n')};`
        const nodeModuleCode = `
${requireModule}

${exportDefault}

${exportMembers}
`

        return { [moduleId]: nodeModuleCode }
      })
      .reduce((memo, item) => Object.assign(memo, item), {})
  }
}
