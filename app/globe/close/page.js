import { redirect } from 'next/navigation'

// Existing close-up links now enter the main globe at the same location.
export default async function CloseUpPage({ searchParams }) {
  const params = await searchParams
  const lat = Number(params.lat)
  const lng = Number(params.lng)
  if (
    params.lat == null ||
    params.lng == null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    redirect('/globe')
  }
  redirect('/globe?lat=' + encodeURIComponent(lat) + '&lng=' + encodeURIComponent(lng))
}
