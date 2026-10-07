// Case study content — copy taken verbatim from kylenicolaou.com.
// Media entries render as grey placeholders until real assets are added.

export interface MediaSlot {
  kind: 'image' | 'video';
  label: string;
}

export interface CaseStudySection {
  number: string;
  title: string;
  intro?: string;
  body?: string;
  blocks?: { title: string; body: string }[];
  media?: MediaSlot[];
}

export interface Project {
  slug: string;
  title: string;
  tags: string;
  overview: string;
  meta: { label: string; value: string }[];
  hero: MediaSlot;
  sections: CaseStudySection[];
}

export const PROJECTS: Record<string, Project> = {
  ripple: {
    slug: 'ripple',
    title: 'Ripple',
    tags: 'Interactive Installation · Motion Tracking · Generative Design · Live Brief',
    overview:
      'Ripple is an interactive installation that transforms human movement into real-time visual feedback. Built with TouchDesigner and motion-tracked via Xbox Kinect, the experience responds to hand gestures symbolising humans water pollution over time, Developed as a live brief with Adobe, Ripple explores the boundary between digital interaction and embodied presence.',
    meta: [
      { label: 'Year', value: '2025' },
      { label: 'Duration', value: '8 Weeks' },
      { label: 'Team', value: 'Group Project' },
      { label: 'Tools', value: 'TouchDesigner · Xbox Kinect · Figma' },
      { label: 'Brief', value: 'Live Brief — Adobe' },
    ],
    hero: { kind: 'image', label: 'Ripple Hero' },
    sections: [
      {
        number: '01',
        title: 'Problem Statement',
        intro:
          'How can we inspire and empower young urban Aucklanders, aged 18–25 to actively participate in safeguarding New Zealand’s freshwater resources, Through an interactive, digitally-driven exhibition aligned with Adobe’s “Create The Future” brand pillar?',
        blocks: [
          {
            title: 'The Brief',
            body: "Developed under Adobe's Create The Future brand pillar, Ripple was tasked with inspiring meaningful action through design and technology.",
          },
          {
            title: 'The Purpose',
            body: 'To ignite awareness and responsibility among Auckland’s youth by using technology, to show the tangible impact of individual choices on New Zealand’s precious freshwater resources.',
          },
          {
            title: 'The Response',
            body: 'A projection-based interactive installation that places the user at the centre of the issue. By tracking movement through an Xbox Kinect, Ripple responds to the body in real time turning passive observation into active participation, and awareness into accountability.',
          },
        ],
      },
      {
        number: '02',
        title: 'Kinect & Motion Tracking Exploration',
        intro: 'Working with the Kinect to adapt the graphical element with motion tracking',
        blocks: [
          {
            title: 'The Challenge',
            body: 'The original concept was a reactive floor installation responding to footsteps in real time, but floor-plane tracking requires a level of depth sensor precision that quickly felt like the wrong hill to climb. Shifting to a wall projection made everything click. The Kinect handles forward-facing depth tracking well, hand motion became a natural fit, and it removed the need for any risky overhead mounting.',
          },
          {
            title: 'The Concepts',
            body: 'The two concepts below show the progression of hand tracking with TouchDesigner and adding the graphical element of the flowing water.',
          },
        ],
        media: [
          { kind: 'video', label: 'Concept 1' },
          { kind: 'video', label: 'Concept 2' },
        ],
      },
      {
        number: '03',
        title: 'Applying The Concept',
        intro: 'Merging the motion tracking and graphical element together.',
        blocks: [
          {
            title: 'Bringing It Together',
            body: 'Up until this point, the hand tracking and the visual element had been living separately. The Kinect was doing its job, and the flowing water graphic existed on its own. The next step was then to attach one to the other. In practice, seeing it work for the first time was very rewarding.',
          },
          {
            title: 'Into the Projector',
            body: 'Taking it off the screen and throwing it onto a wall using a projector changed everything about how it felt.',
          },
        ],
        media: [
          { kind: 'video', label: 'Combined test' },
          { kind: 'video', label: 'Projector test' },
        ],
      },
      {
        number: '04',
        title: '4 Player Interaction System',
        intro: 'Scaling the experience from one person to four',
        blocks: [
          {
            title: 'The Requirement',
            body: 'The exhibit was always designed for multiple people. To support that, the system was built to handle up to four simultaneous players each tracked independently by the Kinect within the same frame.',
          },
          {
            title: 'Player Detection',
            body: "Each player is assigned a circle the moment they enter the Kinect's field of view. When they step out, their circle is removed immediately keeping the projection clean and ensuring no ghost elements interfere with active players.",
          },
        ],
        media: [{ kind: 'image', label: '4 Player Concept Diagram' }],
      },
      {
        number: '05',
        title: 'Graphical Development',
        intro: 'Enhancing the graphical elemement of the clean and polluted water',
        blocks: [
          {
            title: 'Colour System',
            body: 'Ehnancing the two states defined of colour deep blue for clean water, vibrant green for pollution.',
          },
        ],
        media: [
          { kind: 'video', label: 'Clean water' },
          { kind: 'video', label: 'Polluted water' },
        ],
      },
      {
        number: '06',
        title: 'Colour Cycle',
        intro: 'Simulating the passage of time with pollution',
        blocks: [
          {
            title: 'Pollution Cycle',
            body: "A continuous automated cycle shifts the entire canvas from blue to green over time when the user interacts, clean water slowly becoming polluted regardless of user input. This passive drift was intentional pollution doesn't wait for interaction, it happens whether you engage with it",
          },
        ],
        media: [
          { kind: 'image', label: 'Colour Change Visual' },
          { kind: 'video', label: 'Colour cycle' },
        ],
      },
      {
        number: '07',
        title: 'Final States',
        intro: 'Final state of clean and polluted experience',
        blocks: [
          {
            title: 'Clean Water',
            body: 'The blue state at its final form  deep, dark tones with responsive ripple trails.',
          },
          {
            title: 'Polluted Water',
            body: 'The green state fully pushed vibrant and unsettling, the smokey pollution effect saturating the surface. The same topography lines now feel corrupted rather than natural.',
          },
        ],
        media: [
          { kind: 'video', label: 'Clean final state' },
          { kind: 'video', label: 'Polluted final state' },
        ],
      },
      {
        number: '08',
        title: 'Final Outcome',
        intro: 'Clean and polluted water colliding for the full experience',
        blocks: [
          {
            title: 'The Collision',
            body: 'Blue and green meet the two states bleeding into one another as the colour cycle drives the world from clean to polluted over time. Ripple trails, and the smokey pollution effect all working together as a single cohesive vibrant experience.',
          },
        ],
        media: [{ kind: 'video', label: 'Final outcome' }],
      },
    ],
  },
  outthere: {
    slug: 'outthere',
    title: 'OutThere Seltzers',
    tags: 'UX/UI · E-Commerce · Solution Solving · Branding',
    overview:
      'OutThere Seltzers is set against the real-world problem of food security of rejected produce waste from Supermarkets — how might we reduce food waste by transforming retailer-rejected fruit and vegetables into a premium, sustainable seltzer? Using a lean, human-centred design approach, the outcome is a fully responsive Figma prototype and brand identity designed for both desktop and mobile, showcasing that out-there produce is the new Imperfects, Perfect.',
    meta: [
      { label: 'Year', value: '2025' },
      { label: 'Duration', value: '8 Weeks' },
      { label: 'Team', value: 'Solo' },
      { label: 'Tools', value: 'Figma · Photoshop · Illustrator' },
    ],
    hero: { kind: 'image', label: 'OutThere Seltzers Hero' },
    sections: [
      {
        number: '01',
        title: 'Problem Statement',
        body: 'How might we decrease produce waste by upcycling retailer-rejected fruit and vegetables into a more viable and sustainable product?',
        media: [{ kind: 'image', label: 'Problem Statement' }],
      },
      {
        number: '02',
        title: 'Research & Insights',
        body: 'Many companies and services are targeted towards environmental waste such as Wonky Box, The Odd Bunch, and Served. But other brands have taken another approach — making a new product out of "imperfect produce" rejected by retailers, such as fruit jams, alcoholic beverages, smoothies, or restaurants that use imperfect produce whilst keeping their menu prices high. This shows that imperfect fruits and vegetables are not associated with freshness and quality, and can be produced into a high quality product.',
      },
      {
        number: '03',
        title: 'User Personas',
        body: 'Two key personas were developed to guide design decisions throughout the project.',
        media: [
          { kind: 'image', label: 'Daniel Persona' },
          { kind: 'image', label: 'Haley Persona' },
        ],
      },
      {
        number: '04',
        title: 'User Journey Map',
        body: 'Mapping the end-to-end experience helped identify key pain points and opportunities across the customer lifecycle.',
        media: [{ kind: 'image', label: 'User Journey Map' }],
      },
      {
        number: '05',
        title: 'Ideation',
        body: 'Logo exploration, packaging concepts, and brand direction were developed through rapid ideation and iteration.',
        media: [{ kind: 'image', label: 'Ideation — Logo & Packaging' }],
      },
      {
        number: '06',
        title: 'Hi-Fi Mockups',
        body: 'High-fidelity screens were produced in Figma for both desktop and mobile, covering the full e-commerce flow from landing page through to checkout.',
        media: [{ kind: 'image', label: 'Hi-Fi Mockups' }],
      },
      {
        number: '07',
        title: 'Final Outcome',
        body: 'The final deliverable is a fully branded, responsive Figma prototype demonstrating the complete OutThere Seltzers e-commerce experience.',
        media: [
          { kind: 'image', label: 'Outcome 07' },
          { kind: 'image', label: 'Outcome 02' },
          { kind: 'image', label: 'Outcome 03' },
          { kind: 'image', label: 'Outcome 04' },
          { kind: 'image', label: 'Outcome 05' },
          { kind: 'image', label: 'Outcome 06' },
          { kind: 'image', label: 'Outcome 01' },
          { kind: 'image', label: 'Outcome 08' },
        ],
      },
    ],
  },
};
