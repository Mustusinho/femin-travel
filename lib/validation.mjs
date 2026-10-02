import { z } from 'zod'
const text = (max = 160) => z.string().trim().min(1).max(max)
const optional = (max = 160) => z.string().trim().max(max).optional().nullable()
export const leadSchema = z.object({ name: text(80), email: z.string().trim().email().max(254).transform(s => s.toLowerCase()), source: optional(80), destination: optional(), travelStyle: optional(40), travelerType: optional(40), travelWindow: optional(40), website: z.string().max(0).optional(), consent: z.literal(true), emailRequested: z.boolean().default(false) }).strict()
export const tripSchema = z.object({
  destination: text(120), country: z.string().trim().max(80).default(''),
  flexible: z.boolean().default(true), startDate: z.string().max(10).default(''), endDate: z.string().max(10).default(''),
  days: z.number().int().min(1).max(14).default(5), budget: z.enum(['budget','comfortable','luxury']).default('comfortable'),
  companions: z.enum(['solo','friends','couple','family']).default('solo'), style: z.enum(['culture','relaxation','adventure','mixed']).default('mixed'),
  interests: z.array(text(40)).max(8).default([]), safety: z.array(text(80)).max(6).default([]),
  accommodation: z.enum(['hotel','hostel','apartment','flexible']).default('flexible'), pace: z.enum(['slow','balanced','active']).default('balanced'), passportNotes: z.string().trim().max(300).default(''),
}).strict().superRefine((v, ctx) => {
  if (v.flexible) return
  const valid = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s
  if (!valid(v.startDate) || !valid(v.endDate) || v.endDate < v.startDate) ctx.addIssue({code:'custom',message:'Choose valid dates with departure on or after arrival.',path:['endDate']})
  else if ((Date.parse(v.endDate)-Date.parse(v.startDate))/86400000 >= 14) ctx.addIssue({code:'custom',message:'Plan up to 14 days at a time.',path:['endDate']})
})
const list = z.array(text(500)).min(1).max(16)
export const planSchema = z.object({ overview: text(1400), days: z.array(z.object({ day: z.number().int().min(1).max(14), title: text(160), morning: text(600), afternoon: text(600), evening: text(600) }).strict()).min(1).max(14), arrival: list, areas: list, transport: list, night: list, safety: list, budget: text(1000), packing: list, food: list, verification: list }).strict()
export const briefSchema = z.object({overview:text(1400),best_time_to_visit:text(500),safety_tips:list,neighborhoods_to_stay:list,things_to_do:list,packing_list:list,budget_ranges:z.object({low:text(200),mid:text(200),high:text(200)}),transport_tips:list,cultural_tips:list,quick_faq:z.object({visa:text(500),sim:text(500),plugs:text(500),airport_to_city:text(500)})})
export const reverseSchema = z.object({lat:z.number().finite().min(-90).max(90),lng:z.number().finite().min(-180).max(180)}).strict()
export const forwardSchema = z.object({query:text(120)}).strict()
export const aiBriefSchema = z.object({placeName:text(120),country:z.string().trim().max(80).default(''),lat:reverseSchema.shape.lat.optional(),lng:reverseSchema.shape.lng.optional()}).strict()
export const chatSchema = z.object({messages:z.array(z.object({role:z.enum(['user','assistant']),content:text(2000)}).strict()).min(1).max(12),destinationContext:z.object({name:text(120),country:z.string().max(80).optional()}).passthrough().optional().nullable()}).strict()
export const eventTypes = ['destination_search','destination_selected','globe_location_selected','trip_started','trip_step_completed','trip_generated','trip_generation_failed','trip_saved','lead_captured','lead_capture_failed','free_kit_requested','affiliate_click','contact_submitted']
export const eventSchema = z.object({event_type:z.enum(eventTypes),event_data:z.object({provider:optional(60),category:optional(30),destination:optional(120),country:optional(80),placement:z.enum(['homepage','globe','destination','trip_result','blog','free_kit','plan','contact']).optional(),trip_id:optional(64),campaign:optional(80),content:optional(80),step:z.number().int().min(0).max(6).optional(),mode:z.enum(['ai','checklist']).optional()}).strict().default({})}).strict()
export const contactSchema = z.object({name:text(80),email:z.string().trim().email().max(254),subject:text(120),message:text(4000),website:z.string().max(0).optional()}).strict()
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/)
export const saveSchema = z.object({plan:planSchema,input:tripSchema,mode:z.enum(['ai','checklist'])}).strict()
