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
      { id: '1600s', sound: 'candle', name: 'The 1600s', subtitle: 'Candlelight and deep shadow', filters: { painting: true, from: 1600, to: 1699, perArtist: 3, artists: ['Rembrandt', 'Johannes Vermeer', 'Caravaggio', 'Peter Paul Rubens', 'Diego Velázquez', 'Frans Hals', 'Artemisia Gentileschi', 'Anthony van Dyck', 'Nicolas Poussin', 'Georges de La Tour'] } },
      { id: '1700s', name: 'The 1700s', subtitle: 'Pastel skies and powdered wigs', filters: { painting: true, from: 1700, to: 1799 } },
      { id: '1800-1849', sound: 'wind', name: '1800 to 1849', subtitle: 'Storms, ruins and romance', filters: { painting: true, from: 1800, to: 1849 } },
      { id: '1850-1899', sound: 'wind', name: '1850 to 1899', subtitle: 'Painting in the open air', filters: { painting: true, from: 1850, to: 1899 } },
    ],
  },
  {
    id: 'styles',
    name: 'Styles',
    blurb: 'Movements, schools and traditions from around the world',
    wall: '#1e3550',
    text: '#f2ede3',
    rooms: [
      { id: 'impressionism', sound: 'sea', name: 'Impressionism', subtitle: 'Light caught in a hurry', filters: { painting: true, movements: ['Impressionism'] } },
      { id: 'post-impressionism', sound: 'wind', name: 'Post-Impressionism', subtitle: 'Bold colour, bolder brushwork', filters: { painting: true, perArtist: 3, artists: ['Paul Gauguin', 'Georges Seurat', 'Paul Signac', 'Henri de Toulouse-Lautrec', 'Vincent van Gogh', 'Paul Cézanne', 'Henri Rousseau'] } },
      { id: 'indian-painting', name: 'Indian painting', subtitle: 'Courts, gods and gardens', filters: { painting: true, matchAny: true, perArtist: 3, countries: ['India', 'Mughal Empire'], movements: ['Mughal painting', 'Rajput painting', 'Pahari painting', 'Company painting'], artists: ['Abu al-Hasan', 'Ustad Mansur', 'Basawan', 'Daswanth', 'Bichitr', 'Govardhan', 'Nainsukh', 'Manaku', 'Pandit Seu', 'Mir Sayyid Ali', 'Abd al-Samad', 'Farrukh Beg', 'Manohar Das', 'Bishandas', 'Payag'] } },
      { id: 'japanese-prints', sound: 'rain', name: 'Japanese woodblock prints', subtitle: 'The floating world in ink', filters: { perArtist: 5, artists: ['Katsushika Hokusai', 'Utagawa Hiroshige', 'Kitagawa Utamaro', 'Tōshūsai Sharaku'] } },
      { id: 'dutch-golden-age', sound: 'candle', name: 'Dutch Golden Age', subtitle: 'Merchants, still lifes and skies', filters: { painting: true, movements: ['Dutch Golden Age painting'] } },
      { id: 'landscapes', sound: 'wind', name: 'Landscapes', subtitle: 'Fields, seas and mountains', filters: { painting: true, perArtist: 3, artists: ['J. M. W. Turner', 'John Constable', 'Caspar David Friedrich', 'Jacob van Ruisdael', 'Thomas Cole', 'Albert Bierstadt', 'Alfred Sisley', 'Ivan Shishkin', 'Camille Pissarro'] } },
    ],
  },
  {
    id: 'artists',
    name: 'Artists',
    blurb: 'The masters everyone knows, from Leonardo to Munch',
    wall: '#2f4a3f',
    text: '#f2ede3',
    rooms: [
      { id: 'leonardo', name: 'Leonardo da Vinci', subtitle: 'Smiles, saints and secrets', filters: { types: ['painting', 'fresco', 'mural', 'fresco cycle', 'wall painting'], artists: ['Leonardo da Vinci'] } },
      { id: 'michelangelo', name: 'Michelangelo', subtitle: 'Giants on the chapel ceiling', filters: { types: ['painting', 'fresco', 'mural', 'fresco cycle', 'wall painting'], artists: ['Michelangelo'] } },
      { id: 'raphael', name: 'Raphael', subtitle: 'Grace, calm and perfect balance', filters: { types: ['painting', 'fresco', 'mural', 'fresco cycle', 'wall painting'], artists: ['Raphael'] } },
      { id: 'botticelli', name: 'Sandro Botticelli', subtitle: 'Goddesses on the shore', filters: { types: ['painting', 'fresco', 'mural', 'fresco cycle', 'wall painting'], artists: ['Sandro Botticelli'] } },
      { id: 'caravaggio', sound: 'candle', name: 'Caravaggio', subtitle: 'Drama in deep shadow', filters: { painting: true, artists: ['Caravaggio'] } },
      { id: 'rembrandt', sound: 'candle', name: 'Rembrandt', subtitle: 'Light, shadow and honest faces', filters: { painting: true, artists: ['Rembrandt'] } },
      { id: 'vermeer', sound: 'candle', name: 'Johannes Vermeer', subtitle: 'Quiet rooms full of light', filters: { painting: true, artists: ['Johannes Vermeer'] } },
      { id: 'ravi-varma', name: 'Raja Ravi Varma', subtitle: 'Gods and heroines of India', filters: { painting: true, artists: ['Raja Ravi Varma'] } },
      { id: 'van-gogh', sound: 'wind', name: 'Vincent van Gogh', subtitle: 'Swirls of restless colour', filters: { painting: true, artists: ['Vincent van Gogh'] } },
      { id: 'monet', sound: 'sea', name: 'Claude Monet', subtitle: 'Haystacks, lilies and fog', filters: { painting: true, artists: ['Claude Monet'] } },
      { id: 'renoir', sound: 'sea', name: 'Pierre-Auguste Renoir', subtitle: 'Warm light on everyday joy', filters: { painting: true, artists: ['Pierre-Auguste Renoir'] } },
      { id: 'degas', name: 'Edgar Degas', subtitle: 'Dancers in motion', filters: { artists: ['Edgar Degas'] } },
      { id: 'cezanne', name: 'Paul Cézanne', subtitle: 'Apples, mountains and order', filters: { painting: true, artists: ['Paul Cézanne'] } },
      { id: 'klimt', name: 'Gustav Klimt', subtitle: 'Gold leaf and dreaming lovers', filters: { painting: true, artists: ['Gustav Klimt'] } },
      { id: 'munch', name: 'Edvard Munch', subtitle: 'The scream and other feelings', filters: { painting: true, artists: ['Edvard Munch'] } },
      { id: 'hokusai', sound: 'rain', name: 'Katsushika Hokusai', subtitle: 'Waves, bridges and Mount Fuji', filters: { artists: ['Katsushika Hokusai'] } },
    ],
  },
]

export const SURPRISE = { wall: '#3d2a3f', text: '#f2ede3' }
export const POSTCARD_ROOM = { wall: '#3d2a3f', text: '#f2ede3' }

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

export const HIDDEN_PAINTINGS = [
  'Q334138',
  'Q2717022',
]
