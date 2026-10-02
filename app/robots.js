import { readConfig } from '@/lib/config.mjs'
export default function robots() {
  const c = readConfig()
  return {
    rules: c.indexable
      ? { userAgent: '*', allow: '/', disallow: ['/api/', '/trips/', '/plan', '/thanks'] }
      : { userAgent: '*', allow: '/' },
    ...(c.indexable && c.appUrl ? { sitemap: new URL('/sitemap.xml', c.appUrl).toString() } : {})
  }
}
