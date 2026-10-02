import 'server-only'
import { readConfig } from '../config.mjs'
import { HttpError } from './http'
export async function sendEmail({to,subject,text,replyTo}){
  if(!readConfig().email)throw new HttpError(503,'Email delivery is not configured.')
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[to],subject,text,...(replyTo?{reply_to:replyTo}:{})}),signal:AbortSignal.timeout(10000)})
  if(!response.ok)throw new HttpError(502,'Email could not be delivered. Please try again.')
  return true
}
