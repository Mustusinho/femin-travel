export function fallbackBrief(placeName = 'your destination') {
  return {
    mode: 'checklist',
    overview: `Destination-specific guidance for ${placeName} is unavailable. This is a general preparation checklist, not local research.`,
    best_time_to_visit:
      'Check the current forecast and seasonal information from the destination’s official tourism service.',
    safety_tips: [
      'Check official travel advisories.',
      'Share your itinerary with a trusted contact.',
      'Keep offline maps, a backup payment method and document copies.'
    ],
    neighborhoods_to_stay: [
      'Compare recent reviews, transport access and check-in arrangements. No local neighborhoods have been verified.'
    ],
    things_to_do: [
      'Choose activities from official tourism resources and confirm their opening hours.'
    ],
    packing_list: [
      'Documents',
      'Phone charger and power bank',
      'Comfortable shoes',
      'Layers suited to the current forecast'
    ],
    budget_ranges: {
      low: 'Compare current quotes',
      mid: 'Compare current quotes',
      high: 'Compare current quotes'
    },
    transport_tips: ['Confirm routes and operating hours with the local transport operator.'],
    cultural_tips: ['Research local customs using official tourism resources.'],
    quick_faq: {
      visa: 'Check official immigration sources for your passport.',
      sim: 'Compare current coverage and plans.',
      plugs: 'Verify voltage and plug type.',
      airport_to_city: 'Confirm the arrival terminal and transfer with official providers.'
    }
  }
}
