export function fallbackBrief(placeName = 'this place', country = '') {
  const where = [placeName, country].filter(Boolean).join(', ')
  return {
    overview: `Here’s a quick starter brief for ${where || 'your destination'}. Loading the full AI brief now…`,
    best_time_to_visit: 'Usually spring/fall are best — comfortable weather + fewer crowds.',
    safety_tips: [
      'Stay aware at night; prefer well-lit routes.',
      'Keep valuables secure (crossbody, zipped bag).',
      'Share location/plan with a trusted contact.',
      'Use official taxis / reputable rideshare.',
      'Trust your instincts and leave if it feels off.',
    ],
    neighborhoods_to_stay: [
      'Central areas near main sights (convenient + busy).',
      'Areas close to transit (less walking late).',
      'Well-reviewed districts with hotels/apartments.',
    ],
    things_to_do: [
      'Top viewpoints / main landmarks',
      'Local food market / best café streets',
      'Museum or cultural spot',
      'Day trip nearby',
      'Neighborhood walk + sunset spot',
    ],
    packing_list: [
      'Comfortable shoes',
      'Light layers',
      'Power adapter',
      'Small daypack',
      'First aid basics',
      'Portable door lock',
      'Personal alarm',
    ],
    budget_ranges: { low: '$50–80/day', mid: '$100–150/day', high: '$200+/day' },
    transport_tips: ['Download offline maps', 'Use transit day passes', 'Save emergency numbers'],
    cultural_tips: ['Learn a few phrases', 'Respect dress customs', 'Keep copies of documents'],
    quick_faq: {
      visa: 'Check official government sources for your nationality.',
      sim: 'Airport kiosks or major carriers in the city center.',
      plugs: 'Bring a universal adapter (verify voltage).',
      airport_to_city: 'Compare train/shuttle/official taxi based on arrival time.',
    },
  }
}
