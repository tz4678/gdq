#!/usr/bin/env node
import chalk from 'chalk'
import { program } from 'commander'
import fs from 'fs'
import puppeteer from 'puppeteer'
import Package from '../package.json'
// @url https://www.whatismybrowser.com/guides/the-latest-user-agent/chrome
// @apply $$('.code').map(el => el.textContent)
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
]
;(async () => {
  try {
    program
      .version(Package.version)
      .description(Package.description)
      .arguments('<query>')
      .option('-p --pages <int>', 'How many pages to crawl', parseInt, 15)
      .option('-o --output <string>', 'Output filename', 'results.txt')
      .parse(process.argv)
    const query = program.args[0]
    console.info(chalk.yellow('run headless chromium'))
    const instance = await puppeteer.launch()
    const page = await instance.newPage()
    // Используем рандомный UA
    await page.setUserAgent(userAgents[(userAgents.length * Math.random()) | 0])
    console.info(chalk.yellow('start search'))
    await page.goto('https://www.google.com/')
    await page.waitFor(3000)
    await page.type('input[name="q"]', query)
    await page.keyboard.press('Enter')
    const results = new Set()
    for (let pageNum = 1; pageNum <= program.pages; pageNum++) {
      console.log(chalk.blue('process page: %s'), pageNum)
      await page.waitFor(3000)
      // await page.screenshot({ path: './screenshot.png' })
      // Парсим результаты
      const links = await page.evaluate(() =>
        [...document.querySelectorAll('.r > a')].map(a => a.href),
      )
      // Ничего не найдено, Captcha
      if (links.length === 0) {
        break
      }
      // console.log(links)
      links.forEach(results.add, results)
      const next = await page.$('#pnnext')
      if (!next) {
        break
      }
      await next.click()
    }
    await fs.promises.writeFile(program.output, [...results].join('\n'))
    await instance.close()
  } catch (err) {
    console.error(chalk.red(err))
    process.exit(1)
  }
})()
