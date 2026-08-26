#!/usr/bin/env node
/**
 * Eyris AI Init
 * Scaffolds AI agent configuration for your preferred IDE / AI coding tool.
 *
 * Interactive:  npm run ai-init
 * Direct flags: npm run ai-init -- --claude --cursor
 * Help:         npm run ai-init -- --help
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { emitKeypressEvents } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

// ─── Tool registry ────────────────────────────────────────────────────────────

const TOOLS = [
    { key: 'claude',      label: 'Claude Code',   sub: 'Anthropic',  dest: '.claude/',  src: 'claude' },
    { key: 'cursor',      label: 'Cursor',         sub: 'IDE',        dest: '.cursor/',  src: 'cursor' },
    { key: 'copilot',     label: 'GitHub Copilot', sub: 'Microsoft',  dest: '.github/',  src: 'copilot' },
    { key: 'kiro',        label: 'Kiro',           sub: 'IDE',        dest: '.kiro/',    src: 'kiro' },
    { key: 'antigravity', label: 'Antigravity',    sub: '',           dest: 'root',      src: 'antigravity' },
]

// ─── Arg parsing ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith('--')).map((a) => a.slice(2))

if (flags.includes('help')) {
    console.log(`
Eyris AI Init
-------------------------------------------------------
Usage:
  npm run ai-init              interactive tool selection
  npm run ai-init -- --<tool>  skip prompt (CI / scripted)

Supported tools:
  --claude       Claude Code (Anthropic)   -> CLAUDE.md + .claude/
  --cursor       Cursor IDE                -> .cursor/rules/
  --copilot      GitHub Copilot            -> .github/
  --kiro         Kiro IDE                  -> .kiro/steering/
  --antigravity  Antigravity               -> .agents/
`)
    process.exit(0)
}

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const R   = '\x1b[0m'
const B   = '\x1b[1m'
const DIM = '\x1b[2m'
const CYN = '\x1b[36m'
const GRN = '\x1b[32m'
const YLW = '\x1b[33m'

// ─── Interactive prompt ───────────────────────────────────────────────────────

function renderList(tools, cursorIdx, selected) {
    const lines = []
    lines.push(`${B}Select AI tools to set up${R}`)
    lines.push(`${DIM}up/down to move  space to toggle  a to select all  enter to confirm${R}`)
    lines.push('')
    for (let i = 0; i < tools.length; i++) {
        const t   = tools[i]
        const sel = selected.has(i) ? `${GRN}[x]${R}` : `${DIM}[ ]${R}`
        const ptr = i === cursorIdx ? `${CYN}>${R}` : ' '
        const lbl = i === cursorIdx ? `${B}${t.label}${R}` : t.label
        const sub = t.sub ? ` ${DIM}(${t.sub})${R}` : ''
        const dst = `${DIM}-> ${t.dest}${R}`
        lines.push(`  ${ptr} ${sel} ${lbl}${sub}  ${dst}`)
    }
    lines.push('')
    return lines
}

function promptCheckbox() {
    return new Promise((resolve) => {
        const { stdin, stdout } = process

        if (!stdin.isTTY) {
            resolve(null)
            return
        }

        let cursorIdx = 0
        const selected = new Set()
        let prevLineCount = 0

        function render() {
            if (prevLineCount > 0) {
                stdout.write(`\r\x1b[${prevLineCount - 1}A\x1b[0J`)
            }
            const lines = renderList(TOOLS, cursorIdx, selected)
            stdout.write(lines.join('\n'))
            prevLineCount = lines.length
        }

        function cleanup() {
            stdin.setRawMode(false)
            stdin.removeListener('keypress', onKey)
            stdin.pause()
            stdout.write('\n')
        }

        function onKey(_, key) {
            if (!key) return
            if (key.sequence === '\x03') {
                cleanup()
                console.log('Cancelled.')
                process.exit(0)
            } else if (key.name === 'up') {
                cursorIdx = (cursorIdx - 1 + TOOLS.length) % TOOLS.length
                render()
            } else if (key.name === 'down') {
                cursorIdx = (cursorIdx + 1) % TOOLS.length
                render()
            } else if (key.name === 'space' || key.sequence === ' ') {
                if (selected.has(cursorIdx)) selected.delete(cursorIdx)
                else selected.add(cursorIdx)
                render()
            } else if (key.sequence === 'a' || key.sequence === 'A') {
                if (selected.size === TOOLS.length) selected.clear()
                else TOOLS.forEach((_, i) => selected.add(i))
                render()
            } else if (key.name === 'return') {
                if (selected.size === 0) selected.add(cursorIdx)
                cleanup()
                resolve([...selected].map((i) => TOOLS[i].key))
            }
        }

        emitKeypressEvents(stdin)
        stdin.setRawMode(true)
        stdin.resume()
        stdin.on('keypress', onKey)

        stdout.write('\n')
        render()
    })
}

// ─── File helpers ─────────────────────────────────────────────────────────────

let created = 0
let skipped = 0

function copyDir(src, dest) {
    for (const entry of readdirSync(src)) {
        const srcPath  = join(src, entry)
        const destPath = join(dest, entry)

        if (statSync(srcPath).isDirectory()) {
            mkdirSync(destPath, { recursive: true })
            copyDir(srcPath, destPath)
        } else {
            const rel = relative(ROOT, destPath).replace(/\\/g, '/')
            if (existsSync(destPath)) {
                console.log(`  ${DIM}skip    ${rel}${R}`)
                skipped++
            } else {
                mkdirSync(dirname(destPath), { recursive: true })
                writeFileSync(destPath, readFileSync(srcPath))
                console.log(`  ${GRN}create  ${rel}${R}`)
                created++
            }
        }
    }
}

function runForKeys(keys) {
    const map = Object.fromEntries(TOOLS.map((t) => [t.key, t]))
    for (const key of keys) {
        const tool = map[key]
        if (!tool) {
            console.warn(`${YLW}unknown tool: ${key}${R}`)
            continue
        }
        console.log(`\n${B}[${key}]${R} ${tool.label}`)
        const src  = join(__dirname, 'templates', tool.src)
        const dest = ROOT  
        if (!existsSync(src)) {
            console.error(`  template not found: ${src}`)
            continue
        }
        copyDir(src, dest)
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const knownFlags   = flags.filter((f) => TOOLS.some((t) => t.key === f))
const unknownFlags = flags.filter((f) => f !== 'help' && !TOOLS.some((t) => t.key === f))

if (unknownFlags.length > 0) {
    console.warn(`${YLW}Unknown flag(s) ignored: ${unknownFlags.map((f) => '--' + f).join(', ')}${R}`)
}

console.log(`\n${B}${CYN}Eyris AI Init${R}`)
console.log('-------------------------------------------------------')

let selectedKeys

if (knownFlags.length > 0) {
    selectedKeys = knownFlags
    console.log(`${DIM}Direct mode: ${selectedKeys.join(', ')}${R}`)
} else {
    selectedKeys = await promptCheckbox()
    if (!selectedKeys) {
        console.log('No flags provided and terminal is not interactive. Run with --help for usage.')
        process.exit(1)
    }
}

if (selectedKeys.length === 0) {
    console.log(`\n${DIM}Nothing selected. Exiting.${R}`)
    process.exit(0)
}

runForKeys(selectedKeys)

console.log(`\n-------------------------------------------------------`)
const skippedNote = skipped > 0 ? `, ${skipped} skipped (already exist)` : ''
console.log(`${B}Done.${R} ${created} file(s) created${skippedNote}.`)
if (skipped > 0) {
    console.log(`${DIM}Tip: delete existing file(s) and re-run to regenerate.${R}`)
}
