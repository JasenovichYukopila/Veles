import type { Genre } from '../types';

export interface TrackInfo {
  artist: string;
  title:  string;
  videoId: string;
}

export interface GenreInfo {
  color:       string;
  description: string;
  tracks:      TrackInfo[];
}

export const GENRE_INFO: Record<Genre, GenreInfo> = {
  'Clásica': {
    color: '#C9A96E',
    description:
      'Música de tradición europea con estructuras formales complejas y gran riqueza orquestal. Su lenguaje armónico ha servido de base para prácticamente todos los géneros modernos.',
    tracks: [
      { artist: 'Ludwig van Beethoven', title: 'Sinfonía No. 9',    videoId: 'rOjHhS5MtvA' },
      { artist: 'Claude Debussy',       title: 'Clair de Lune',     videoId: 'CvFH_6DNRCY' },
      { artist: 'J. S. Bach',           title: 'Cello Suite No. 1', videoId: '1prweT95Mo0' },
    ],
  },
  'Electrónica': {
    color: '#00F5D4',
    description:
      'Género construido desde la síntesis de sonido y la tecnología como instrumento principal. Abarca desde el minimalismo del ambient hasta la intensidad del techno.',
    tracks: [
      { artist: 'Daft Punk',        title: 'Get Lucky',    videoId: '5NV6Rdv1a3I' },
      { artist: 'Aphex Twin',       title: 'Windowlicker', videoId: 'UBS4Gi1y_nc' },
      { artist: 'Boards of Canada', title: 'Roygbiv',      videoId: 'wxIM9ky548I' },
    ],
  },
  'Hip-Hop': {
    color: '#FF6B35',
    description:
      'Nacido en el Bronx en los años 70, el hip-hop combina beats sincopados, samples y una tradición lírica que documenta la realidad urbana con precisión poética.',
    tracks: [
      { artist: 'Kendrick Lamar', title: 'HUMBLE.',            videoId: 'tvTRZJ-4EyI' },
      { artist: 'Nas',            title: 'N.Y. State of Mind', videoId: 'TCJTLmEXMrU' },
      { artist: 'Jay-Z',          title: 'Empire State of Mind', videoId: 'coYnMFdTCiU' },
    ],
  },
  'Jazz': {
    color: '#A855F7',
    description:
      'Música de improvisación y diálogo entre músicos. El jazz transformó permanentemente la noción occidental de ritmo, armonía y expresión individual dentro de un conjunto.',
    tracks: [
      { artist: 'Miles Davis',   title: 'So What',        videoId: 'zqNTltOGh5c' },
      { artist: 'John Coltrane', title: 'A Love Supreme', videoId: 'll3CMgiUPuU' },
      { artist: 'Bill Evans',    title: 'Waltz for Debby', videoId: 'nPFbHQEcDIc' },
    ],
  },
  'Pop': {
    color: '#FF3F8E',
    description:
      'El pop no es un género de instrumentación sino de intención: canciones diseñadas para ser inmediatas, memorables y universales. Su aparente simplicidad esconde producción altamente sofisticada.',
    tracks: [
      { artist: 'Michael Jackson', title: 'Billie Jean',      videoId: 'Zi_XLOBDo_Y' },
      { artist: 'The Weeknd',      title: 'Blinding Lights',  videoId: '4NRXx6U8ABQ' },
      { artist: 'Dua Lipa',        title: 'Levitating',       videoId: 'TUVcZfQe-Kw' },
    ],
  },
  'Rock': {
    color: '#E63946',
    description:
      'Construido sobre la guitarra eléctrica y la tensión entre distorsión y melodía. El rock abarca desde la delicadeza del folk-rock hasta la agresividad del metal.',
    tracks: [
      { artist: 'Led Zeppelin',       title: 'Stairway to Heaven',    videoId: 'QkF3oxziUI4' },
      { artist: 'Nirvana',            title: 'Smells Like Teen Spirit', videoId: 'hTWKbfoikeg' },
      { artist: 'The Rolling Stones', title: 'Paint It Black',         videoId: 'O4irXQhgMqg' },
    ],
  },
  'Vallenato': {
    color: '#F4D03F',
    description:
      'Patrimonio cultural de Colombia y la Costa Caribe. El vallenato narra historias cotidianas con acordeón, caja y guacharaca, combinando melancolía y celebración en la misma canción.',
    tracks: [
      { artist: 'Carlos Vives',  title: 'La Bicicleta',     videoId: 'G9hDJ4bOwcs' },
      { artist: 'Diomedes Díaz', title: 'La Inconformidad', videoId: 'YYpBPGMxmds' },
      { artist: 'Carlos Vives',  title: 'Volví a Nacer',    videoId: 'p_I3-6oFhAg' },
    ],
  },
};

export const RECORDING_DURATION_MS = 8000;
export const API_BASE_URL = 'http://localhost:8000';

export const STAGE_LABELS: Record<string, string> = {
  idle:       'Inicio',
  recording:  'Grabando',
  processing: 'Analizando',
  result:     'Resultado',
  detail:     'Detalle',
};