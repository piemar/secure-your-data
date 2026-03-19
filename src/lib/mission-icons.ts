// Unique Matrix-themed SVG icon paths per mission codename
// Each returns an SVG path string to render inside a <g> element

export interface MissionIcon {
  path: string;       // SVG path d attribute
  viewBox: string;    // viewBox for the icon
  label: string;      // Accessible label
}

const ICONS: Record<string, MissionIcon> = {
  // RECON TIER
  BOOTCAMP: {
    // Terminal cursor
    path: 'M4 4h16v12H4V4zm2 2v8h12V6H6zm2 2h2v4H8V8zm4 2h4v1h-4v-1z',
    viewBox: '0 0 24 20',
    label: 'Terminal',
  },
  PHANTOM: {
    // Eye / index
    path: 'M12 4C6 4 2 10 2 10s4 6 10 6 10-6 10-6-4-6-10-6zm0 9a3 3 0 110-6 3 3 0 010 6z',
    viewBox: '0 0 24 20',
    label: 'Index Eye',
  },
  PIPELINE: {
    // Pipeline flow
    path: 'M2 6h4l3 4h6l3-4h4M2 14h4l3-4M18 14h4l-3-4M8 10v4h8v-4',
    viewBox: '0 0 24 20',
    label: 'Pipeline',
  },
  RICHQUERY: {
    // Magnifying glass with braces
    path: 'M10 2a8 8 0 105.3 14l4.7 4.7 1.4-1.4-4.7-4.7A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12zm-1 3v1h2V7H9zm0 2v4h2V9H9z',
    viewBox: '0 0 22 22',
    label: 'Rich Query',
  },
  ANALYTICS: {
    // Bar chart
    path: 'M4 18V8h3v10H4zm5 0V4h3v14H9zm5 0v-7h3v7h-3z',
    viewBox: '0 0 22 22',
    label: 'Analytics',
  },
  EVOLVE: {
    // DNA helix
    path: 'M7 2c0 4 10 4 10 8s-10 4-10 8M17 2c0 4-10 4-10 8s10 4 10 8M12 2v16',
    viewBox: '0 0 24 22',
    label: 'Evolution',
  },

  // INFILTRATION TIER
  GEOTRACK: {
    // Crosshair / globe
    path: 'M12 2v4M12 18v4M2 12h4M18 12h4M12 8a4 4 0 100 8 4 4 0 000-8z',
    viewBox: '0 0 24 24',
    label: 'Geospatial',
  },
  GRAPHWEB: {
    // Network nodes
    path: 'M5 5m-2 0a2 2 0 104 0 2 2 0 10-4 0M19 5m-2 0a2 2 0 104 0 2 2 0 10-4 0M12 19m-2 0a2 2 0 104 0 2 2 0 10-4 0M7 6l5 11M17 6l-5 11M7 5h10',
    viewBox: '0 0 24 24',
    label: 'Graph',
  },
  WIRETAP: {
    // Signal waves
    path: 'M6 12a6 6 0 0112 0M3 12a9 9 0 0118 0M9 12a3 3 0 016 0M12 12v4m0 0h-1m1 0h1',
    viewBox: '0 0 24 20',
    label: 'Change Stream',
  },
  ACIDRAIN: {
    // Chain links / atom
    path: 'M12 2l3 5h-6l3-5zm0 18l-3-5h6l-3 5zM2 12l5-3v6l-5-3zm18 0l-5 3v-6l5 3z',
    viewBox: '0 0 24 24',
    label: 'Transaction',
  },
  SIEGE: {
    // Shield
    path: 'M12 2L4 6v5c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4zm0 3l5 2.5V11c0 3.9-2.2 7.4-5 8.8V5z',
    viewBox: '0 0 24 24',
    label: 'Shard Shield',
  },
  STORM: {
    // Lightning bolt
    path: 'M13 2L4 14h7l-2 8 9-12h-7l2-8z',
    viewBox: '0 0 22 24',
    label: 'Connection Storm',
  },
  SCALEOUT: {
    // Expanding arrows
    path: 'M12 2v20M2 12h20M7 7l-5 5 5 5M17 7l5 5-5 5M7 7l5-5 5 5M7 17l5 5 5-5',
    viewBox: '0 0 24 24',
    label: 'Scale Out',
  },
  FAILOVER: {
    // Refresh / cycle
    path: 'M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M4 7V3h4M20 17v4h-4',
    viewBox: '0 0 24 24',
    label: 'Failover',
  },
  TIMESERIES: {
    // Clock with waveform
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2M2 14h3l2-4 2 8 2-6 2 4h3',
    viewBox: '0 0 24 24',
    label: 'Time Series',
  },

  // EXFILTRATION TIER
  SEARCHOPS: {
    // Magnifying glass with text
    path: 'M10 2a8 8 0 105.3 14l4.7 4.7 1.4-1.4-4.7-4.7A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12zm-3 4h6m-6 3h4',
    viewBox: '0 0 22 22',
    label: 'Text Search',
  },
  SABOTEUR: {
    // Document with X
    path: 'M6 2h8l4 4v14H6V2zm8 0v4h4M9 10l6 6m0-6l-6 6',
    viewBox: '0 0 24 24',
    label: 'Schema Saboteur',
  },
  CIPHER: {
    // Lock with keyhole
    path: 'M7 10V7a5 5 0 0110 0v3M5 10h14v10H5V10zm7 3a2 2 0 100 4 2 2 0 000-4z',
    viewBox: '0 0 24 24',
    label: 'Encryption',
  },
  TERRAFORM: {
    // Infrastructure / building blocks
    path: 'M2 8h6v6H2V8zm7-4h6v6H9V4zm7 4h6v6h-6V8zM9 14h6v6H9v-6z',
    viewBox: '0 0 24 24',
    label: 'Terraform',
  },
  VECTOROPS: {
    // 3D cube
    path: 'M12 2l8 4v8l-8 4-8-4V6l8-4zm0 0v8m0 0l8-4m-8 4l-8-4',
    viewBox: '0 0 24 20',
    label: 'Vector Search',
  },
};

export function getMissionIcon(codename: string): MissionIcon {
  return ICONS[codename] || ICONS.BOOTCAMP;
}
