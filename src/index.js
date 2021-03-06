#!/usr/bin/env node
import chalk from 'chalk'
import { program } from 'commander'
import fs from 'fs'
import puppeteer from 'puppeteer'
import Package from '../package.json'
const googleURL = 'https://www.google.com/'
// https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
]
;(async () => {
  try {
    program
      .version(Package.version)
      .description(Package.description)
      .arguments('<query>')
      .option('-o --output <string>', 'Output filename', 'results.txt')
      .option('-p --pages <int>', 'How many pages to crawl', parseInt, Infinity)
      .option('-d --delay <int>', 'Page loading delay', parseInt, 1500)
      .parse(process.argv)
    const query = program.args[0]
    const instance = await puppeteer.launch()
    const page = await instance.newPage()
    // Используем рандомный UA
    await page.setUserAgent(userAgents[(userAgents.length * Math.random()) | 0])
    await page.goto(googleURL)
    await page.waitFor(program.delay)
    await page.type('input[name="q"]', query)
    await page.keyboard.press('Enter')
    const results = new Set()
    for (let pageNum = 1; pageNum <= program.pages; pageNum++) {
      console.log(chalk.blue('process page: %s'), pageNum)
      await page.waitFor(program.delay)
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
    await instance.close()
    await fs.promises.writeFile(program.output, [...results].join('\n'))
    process.exit(0)
  } catch (err) {
    console.error(chalk.red(err))
    process.exit(1)
  }
})()
