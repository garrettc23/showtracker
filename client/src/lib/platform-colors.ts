export const platformColors = {
  netflix: 'hsl(348, 83%, 47%)', // #E50914
  hulu: 'hsl(145, 85%, 47%)', // #1CE783
  disney: 'hsl(226, 85%, 51%)', // #113CCF
  prime: 'hsl(195, 100%, 44%)', // #00A8E1
  apple: 'hsl(0, 0%, 0%)', // #000000
  hbo: 'hsl(270, 69%, 55%)', // #8A2BE2
  paramount: 'hsl(220, 100%, 50%)', // #0073E6
  peacock: 'hsl(275, 100%, 50%)', // #8800FF
  other: 'hsl(217, 19%, 53%)', // #6B7280
} as const;

export const platformNames = {
  netflix: 'Netflix',
  hulu: 'Hulu',
  disney: 'Disney+',
  prime: 'Prime Video',
  apple: 'Apple TV+',
  hbo: 'HBO Max',
  paramount: 'Paramount+',
  peacock: 'Peacock',
  other: 'Other',
} as const;

export type Platform = keyof typeof platformColors;
