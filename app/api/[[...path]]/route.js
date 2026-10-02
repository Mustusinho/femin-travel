import { featuredDestinations, demoBlogPosts } from '@/lib/db/data'
import { generateTravelBrief, generateChatResponse, generateTripPlan } from '@/lib/openai'
import { reverseGeocode, forwardGeocode, searchLocations } from '@/lib/geocoding'
import { readConfig } from '@/lib/config.mjs'
import { leadSchema,tripSchema,reverseSchema,forwardSchema,aiBriefSchema,chatSchema,eventSchema,contactSchema,saveSchema,tokenSchema,tripEmailSchema } from '@/lib/validation.mjs'
import { json,readBody,sameOrigin,rateLimit,safeError,HttpError } from '@/lib/server/http'
import { database,persistLead,recordEvent,saveTrip,loadTrip } from '@/lib/server/storage'
import { sendEmail } from '@/lib/server/email'
export const runtime='nodejs'
export const dynamic='force-dynamic'
export const maxDuration=60
export async function GET(request,{params}){
 const route=(params.path || []).join('/')
 try{
  if(!route || route==='root')return json({message:'FeminTravel API',status:'healthy'})
    if(route==='capabilities'){const c=readConfig();return json({ai:c.ai,save:c.storage,email:c.email && Boolean(c.appUrl),contactForm:c.email && Boolean(c.contact),leads:c.storage && Boolean(c.contact),analytics:c.analytics})}
  if(route==='destinations')return json(featuredDestinations)
  if(route==='blog')return json(demoBlogPosts)
  if(route.startsWith('blog/')){const post=demoBlogPosts.find(p=>p.slug===params.path[1]);if(!post)throw new HttpError(404,'Article not found.');return json(post)}
  if(route.startsWith('trips/')){const token=tokenSchema.safeParse(params.path[1]);if(!token.success)throw new HttpError(404,'Trip not found.');await rateLimit(request,'trip_read',120);return json(await loadTrip(token.data))}
  throw new HttpError(404,'Route not found.')
 }catch(e){return safeError(e)}
}
export async function POST(request,{params}){
 const route=(params.path || []).join('/')
 try{
  sameOrigin(request)
  if(route==='ai/brief'){const b=await readBody(request,aiBriefSchema);await rateLimit(request,'ai',12);return json(await generateTravelBrief(b.placeName,b.country,b.lat,b.lng))}
  if(route==='ai/chat'){const b=await readBody(request,chatSchema);await rateLimit(request,'chat',30);return json({response:await generateChatResponse(b.messages,b.destinationContext)})}
  if(route==='trips/generate'){const b=await readBody(request,tripSchema);if(readConfig().ai){await rateLimit(request,'trip_generate',6);await rateLimit(request,'ai',12)}return json(await generateTripPlan(b))}
  if(route==='trips/save'){const b=await readBody(request,saveSchema);await rateLimit(request,'trip_save',12);return json({token:await saveTrip(b)},201)}
  if(route==='trips/email'){const b=await readBody(request,tripEmailSchema);await rateLimit(request,'trip_email',3);if(!readConfig().appUrl)throw new HttpError(503,'Email links are not configured.');await loadTrip(b.token);await sendEmail({to:b.email,subject:'Your saved FeminTravel trip',text:`Your saved trip: ${readConfig().appUrl}trips/${b.token}\nThe link expires after 30 days. Anyone with it can view the plan. This is a one-time email, not a marketing subscription.`});return json({success:true})}
  if(route==='geocode/reverse'){const b=await readBody(request,reverseSchema);await rateLimit(request,'geocode',80);return json(await reverseGeocode(b.lat,b.lng))}
  if(route==='geocode/forward' || route==='geocode/search'){const b=await readBody(request,forwardSchema);await rateLimit(request,'geocode',80);const data=route.endsWith('search')?await searchLocations(b.query):await forwardGeocode(b.query);if(!data)throw new HttpError(404,'No location found.');return json(data)}
  if(route==='leads'){
   const b=await readBody(request,leadSchema);await rateLimit(request,'leads',5);await persistLead(database(),b)
   let emailSent=false
   if(b.emailRequested){try{if(readConfig().appUrl){await sendEmail({to:b.email,subject:'Your FeminTravel planning kit',text:`Your general planning kit: ${readConfig().appUrl}free-kit\nThis is a one-time resource email. You have not been subscribed to marketing.`});emailSent=true}}catch{/* Saving and sending have separate outcomes. */}}
   return json({success:true,emailSent})
  }
  if(route==='events'){const b=await readBody(request,eventSchema);if(!readConfig().analytics)return json({recorded:false});await rateLimit(request,'events',120);return json({recorded:await recordEvent(b.event_type,b.event_data)})}
  if(route==='contact'){const b=await readBody(request,contactSchema);if(!readConfig().contact || !readConfig().email)throw new HttpError(503,'Contact delivery is not configured.');await rateLimit(request,'contact',5);await sendEmail({to:readConfig().contact,replyTo:b.email,subject:`FeminTravel: ${b.subject}`,text:`From: ${b.name}\n\n${b.message}`});return json({success:true})}
  throw new HttpError(404,'Route not found.')
 }catch(e){return safeError(e)}
}
