import '@formatjs/intl-relativetimeformat/polyfill'
import LocaleProvider from '../../providers/Locale/Provider'
import React, { Suspense, useEffect, useState } from 'react'
import areIntlLocalesSupported from 'intl-locales-supported'
import intl from 'intl'
import { IntlProvider } from 'react-intl'
import { Switch } from 'react-router-dom'
import { getLocaleMessages } from '../../utils/locale'
import { useConfig } from '../../providers/Config'
import { useLocale } from '../../providers/Locale'

const loadLocalePolyfill = (locale) => {
  // START: Intl polyfill
  // Required for working on Safari
  // Code from here: https://formatjs.io/guides/runtime-environments/
  let localesMyAppSupports = [locale]

  if (global.Intl) {
    // Determine if the built-in `Intl` has the locale data we need.
    if (!areIntlLocalesSupported(localesMyAppSupports)) {
      // `Intl` exists, but it doesn't have the data we need, so load the
      // polyfill and replace the constructors with need with the polyfill's.
      let IntlPolyfill = intl
      Intl.NumberFormat = IntlPolyfill.NumberFormat
      Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
    }
  } else {
    // No `Intl`, so use and load the polyfill.
    global.Intl = intl
  }
  // END: Intl polyfill
}

export const LayoutContent = () => {
  const [messages, setMessages] = useState([])
  const { appConfig } = useConfig()
  const {
    components,
    routes = [],
    containers,
    locale: confLocale,
    getDefaultRoutes,
  } = appConfig || {}
  const { Menu, Loading } = components || {}
  const { locales, onError } = confLocale || {}
  const { LayoutContainer = React.Fragment } = containers || {}
  const defaultRoutes = getDefaultRoutes ? getDefaultRoutes(appConfig) : []
  const { locale } = useLocale()

  useEffect(() => {
    const loadPolyfills = async () => {
      loadLocalePolyfill(locale)

      for (let i = 0; i < locales.length; i++) {
        const l = locales[i]
        if (l.locale === locale) {
          if (l.loadData) {
            await l.loadData
          }
        }
      }
    }
    loadPolyfills()
  }, [locale, locales])

  useEffect(() => {
    const loadMessages = async () => {
      const messages = await getLocaleMessages(locale, locales)
      setMessages(messages)
    }
    loadMessages()
  }, [locale, locales])

  return (
    <IntlProvider
      locale={locale}
      key={locale}
      messages={messages}
      onError={onError}
    >
      <LayoutContainer>
        {Menu && <Menu />}
        <Suspense fallback={<Loading />}>
          <Switch>
            {routes.map((Route, i) => {
              return React.cloneElement(Route, { key: `@customRoutes/${i}` })
            })}
            {defaultRoutes.map((Route, i) => {
              return React.cloneElement(Route, { key: `@defaultRoutes/${i}` })
            })}
          </Switch>
        </Suspense>
      </LayoutContainer>
    </IntlProvider>
  )
}

export const Layout = () => {
  const { appConfig } = useConfig()
  const { locale } = appConfig || {}
  const { defaultLocale, persistKey } = locale || {}
  return (
    <LocaleProvider defaultLocale={defaultLocale} persistKey={persistKey}>
      <LayoutContent appConfig={appConfig} />
    </LocaleProvider>
  )
}

export default Layout
