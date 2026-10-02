export function tripDays(input) {
  return input.flexible
    ? input.days
    : Math.round((Date.parse(input.endDate) - Date.parse(input.startDate)) / 86400000) + 1
}
export function checklistPlan(input) {
  const count = tripDays(input),
    interests = input.interests.length ? input.interests.join(', ') : input.style
  return {
    overview: `A ${count}-day planning framework for ${input.destination}, for ${input.companions}, at a ${input.pace} pace. Destination-specific AI guidance is unavailable. These are preparation prompts tailored to your choices, not researched local recommendations.`,
    days: Array.from({ length: count }, (_, i) => ({
      day: i + 1,
      title:
        i === 0
          ? 'Arrive and settle in'
          : i === count - 1
            ? 'A flexible final day'
            : `${interests}: choose a local experience`,
      morning:
        i === 0
          ? 'Allow time for arrival, immigration if needed, and the transfer to your accommodation.'
          : 'Choose one experience from your interests after checking its official opening hours and location.',
      afternoon:
        input.pace === 'slow'
          ? 'Leave time for rest and a nearby meal.'
          : 'Group nearby activities together; allow time for meals and travel.',
      evening: input.safety.includes('Avoid late arrivals')
        ? 'Return before late evening and arrange the journey in advance.'
        : 'Choose dinner near your accommodation and decide on your return journey before going out.'
    })),
    arrival: [
      'Confirm your actual arrival terminal and transfer options with your airport or station.',
      'Save your accommodation address offline and agree check-in arrangements.',
      'If arriving late, arrange a licensed transfer and check reception hours.'
    ],
    areas: [
      `Compare ${input.accommodation === 'flexible' ? 'accommodation' : input.accommodation} options using recent reviews, transport access, reception hours and your arrival time. No local areas have been verified in this checklist.`
    ],
    transport: [
      'Check routes, operating hours and tickets with the official local operator.',
      'Keep an offline map and a backup return option.'
    ],
    night: [
      'Plan the return journey before going out.',
      'Prefer routes and venues you can evaluate; change plans when conditions feel uncomfortable.'
    ],
    safety: [
      'Share your plans with a trusted person.',
      'Look up current official travel advisories and local emergency contacts.',
      'Keep a backup payment method and document copies separate.',
      'Check any mobility or accessibility needs directly with providers.',
      ...input.safety.map((s) => `Your preference: ${s}. Confirm arrangements before booking.`)
    ],
    budget: `Your ${input.budget} budget is a planning preference, not a price quote. List accommodation, meals, local transport, activities, insurance and a contingency separately. Compare current provider prices in the local currency; flights are additional.`,
    packing: [
      'Documents and insurance details',
      'Charged phone, power bank and compatible adapter',
      'Comfortable shoes and layers based on the current forecast',
      'Any personal medication and relevant documentation'
    ],
    food: [
      `Choose food and activities around your interests (${interests}). Verify opening hours, dietary needs and reservations directly.`
    ],
    verification: [
      'Check official entry and visa requirements for your passport.',
      'Check current travel advisories, weather and transport notices.',
      'Confirm all prices, schedules and availability with providers.'
    ]
  }
}
