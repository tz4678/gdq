# Google Dork Queries by tz4678

Используем безмозглый Хромиум для поиска уязвимостей в Google.

## Установка

```zsh
$ npm run build
$ npm link
$ gdq -h
```

## Решение проблем

В версии puppeteer 5.0.0 неправильно распаковывается Chromium.

Workaround:

```zsh
$ unzip node_modules/puppeteer/.local-chromium/chrome-linux.zip
$ mv chrome-linux/* node_modules/puppeteer/.local-chromium/linux-756035/chrome-linux
$ rmdir chrome-linux
```
