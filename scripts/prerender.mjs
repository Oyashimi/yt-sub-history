/**
 * ビルド後に /privacy・/terms の静的 HTML を dist に書き出す。
 *
 * npm run build の流れ:
 *   1. vite build                          -> dist/index.html(+assets)
 *   2. vite build --ssr src/prerender.ts   -> dist-ssr/prerender.js
 *   3. node scripts/prerender.mjs          -> dist/privacy/index.html, dist/terms/index.html
 *
 * 目的は「JS を実行しない相手にポリシー本文を見せる」こと。
 * Google の OAuth ブランディング確認がここを読む。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const templatePath = join(distDir, 'index.html')

const HEAD_MARKER = ['<!-- prerender:head -->', '<!-- /prerender:head -->']
const APP_MARKER = ['<!-- prerender:app -->', '<!-- /prerender:app -->']

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** マーカーで囲まれた範囲を replacement に差し替える */
function replaceBlock(html, [start, end], replacement, label) {
  const from = html.indexOf(start)
  const to = html.indexOf(end)
  if (from === -1 || to === -1 || to < from) {
    throw new Error(
      `index.html に ${label} のマーカー(${start} … ${end})が見つかりません。` +
        'index.html を編集したときにマーカーを消していないか確認してください。',
    )
  }
  return html.slice(0, from + start.length) + replacement + html.slice(to)
}

const { pages, render } = await import(pathToFileURL(join(root, 'dist-ssr/prerender.js')).href)
const template = await readFile(templatePath, 'utf8')

for (const page of pages) {
  const body = await render(page.route)
  const head = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
  ].join('\n    ')

  let html = replaceBlock(template, HEAD_MARKER, `\n    ${head}\n    `, 'head')
  html = replaceBlock(html, APP_MARKER, `\n    <div id="app">${body}</div>\n    `, 'app')

  const outPath = join(distDir, page.out)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, html)
  console.log(`prerendered ${page.route} -> dist/${page.out}`)
}
