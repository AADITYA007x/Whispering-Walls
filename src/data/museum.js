export const ENTRANCE = { wall: '#d9d4cb', text: '#1c1a17' }
export const VIEWING_ROOM = { wall: '#2b2722', text: '#f2ede3' }

export const WINGS = [
  {
    id: 'time',
    name: 'Through time',
    blurb: 'Walk from the 1400s to 1900, one century at a time',
    wall: '#5c1f24',
    text: '#f2ede3',
    rooms: [
      { id: '1400s', name: 'The 1400s', subtitle: 'Gold leaf and quiet saints', filters: { painting: true, from: 1400, to: 1499 } },
      { id: '1500s', name: 'The 1500s', subtitle: 'Renaissance masters at work', filters: { painting: true, from: 1500, to: 1599 } },
      { id: '1600s', name: 'The 1600s', subtitle: 'Candlelight and deep shadow', filters: { painting: true, from: 1600, to: 1699, perArtist: 3, artists: ['Rembrandt', 'Johannes Vermeer', 'Caravaggio', 'Peter Paul Rubens', 'Diego Velázquez', 'Frans Hals', 'Artemisia Gentileschi', 'Anthony van Dyck', 'Nicolas Poussin', 'Georges de La Tour'] } },
      { id: '1700s', name: 'The 1700s', subtitle: 'Pastel skies and powdered wigs', filters: { painting: true, from: 1700, to: 1799 } },
      { id: '1800-1849', name: '1800 to 1849', subtitle: 'Storms, ruins and romance', filters: { painting: true, from: 1800, to: 1849 } },
      { id: '1850-1899', name: '1850 to 1899', subtitle: 'Painting in the open air', filters: { painting: true, from: 1850, to: 1899 } },
    ],
  },
  {
    id: 'styles',
    name: 'Styles',
    blurb: 'Movements, schools and traditions from around the world',
    wall: '#1e3550',
    text: '#f2ede3',
    rooms: [
      { id: 'impressionism', name: 'Impressionism', subtitle: 'Light caught in a hurry', filters: { painting: true, movements: ['Impressionism'] } },
      { id: 'post-impressionism', name: 'Post-Impressionism', subtitle: 'Bold colour, bolder brushwork', filters: { painting: true, perArtist: 3, artists: ['Paul Gauguin', 'Georges Seurat', 'Paul Signac', 'Henri de Toulouse-Lautrec', 'Vincent van Gogh', 'Paul Cézanne', 'Henri Rousseau'] } },
      { id: 'indian-painting', name: 'Indian painting', subtitle: 'Courts, gods and gardens', filters: { countries: ['India', 'Mughal Empire'], movements: ['Mughal painting', 'Rajput painting', 'Pahari painting', 'Company painting'], matchAny: true } },
      { id: 'japanese-prints', name: 'Japanese woodblock prints', subtitle: 'The floating world in ink', filters: { perArtist: 5, artists: ['Katsushika Hokusai', 'Utagawa Hiroshige', 'Kitagawa Utamaro', 'Tōshūsai Sharaku'] } },
      { id: 'dutch-golden-age', name: 'Dutch Golden Age', subtitle: 'Merchants, still lifes and skies', filters: { painting: true, movements: ['Dutch Golden Age painting'] } },
      { id: 'landscapes', name: 'Landscapes', subtitle: 'Fields, seas and mountains', filters: { painting: true, perArtist: 3, artists: ['J. M. W. Turner', 'John Constable', 'Caspar David Friedrich', 'Jacob van Ruisdael', 'Thomas Cole', 'Albert Bierstadt', 'Alfred Sisley', 'Ivan Shishkin', 'Camille Pissarro'] } },
    ],
  },
  {
    id: 'artists',
    name: 'Artists',
    blurb: 'Rooms dedicated to the masters themselves',
    wall: '#2f4a3f',
    text: '#f2ede3',
    rooms: [
      { id: 'monet', name: 'Claude Monet', subtitle: 'Haystacks, lilies and fog', filters: { painting: true, artists: ['Claude Monet'] } },
      { id: 'van-gogh', name: 'Vincent van Gogh', subtitle: 'Swirls of restless colour', filters: { painting: true, artists: ['Vincent van Gogh'] } },
      { id: 'cezanne', name: 'Paul Cézanne', subtitle: 'Apples, mountains and order', filters: { painting: true, artists: ['Paul Cézanne'] } },
      { id: 'renoir', name: 'Pierre-Auguste Renoir', subtitle: 'Warm light on everyday joy', filters: { painting: true, artists: ['Pierre-Auguste Renoir'] } },
      { id: 'degas', name: 'Edgar Degas', subtitle: 'Dancers in motion', filters: { artists: ['Edgar Degas'] } },
      { id: 'hokusai', name: 'Katsushika Hokusai', subtitle: 'Waves, bridges and Mount Fuji', filters: { artists: ['Katsushika Hokusai'] } },
    ],
  },
]

export const SURPRISE = { wall: '#3d2a3f', text: '#f2ede3' }

export function findWing(wingId) {
  return WINGS.find((w) => w.id === wingId)
}

export function findRoom(wingId, roomId) {
  const wing = findWing(wingId)
  if (!wing) return {}
  const index = wing.rooms.findIndex((r) => r.id === roomId)
  return { wing, room: wing.rooms[index], index }
}

export function roomKey(wingId, roomId) {
  return `${wingId}/${roomId}`
}
