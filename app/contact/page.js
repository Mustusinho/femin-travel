import TrustPage from '@/components/layout/TrustPage'
import ContactForm from '@/components/ContactForm'
import {readConfig} from '@/lib/config.mjs'
import {pageMetadata} from '@/lib/metadata'
export const metadata=pageMetadata('Contact','Contact methods available for FeminTravel.','/contact')
export default function Contact(){const c=readConfig();return <TrustPage title="Get in touch" intro="Questions about the planner, feedback or partnership inquiries.">{c.contact?<><p>Email <a href={`mailto:${c.contact}`}>{c.contact}</a>.</p>{c.email&&<ContactForm/>}</>:<p>Direct contact is not available on this deployment yet. Please check back for a verified contact method.</p>}<p>Please do not include passport numbers, payment details or sensitive medical information.</p></TrustPage>}
