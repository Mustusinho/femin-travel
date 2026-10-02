import 'server-only'
import { randomBytes, createHash } from 'node:crypto'
import { getSupabase } from '../db/supabase'
import { HttpError } from './http'
export function database(){const {supabase}=getSupabase();if(!supabase)throw new HttpError(503,'Persistent storage is not configured. Nothing was saved.');return supabase}
export async function persistLead(db,input){
  const {error}=await db.from('leads').upsert({name:input.name,email:input.email,source:input.source || 'free_kit',consent_at:new Date().toISOString()},{onConflict:'email'})
  if(error)throw new HttpError(503,'Your request could not be saved. Please try again.')
}
export async function recordEvent(eventType,eventData={}){
  if(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED!=='true')return false
  const {error}=await database().from('events').insert({event_type:eventType,event_data:eventData})
  if(error)throw new HttpError(503,'Event could not be recorded.')
  return true
}
export async function saveTrip(input){
  const token=randomBytes(32).toString('hex');const hash=createHash('sha256').update(token).digest('hex')
  const preferences={...input.input,passportNotes:''}
  const {error}=await database().from('trips').insert({token_hash:hash,plan:input.plan,preferences,mode:input.mode,expires_at:new Date(Date.now()+30*86400000).toISOString()})
  if(error)throw new HttpError(503,'The trip could not be saved. Please try again.')
  return token
}
export async function loadTrip(token){
  const hash=createHash('sha256').update(token).digest('hex')
  const {data,error}=await database().from('trips').select('plan,preferences,mode,expires_at').eq('token_hash',hash).gt('expires_at',new Date().toISOString()).maybeSingle()
  if(error)throw new HttpError(503,'Saved trips are temporarily unavailable.')
  if(!data)throw new HttpError(404,'This trip link is unavailable or has expired.')
  return data
}
