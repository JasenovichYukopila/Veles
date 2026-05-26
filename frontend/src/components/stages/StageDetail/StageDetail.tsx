import { useState, useEffect, useMemo } from 'react';
import type { ClassificationResult, PersonalRecommendation } from '../../../types';
import { GENRE_INFO } from '../../../constants';
import { fetchPersonalRecommendations } from '../../../services/dashboard';
import './StageDetail.css';

interface StageDetailProps {
  result:  ClassificationResult;
  onReset: () => void;
}

export function StageDetail({ result, onReset }: StageDetailProps) {
  const { genre } = result;
  const [spotifyData, setSpotifyData] = useState<PersonalRecommendation[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPersonalRecommendations(genre)
      .then((data) => {
        if (!cancelled) {
          setSpotifyData(data);
          setSpotifyLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSpotifyError(err instanceof Error ? err.message : 'Error al cargar datos');
          setSpotifyLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [genre]);

  const artists = useMemo(() => {
    const map = new Map<string, PersonalRecommendation[]>();
    for (const item of spotifyData) {
      const existing = map.get(item.artista_nombre);
      if (existing) existing.push(item);
      else map.set(item.artista_nombre, [item]);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [spotifyData]);

  const artistGroups = useMemo(() => {
    if (artists.length === 0) return { featured: [], explore: [] };
    const mid = Math.ceil(artists.length / 2);
    return {
      featured: artists.slice(0, mid),
      explore: artists.slice(mid),
    };
  }, [artists]);

  const selectedArtistData = expandedArtist
    ? spotifyData.find((d) => d.artista_nombre === expandedArtist)
    : null;

  const genreInfo = GENRE_INFO[genre];
  const genreDesc = genreInfo?.description ?? '';

  const narrativeIntro = useMemo(() => {
    const intros: Record<string, string> = {
      'Vallenato': `Seleccionamos para ti una curaduría especial de los artistas más representativos del vallenato. Desde las leyendas que forjaron su identidad hasta las voces que lo mantienen vigente.`,
      'Pop': `Hemos reunido a los artistas pop que definen el sonido actual. Cada canción fue elegida por su impacto cultural, calidad de producción y relevancia en la escena musical global.`,
      'Rock': `El rock vive en cada riff y cada batería. Te presentamos una selección de artistas que han marcado la historia del género, desde himnos clásicos hasta nuevas promesas.`,
      'Hip-Hop': `El ritmo y la lírica se encuentran en esta curaduría de hip-hop. Artistas que transforman la calle en poesía y el beat en movimiento.`,
      'Electrónica': `Sumérgete en una experiencia sonora única con los exponentes más innovadores de la música electrónica. Pistas cuidadosamente seleccionadas para cada momento.`,
      'Jazz': `Una selección de los músicos que han definido el arte de la improvisación. Cada track es una conversación entre instrumentos que trasciende el tiempo.`,
      'Clásica': `Las obras maestras de la música clásica interpretadas por los compositores y orquestas más emblemáticos de la historia. Una experiencia sonora atemporal.`,
    };
    return intros[genre] || `Recomendaciones personalizadas de ${genre} para ti, basadas en el análisis de tus preferencias musicales.`;
  }, [genre]);

  // ── Band detection ────────────────────────────────────────────────────────
  const BANDS = new Set([
    // Rock / Alternative
    'Led Zeppelin', 'Nirvana', 'The Rolling Stones', 'Pink Floyd', 'Queen',
    'Metallica', 'Linkin Park', 'Imagine Dragons', 'Foo Fighters', 'Red Hot Chili Peppers',
    'Radiohead', 'The Beatles', 'AC/DC', 'Black Sabbath', 'Guns N\' Roses',
    'Pearl Jam', 'Soundgarden', 'Alice in Chains', 'Rage Against the Machine',
    'The Smashing Pumpkins', 'Green Day', 'Muse', 'Arctic Monkeys', 'Kings of Leon',
    'Coldplay', 'U2', 'Oasis', 'Blur', 'The Cure', 'Depeche Mode', 'Joy Division',
    'The Killers', 'Franz Ferdinand', 'The Strokes', 'Interpol', 'The White Stripes',
    'System of a Down', 'Slipknot', 'Tool', 'Korn',
    'Maroon 5', 'Maná', 'Gorillaz',
    // Pop / Latin
    'ABBA', 'Fleetwood Mac', 'The Police', 'Tears for Fears',
    'One Direction', 'Backstreet Boys', 'NSYNC', 'BTS', 'BLACKPINK',
    // Electrónica
    'Daft Punk', 'Boards of Canada', 'Chemical Brothers', 'Prodigy', 'Underworld',
    'Massive Attack', 'Portishead', 'Moderat', 'Röyksopp',
    // Hip-Hop
    'Wu-Tang Clan', 'Run-DMC', 'Public Enemy', 'A Tribe Called Quest',
    'Outkast', 'N.W.A', 'Cypress Hill', 'Beastie Boys',
    // Jazz
    'Miles Davis Quintet', 'Modern Jazz Quartet', 'Art Ensemble of Chicago',
    // Vallenato
    'Los inquietos del vallenato', 'Binomio de Oro de América',
    'Los Gigantes Del Vallenato', 'Los Diablitos', 'Los Betos', 'Los Chiches Vallenatos',
    // Clásica
    'Berliner Philharmoniker', 'Vienna Philharmonic', 'London Symphony Orchestra',
  ]);

  const isBand = (name: string): boolean => BANDS.has(name);
  const getEntityLabel = (name: string): string => isBand(name) ? 'Banda' : 'Artista';

  const getGroupNarrative = (groupName: string): string => {
    const narratives: Record<string, string> = {
      featured: 'Estos son los artistas y bandas más representativos del género. Sus canciones definen el sonido y la dirección musical de toda una escena.',
      explore: 'Más allá de los titulares, estos artistas y bandas aportan matices únicos que enriquecen el panorama musical del género.',
    };
    return narratives[groupName] || '';
  };

  const getArtistCategory = (artistName: string, _index: number): string => {
    const categories: Record<string, Record<string, string>> = {
      'Pop': {
        'Michael Jackson': '🎤 El Rey del Pop — Ícono indiscutible',
        'The Weeknd': '🌌 Vanguardia sonora — El innovador del pop moderno',
        'Dua Lipa': '✨ Pop global — La voz del nuevo pop internacional',
        'Ariana Grande': '🌸 Potencia vocal — Reina del pop contemporáneo',
        'Taylor Swift': '📖 Narradora de historias — La autora más influyente',
        'Bad Bunny': '🐰 Latin trap — El fenómeno global',
      },
      'Rock': {
        'Led Zeppelin': '⚡ Leyendas del rock — Pioneros del hard rock',
        'Nirvana': '🤘 Revolución grunge — La voz de una generación',
        'The Rolling Stones': '🎸 Dioses del rock — 60 años de historia viva',
        'Pink Floyd': '🌌 Rock psicodélico — Arquitectos del sonido',
        'Queen': '👑 Teatralidad y poder — Rockeros inmortales',
        'Metallica': '🔥 Metal definitivo — La fuerza que no cesa',
      },
      'Hip-Hop': {
        'Kendrick Lamar': '🎙️ Poeta del rap — La lírica como arte',
        'Nas': '📖 Cronista urbano — La escuela del hip-hop clásico',
        'Jay-Z': '👑 Imperio del rap — Empresario y leyenda',
        'Eminem': '🌪️ Velocidad y verdad — El rap como catarsis',
        'Cardi B': '💅 Poder femenino — La reina del rap actual',
      },
      'Electrónica': {
        'Daft Punk': '🤖 Robots del sonido — Revolucionarios del french touch',
        'Aphex Twin': '🌀 Genio IDM — El arquitecto del sonido experimental',
        'Boards of Canada': '🌅 Ambient nostálgico — Paisajes sonoros únicos',
        'Deadmau5': '🖱️ House progresivo — El ratón detrás del mause',
        'Four Tet': '🌿 Electronica orgánica — Lo íntimo y lo digital',
      },
      'Jazz': {
        'Miles Davis': '🎺 El príncipe del jazz — Genio de la improvisación',
        'John Coltrane': '🎷 Búsqueda espiritual — El saxofón trascendental',
        'Bill Evans': '🎹 Poeta del piano — La elegancia armónica',
        'Thelonious Monk': '🎵 Excentricidad musical — El pianista más peculiar',
        'Chet Baker': '🌙 Romanticismo cool — Trompeta al atardecer',
      },
      'Clásica': {
        'Ludwig van Beethoven': '🎼 Genio universal — La fuerza del romanticismo',
        'Claude Debussy': '✨ Impresionismo sonoro — Pintor de atmósferas',
        'J. S. Bach': '🎵 Arquitecto musical — La perfección barroca',
        'Wolfgang Amadeus Mozart': '🌟 Niño prodigio — La elegancia atemporal',
        'Frédéric Chopin': '🌹 Romanticismo puro — El alma del piano',
      },
      'Vallenato': {
        'Yeison Jimenez': '🔥 Vallenato moderno — La nueva generación',
        'Kaleth Morales': '⚡ Nueva Ola — Revolucionó el género',
        'Diomedes Diaz': '👑 El Cacique — Leyenda inmortal',
        'Silvestre Dangond': '🌟 Estrella global — Vallenato sin fronteras',
        'Los inquietos del vallenato': '💔 Románticos eternos — Corazón del vallenato',
        'Binomio de Oro de América': '🏆 Institución musical — Historia viva',
        'Los Gigantes Del Vallenato': '🎶 Embajadores — Autenticidad exportada',
      },
    };
    return categories[genre]?.[artistName] ?? `${getEntityLabel(artistName)} destacado de ${genre}`;
  };

  const getArtistStory = (artistName: string): string => {
    const stories: Record<string, string> = {
      // Pop
      'Michael Jackson': 'Cuando escuchas a Michael Jackson, no solo oyes música — revives décadas de historia. Desde las calles de Gary, Indiana, hasta los escenarios más grandes del mundo, su historia es la de alguien que transformó el dolor en arte y el arte en magia. Cada nota que suena lleva contigo una parte de esa búsqueda interminable de perfección.',
      'The Weeknd': 'Abel Tesfaye creció en las sombras de Toronto y convirtió esa oscuridad en un sonido que nadie había escuchado antes. Con "The Weeknd", no solo encontraste un artista: encontraste un espejo de las noches largas, las emociones complejas y la vulnerabilidad disfrazada de frialdad. Su historia es tuya también.',
      'Dua Lipa': 'De Kosovo a Londres y del Londres a los charts globales. Dua Lipa tomó los rechazos de la industria y los convirtió en combustible. Cuando la escuchas, sientes la energía de alguien que nunca aceptó un "no" como respuesta final. Ese mismo espíritu es el que vibra en cada canción que te recomendamos hoy.',
      'Ariana Grande': 'Ariana Grande aprendió que la voz más poderosa es la que sobrevive. Después de momentos que habrían silenciado a cualquiera, ella eligió cantar más fuerte. Su música te recuerda que los momentos más difíciles también pueden convertirse en los más bellos.',
      'Taylor Swift': 'Taylor Swift empezó escribiendo diarios en Nashville y terminó reescribiendo las reglas de la industria musical. Cada álbum es un capítulo de su vida que millones de personas sintieron como propio. Escucharla hoy es recordar que las historias personales son las más universales.',
      'Bad Bunny': 'Benito Antonio Martínez vendía auriculares en un supermercado en Puerto Rico mientras grababa música en su tiempo libre. Hoy es el artista más escuchado del planeta. Su historia te dice algo importante: el talento y la autenticidad siempre encuentran su camino.',
      // Rock
      'Led Zeppelin': 'Antes de Led Zeppelin, el rock tenía límites. Después de ellos, esos límites dejaron de existir. Jimmy Page, Robert Plant, John Bonham y John Paul Jones crearon algo que todavía no se ha superado. Cuando los escuchas, entiendes por qué generaciones enteras decidieron tocar guitarra.',
      'Nirvana': 'En 1991, Kurt Cobain abrió una caja que nadie sabía que estaba cerrada. El grunge no era solo un sonido: era la voz de todos los que se sentían incomprendidos. Escuchar a Nirvana hoy es reconectarte con esa honestidad brutal que pocas veces se encuentra en la música.',
      'The Rolling Stones': 'Más de seis décadas sobre los escenarios. Los Rolling Stones no son solo una banda: son una institución, una actitud, una forma de entender la vida. Cada vez que suenan, llevan consigo toda la historia del rock and roll. Y tú ahora eres parte de esa historia.',
      'Pink Floyd': 'Pink Floyd no hace canciones, hace viajes. Desde los destellos psicodélicos de los 60 hasta la melancolía monumental de "The Wall", cada álbum es un universo completo. Escucharlos no es solo escuchar música: es explorar las fronteras de lo que el sonido puede hacerle a la mente.',
      'Queen': 'Freddie Mercury subía al escenario y el mundo entero se convertía en su audiencia. Queen mezcló ópera, rock, baladas y teatralidad de una manera que nadie antes había intentado. Su legado te recuerda que la grandiosidad, cuando viene del alma, nunca es demasiado.',
      'Metallica': 'Metallica nació del hambre, los garajes y el deseo de tocar más rápido y más fuerte que cualquiera. Décadas después, siguen siendo la prueba viviente de que la intensidad genuina no tiene fecha de vencimiento. Cuando los escuchas, sientes esa energía primal que los hizo grandes.',
      // Hip-Hop
      'Kendrick Lamar': 'Kendrick Lamar creció en Compton, California, y decidió que su vida merecía ser contada con honestidad brutal. Su rap no es entretenimiento superficial: es literatura, filosofía y testimonio. Cuando lo escuchas, te obliga a pensar, a sentir y a cuestionar. Eso es un regalo que pocos artistas dan.',
      'Nas': 'Con un solo álbum, "Illmatic", Nas cambió para siempre lo que el hip-hop podía decir sobre la vida urbana. Cada verso es una fotografía de Nueva York, de la humanidad y de la supervivencia. Escucharlo hoy es recordar por qué el rap nació: para dar voz a lo que nadie más quería escuchar.',
      'Jay-Z': 'Shawn Carter pasó de vender en las esquinas de Brooklyn a construir un imperio. Jay-Z es la prueba de que la ambición, cuando se combina con talento, puede reescribir el destino. Su música no solo te entretiene: te enseña algo sobre la perseverancia y el poder de la visión.',
      'Eminem': 'Marshall Mathers encontró en el rap un lugar donde su historia importaba. De las calles de Detroit a ganar Oscars, su trayectoria es la de alguien que nunca dejó de luchar. Cuando lo escuchas, sientes la velocidad de una mente que no puede parar de procesar el mundo.',
      'Drake': 'Drake tomó el rap y le inyectó emociones que el género se negaba a mostrar. Convirtió la vulnerabilidad masculina en el sonido más dominante del siglo. Escucharlo es reconocer que está bien sentir todo al mismo tiempo, y que a veces la mejor forma de procesar es con una buena canción.',
      'Cardi B': 'Belcalis Almánzar trabajó de stripper para pagarse la universidad y demostró que el camino al éxito nunca tiene una sola forma. Cardi B llegó al rap sin pedir permiso y redefinió lo que significa el poder femenino en la música. Su historia es la de alguien que se hizo a sí misma, paso a paso.',
      // Electrónica
      'Daft Punk': 'Dos franceses con cascos de robot decidieron que la música electrónica merecía la misma grandiosidad que el rock. Thomas Bangalter y Guy-Manuel crearon algo que sigue siendo imposible de clasificar. Cuando los escuchas, entiendes por qué el futuro siempre suena un poco como ellos.',
      'Aphex Twin': 'Richard D. James construye música como si estuviera diseñando sueños que nadie más puede tener. Su sonido es perturbador, hermoso e incomprensible al mismo tiempo. Escucharlo es aceptar que la música puede llevarte a lugares que ni siquiera sabías que existían en tu mente.',
      'Boards of Canada': 'Los hermanos Sandison crearon un universo sonoro que huele a infancia, a VHS y a tardes que ya no existen. Su música activa recuerdos que quizás no son tuyos pero que sientes como propios. Eso es lo que hace la magia: crear memorias de momentos que nunca viviste.',
      'Deadmau5': 'Joel Zimmermann eligió una cabeza de ratón como máscara y demostró que detrás del personaje hay uno de los productores más técnicamente brillantes de su generación. Su música es matemáticas convertidas en emoción, precisión convertida en euforia.',
      'Four Tet': 'Kieran Hebden hace música que parece hecha de momentos cotidianos transformados en algo sagrado. Cada producción de Four Tet es un recordatorio de que la electrónica puede ser tan íntima y humana como una confesión susurrada.',
      // Jazz
      'Miles Davis': 'Miles Davis nunca se conformó con lo que ya sabía hacer. Reinventó el jazz no una sino varias veces, siempre un paso adelante de todos los demás. Escucharlo es seguir a alguien que eligió la incomodidad del cambio sobre la seguridad de lo conocido. Esa valentía resuena todavía.',
      'John Coltrane': 'John Coltrane tocaba el saxofón como si cada nota fuera una pregunta espiritual sin respuesta definitiva. Su búsqueda de algo más allá de la técnica lo convirtió en uno de los músicos más profundos de la historia. Escucharlo hoy es participar en esa búsqueda.',
      'Bill Evans': 'Bill Evans convirtió el piano en un idioma privado. Su forma de tocar era íntima, casi como escuchar a alguien pensar en voz alta. Escucharlo tarde en la noche es la experiencia más cercana que existe a sentarse junto a un genio y ver cómo trabaja su mente.',
      'Thelonious Monk': 'Thelonious Monk tocaba de una manera que parecía incorrecta hasta que te dabas cuenta de que era perfecta. Su originalidad radical no buscaba aceptación: buscaba verdad. Y esa verdad, décadas después, sigue siendo imposible de ignorar.',
      'Chet Baker': 'Chet Baker tenía una forma de tocar la trompeta que hacía que el tiempo se detuviera. Melancólico, suave, perfecto. Su historia personal fue tan turbulenta como su música era tranquila, y esa contradicción hace que cada nota suene como una despedida y un abrazo al mismo tiempo.',
      // Clásica
      'Ludwig van Beethoven': 'Beethoven compuso algunas de sus obras más monumentales cuando ya no podía escuchar. Esa paradoja — crear sonido desde el silencio — dice todo sobre lo que significa estar verdaderamente llamado a hacer algo. Escucharlo es recordar que las limitaciones no definen lo que somos capaces de crear.',
      'Claude Debussy': 'Debussy pintaba con sonido. Sus composiciones no describen el mundo: lo evocan, lo sugieren, lo dejan flotando en el aire como niebla sobre el mar. Escucharlo es aprender a ver con los oídos y sentir con la imaginación.',
      'J. S. Bach': 'Johann Sebastian Bach compuso con una precisión matemática que de alguna manera sonaba profundamente humana. Siglos después de su muerte, su música sigue siendo el estándar con el que se mide todo lo demás. Escucharlo es estar en presencia de algo que trasciende el tiempo.',
      'Wolfgang Amadeus Mozart': 'Mozart compuso su primera sinfonía a los ocho años. Lo que podría sonar como un dato de trivia es en realidad la historia de alguien para quien la música era tan natural como respirar. Escucharlo hoy es tocar algo que parece venir de un lugar más allá de lo humano.',
      'Frédéric Chopin': 'Chopin nunca dio grandes conciertos ni buscó la fama masiva. Prefería los salones íntimos, la conversación cercana, la música como confidencia. Por eso sus nocturnos y sus baladas suenan como secretos que alguien decidió compartir contigo, solo contigo.',
      // Vallenato
      'Diomedes Diaz': 'Hay artistas y hay leyendas. Diomedes Díaz es las dos cosas, pero sobre todo es Colombia. Su voz tiene el sabor de la tierra caliente, de las historias que se cuentan en las tardes largas del Caribe. Escucharlo es sentir que el vallenato no es un género: es una forma de vida.',
      'Silvestre Dangond': 'Silvestre Dangond tomó el vallenato y lo llevó a donde nunca había estado: los escenarios internacionales, las playlists globales, las generaciones que crecieron con el reguetón. Lo hizo sin traicionar sus raíces. Eso — mantener la esencia mientras se crece — es uno de los logros más difíciles en la música.',
      'Kaleth Morales': 'Kaleth Morales tenía una visión de cómo debía sonar el vallenato del siglo XXI, y estaba en lo correcto. Aunque su vida fue breve, lo que dejó sigue siendo la referencia de lo que el género puede ser cuando le abren las puertas al futuro. Su legado es una conversación que nunca terminó.',
      'Yeison Jimenez': 'Yeison Jiménez llegó desde el Eje Cafetero con una voz que mezcla el vallenato con el despecho y la vida cotidiana. Su música habla de lo que la gente siente pero no siempre sabe cómo decir. Por eso lo escuchan millones: porque él dice lo que todos piensan.',
      'Los inquietos del vallenato': 'Los Inquietos del Vallenato definieron lo que significa el vallenato romántico. Sus canciones son la banda sonora de generaciones de colombianos que se enamoraron, que lloraron y que bailaron sin saber por qué. Escucharlos es regresar a un sentimiento que no tiene fecha de caducidad.',
      'Binomio de Oro de América': 'El Binomio de Oro de América no es solo una agrupación: es una institución. Décadas de música que mezcla la tradición más pura del vallenato con una calidad compositiva que pocos han igualado. Escucharlos es entender de dónde venimos musicalmente como pueblo.',
      'Los Gigantes Del Vallenato': 'Los Gigantes del Vallenato llevan el género en el nombre y lo demuestran en cada canción. Su propuesta es fiel a las raíces pero nunca estancada. Escucharlos es conectarse con la autenticidad de un sonido que sabe exactamente quién es.',
    };
    const entity = isBand(artistName) ? 'banda' : 'artista';
    const article = isBand(artistName) ? 'una de esas bandas' : 'uno de esos artistas';
    return stories[artistName] ?? `${artistName} es ${article} que encontrarás pocas veces en la vida. Su música en el universo del ${genre} no solo suena bien — dice algo, te mueve hacia algún lugar. Dale una oportunidad y déjate llevar por lo que ${entity === 'banda' ? 'tienen' : 'tiene'} para contarte.`;
  };

  const handleArtistClick = (artistName: string) => {
    setExpandedArtist((prev) => (prev === artistName ? null : artistName));
  };

  const openSpotifyArtist = (artistId: string) => {
    window.open(`https://open.spotify.com/artist/${artistId}`, '_blank');
  };

  const openSpotifyTrack = (trackId: string) => {
    window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
  };

  return (
    <section className="stage-detail">
      <div className="stage-detail__content">
        <div className="stage-detail__header">
          <span className="stage-detail__genre-tag">{genre}</span>
          <h2 className="stage-detail__title">Escucha también</h2>
        </div>

        {/* ── Storytelling intro ── */}
        {!spotifyLoading && !spotifyError && spotifyData.length > 0 && (
          <div className="stage-detail__intro">
            <p className="stage-detail__intro-text">{narrativeIntro}</p>
            <p className="stage-detail__intro-sub">
              {genreDesc}
            </p>
          </div>
        )}

        {/* ── Spotify recommendations ── */}
        <div className="stage-detail__spotify-section">
          {spotifyLoading && (
            <div className="stage-detail__spotify-loading">Cargando recomendaciones…</div>
          )}

          {spotifyError && (
            <div className="stage-detail__spotify-error">{spotifyError}</div>
          )}

          {!spotifyLoading && !spotifyError && spotifyData.length === 0 && (
            <div className="stage-detail__spotify-empty">No hay datos disponibles para este género.</div>
          )}

          {!spotifyLoading && !spotifyError && spotifyData.length > 0 && (
            <>
              {/* ── Artist detail panel ── */}
              {expandedArtist && selectedArtistData && (
                <div className="stage-detail__artist-panel">
                  <button className="stage-detail__artist-panel-close" onClick={() => setExpandedArtist(null)}>
                    ✕
                  </button>
                  <div className="stage-detail__artist-panel-body">
                    <div className="stage-detail__artist-panel-img">
                      {selectedArtistData.imagen_artista ? (
                        <img src={selectedArtistData.imagen_artista} alt={expandedArtist} />
                      ) : (
                        <div className="stage-detail__artist-panel-placeholder">
                          {expandedArtist.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="stage-detail__artist-panel-info">
                      <span className="stage-detail__artist-panel-name">{expandedArtist}</span>
                      <span className="stage-detail__artist-panel-tag">{getEntityLabel(expandedArtist)} · {genre}</span>
                      <p className="stage-detail__artist-panel-desc">
                        {getArtistStory(expandedArtist)}
                      </p>
                      <button
                        className="stage-detail__artist-panel-spotify"
                        onClick={() => openSpotifyArtist(selectedArtistData.artista_id)}
                      >
                        Escuchar en Spotify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Artists ── */}
              {artistGroups.featured.length > 0 && (
                <div className="stage-detail__group">
                  <div className="stage-detail__group-header">
                    <span className="stage-detail__group-title">Artistas y bandas destacados</span>
                    <p className="stage-detail__group-narrative">{getGroupNarrative('featured')}</p>
                  </div>
                  <div className="stage-detail__spotify-artists">
                    {artistGroups.featured.map(([artistName, items], idx) => {
                      const first = items[0];
                      const isExpanded = expandedArtist === artistName;
                      return (
                        <div key={artistName} className="stage-detail__artist-wrapper">
                          <div
                            className={`stage-detail__spotify-artist ${isExpanded ? 'stage-detail__spotify-artist--active' : ''}`}
                            onClick={() => handleArtistClick(artistName)}
                          >
                            <div className="stage-detail__spotify-artist-img">
                              {first.imagen_artista ? (
                                <img src={first.imagen_artista} alt={artistName} loading="lazy" />
                              ) : (
                                <div className="stage-detail__spotify-artist-placeholder">
                                  {artistName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="stage-detail__spotify-artist-info">
                              <span className="stage-detail__spotify-artist-name">{artistName}</span>
                              <span className="stage-detail__spotify-artist-category">
                                {getArtistCategory(artistName, idx)}
                              </span>
                            </div>
                            <span className="stage-detail__spotify-artist-chevron">
                              {isExpanded ? '▾' : '▸'}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="stage-detail__artist-songs">
                              {items.map((item) => (
                                <div
                                  key={item.cancion_id || item.cancion_nombre}
                                  className="stage-detail__spotify-song"
                                  onClick={() => openSpotifyTrack(item.cancion_id)}
                                >
                                  <div className="stage-detail__spotify-song-img-sm">
                                    {item.imagen_album ? (
                                      <img src={item.imagen_album} alt={item.cancion_nombre} loading="lazy" />
                                    ) : (
                                      <div className="stage-detail__spotify-song-placeholder-sm">♪</div>
                                    )}
                                  </div>
                                  <div className="stage-detail__spotify-song-info-sm">
                                    <span className="stage-detail__spotify-song-title-sm">{item.cancion_nombre}</span>
                                    <span className="stage-detail__spotify-song-pop-sm">
                                      {fmt(item.duracion_ms)}
                                      {item.es_explicito && <span className="stage-detail__explicit-tag"> E</span>}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {artistGroups.explore.length > 0 && (
                <div className="stage-detail__group">
                  <div className="stage-detail__group-header">
                    <span className="stage-detail__group-title">Más para explorar</span>
                    <p className="stage-detail__group-narrative">{getGroupNarrative('explore')}</p>
                  </div>
                  <div className="stage-detail__spotify-artists">
                    {artistGroups.explore.map(([artistName, items], idx) => {
                      const first = items[0];
                      const isExpanded = expandedArtist === artistName;
                      return (
                        <div key={artistName} className="stage-detail__artist-wrapper">
                          <div
                            className={`stage-detail__spotify-artist ${isExpanded ? 'stage-detail__spotify-artist--active' : ''}`}
                            onClick={() => handleArtistClick(artistName)}
                          >
                            <div className="stage-detail__spotify-artist-img">
                              {first.imagen_artista ? (
                                <img src={first.imagen_artista} alt={artistName} loading="lazy" />
                              ) : (
                                <div className="stage-detail__spotify-artist-placeholder">
                                  {artistName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="stage-detail__spotify-artist-info">
                              <span className="stage-detail__spotify-artist-name">{artistName}</span>
                              <span className="stage-detail__spotify-artist-category">
                                {getArtistCategory(artistName, idx)}
                              </span>
                            </div>
                            <span className="stage-detail__spotify-artist-chevron">
                              {isExpanded ? '▾' : '▸'}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="stage-detail__artist-songs">
                              {items.map((item) => (
                                <div
                                  key={item.cancion_id || item.cancion_nombre}
                                  className="stage-detail__spotify-song"
                                  onClick={() => openSpotifyTrack(item.cancion_id)}
                                >
                                  <div className="stage-detail__spotify-song-img-sm">
                                    {item.imagen_album ? (
                                      <img src={item.imagen_album} alt={item.cancion_nombre} loading="lazy" />
                                    ) : (
                                      <div className="stage-detail__spotify-song-placeholder-sm">♪</div>
                                    )}
                                  </div>
                                  <div className="stage-detail__spotify-song-info-sm">
                                    <span className="stage-detail__spotify-song-title-sm">{item.cancion_nombre}</span>
                                    <span className="stage-detail__spotify-song-pop-sm">
                                      {fmt(item.duracion_ms)}
                                      {item.es_explicito && <span className="stage-detail__explicit-tag"> E</span>}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <button className="stage-detail__reset" onClick={onReset}>
          ↩ Identificar otro género
        </button>
      </div>
    </section>
  );
}

function fmt(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
