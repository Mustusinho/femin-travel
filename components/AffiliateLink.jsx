'use client'
import {trackEvent} from '@/lib/events'
export default function AffiliateLink({href,children,className='',affiliate=false,eventData={}}){return <a href={href} target="_blank" rel={affiliate?'sponsored noopener noreferrer':'noopener noreferrer'} className={className} onClick={()=>trackEvent('affiliate_click',eventData)}>{children}</a>}
