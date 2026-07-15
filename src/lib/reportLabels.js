/**
 * Static UI copy for the dashboard report cards (section headings and small
 * captions), translated per report language. The AI-generated CONTENT inside
 * each card is already translated server-side — this file only covers the
 * surrounding chrome that was previously hardcoded in English regardless of
 * the report's language (e.g. section titles still showing English on a
 * Darija report).
 */

const LABELS = {
  chemistry_score: {
    english: 'Chemistry Score',
    spanish: 'Puntuación de Compatibilidad',
    darija:  'نقطة الكيمياء',
  },
  common_ground: {
    english: 'Common Ground',
    spanish: 'Puntos en Común',
    darija:  'الحوايج المشتركة',
  },
  communication_styles: {
    english: 'Communication Styles',
    spanish: 'Estilos de Comunicación',
    darija:  'طريقة التواصل',
  },
  misunderstanding_resolver: {
    english: 'Misunderstanding Resolver',
    spanish: 'Resolución de Malentendidos',
    darija:  'حل السوء التفاهم',
  },
  memory_box: {
    english: 'Memory Box',
    spanish: 'Caja de Recuerdos',
    darija:  'صندوق الذكريات',
  },
  activity_ideas: {
    english: 'Activity Ideas',
    spanish: 'Ideas de Actividades',
    darija:  'أفكار لأنشطة',
  },
  connection_questions: {
    english: 'Questions to Grow Closer',
    spanish: 'Preguntas para Conectar Más',
    darija:  'أسئلة بش تقربو لبعضياتكم',
  },
  love_languages: {
    english: 'Love Languages',
    spanish: 'Lenguajes del Amor',
    darija:  'لغات المحبة',
  },
  sweet_messages: {
    english: 'Sweet Messages to Send',
    spanish: 'Mensajes Dulces para Enviar',
    darija:  'رسايل حلوة بش تصيفطها',
  },
  make_them_happy: {
    english: 'Little Things That Make Them Happy',
    spanish: 'Pequeñas Cosas Que Los Hacen Felices',
    darija:  'حوايج صغيرة كايفرحوهم',
  },
  top_words: {
    english: 'Words You Use Most',
    spanish: 'Palabras Más Usadas',
    darija:  'الكلمات لي كايستعملو بزاف',
  },
  most_positive: {
    english: 'The Ray of Sunshine',
    spanish: 'El Rayo de Sol',
    darija:  'شعاع الفرح',
  },
  one_sentence_caption: {
    english: 'In one sentence',
    spanish: 'En una frase',
    darija:  'ف جملة واحدة',
  },
}

/**
 * @param {string} key      One of the keys in LABELS above.
 * @param {string} language 'english' | 'spanish' | 'darija' (falls back to english)
 */
export function getLabel(key, language = 'english') {
  const entry = LABELS[key]
  if (!entry) return key
  return entry[language] ?? entry.english
}
