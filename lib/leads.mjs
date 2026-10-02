export async function writeLead(db, input) {
  const { error } = await db.from('leads').upsert(
    {
      name: input.name,
      email: input.email,
      source: input.source || 'free_kit',
      consent_at: new Date().toISOString()
    },
    { onConflict: 'email' }
  )
  return !error
}
