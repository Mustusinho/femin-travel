import { featuredDestinations } from './db/data'
const notes = {
  lisbon: {
    lead: 'Build a Lisbon trip around viewpoints, neighborhood walks and time at the table.',
    areas: [
      'Baixa and Chiado: compare access to your planned sights and the actual walking route to your accommodation.',
      'Alfama: consider luggage, steps and the route to your door.'
    ],
    experiences: [
      'Pair a neighborhood walk with a viewpoint rather than filling every hour.',
      'Explore museums or monuments and leave time for food and fado.'
    ],
    arrival:
      'Choose your transfer after checking the airport terminal, arrival time and current metro or licensed taxi arrangements.',
    considerations: [
      'Account for hills when comparing accommodation and walking routes.',
      'Check the actual transport route; distance on a map alone is not enough.'
    ],
    source: 'https://www.visitlisboa.com/'
  },
  barcelona: {
    lead: 'Architecture, art, food and the coast can share a trip when you group plans by area.',
    areas: [
      'Eixample: compare accommodation against the architecture and museum visits you want to make.',
      'Gràcia: consider a neighborhood base and the transport connections to your itinerary.'
    ],
    experiences: [
      'Set aside time for architecture; confirm timed entry directly with each venue.',
      'Balance a museum day with food and a coastal walk.'
    ],
    arrival:
      'Confirm your arrival airport and terminal before choosing a transfer. Check the current route to your accommodation with the operator.',
    considerations: [
      'Keep valuables secured in busy visitor areas, as a general travel precaution.',
      'Reserve time for journeys between sights rather than treating the city as one walk.'
    ],
    source: 'https://thisisbarcelona.com/'
  },
  tokyo: {
    lead: 'Plan Tokyo as a collection of neighborhoods, with a few deliberate journeys between them.',
    areas: [
      'Shinjuku or Shibuya: compare exact station exits, transfer routes and accommodation noise reviews.',
      'Asakusa or Ueno: consider which cultural stops you want nearby.'
    ],
    experiences: [
      'Group one day around a neighborhood’s food, shops and cultural stops.',
      'Keep another day flexible for a museum or garden; verify hours and bookings.'
    ],
    arrival:
      'Check whether you arrive at Haneda or Narita. Compare the current airport connection and final journey from the station to your accommodation.',
    considerations: [
      'Large stations can take time to navigate; save the relevant exit and accommodation address.',
      'Check the last service for your actual return route before a late evening.'
    ],
    source: 'https://www.gotokyo.org/en/'
  },
  paris: {
    lead: 'Leave room for neighborhood walks between museums, food and the places you most want to see.',
    areas: [
      'Compare a base near the transport routes serving your chosen museums and arrival station.',
      'Consider accommodation in a neighborhood you want to explore on foot, and check recent noise and access reviews.'
    ],
    experiences: [
      'Choose one major museum at a time and verify timed-entry arrangements.',
      'Make space for a walk, a café stop and an unhurried meal.'
    ],
    arrival:
      'Identify your airport or station and confirm the actual onward route. Allow time for check-in and transfers before your first reservation.',
    considerations: [
      'Confirm entrance arrangements directly with museums; free-entry rules can change.',
      'Plan the return journey before an evening activity.'
    ],
    source: 'https://parisjetaime.com/eng/'
  },
  rome: {
    lead: 'Ancient sites, neighborhood walks and long meals reward a plan with fewer daily stops.',
    areas: [
      'Compare a central base against your planned sights and the walk with luggage.',
      'Trastevere is an area to research for dining and a neighborhood stay; check noise and your return route.'
    ],
    experiences: [
      'Choose an archaeological visit and verify its official ticket arrangements.',
      'Balance historic sights with time for a neighborhood walk and local food.'
    ],
    arrival:
      'Check which airport or station you use, then compare the current rail, bus or licensed taxi options and the final journey to your stay.',
    considerations: [
      'Leave breathing room between reservations and allow for outdoor conditions.',
      'Check clothing requirements and opening hours for religious sites.'
    ],
    source: 'https://www.turismoroma.it/en'
  },
  reykjavik: {
    lead: 'Use Reykjavík as a city trip or a carefully planned starting point for exploring Iceland.',
    areas: [
      'A city-center base can help group museums, food and city walks; compare actual routes and reviews.',
      'If booking excursions, confirm pickup locations before selecting accommodation.'
    ],
    experiences: [
      'Build a city day around cultural stops and time by the waterfront.',
      'Choose excursions based on season, transport and current conditions, without assuming access.'
    ],
    arrival:
      'Confirm the arrival airport and transfer destination. Airport transfers and onward accommodation journeys need their own time in the plan.',
    considerations: [
      'Check the current forecast and official road conditions for any journey outside the city.',
      'Do not assume seasonal natural experiences will be available on your travel dates.'
    ],
    source: 'https://visitreykjavik.is/'
  }
}
export const destinations = featuredDestinations
  .filter((d) => notes[d.slug])
  .map((d) => ({ ...d, ...notes[d.slug] }))
