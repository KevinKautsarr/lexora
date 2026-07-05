import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type WordSeed = { english: string; indonesian: string }
type LessonSeed = { title: string; order: number; words: WordSeed[] }
type UnitSeed = { title: string; order: number; lessons: LessonSeed[] }

const units: UnitSeed[] = [
  {
    title: 'Basics',
    order: 1,
    lessons: [
      {
        title: 'Greetings',
        order: 1,
        words: [
          { english: 'hello', indonesian: 'halo' },
          { english: 'goodbye', indonesian: 'selamat tinggal' },
          { english: 'please', indonesian: 'tolong' },
          { english: 'thank you', indonesian: 'terima kasih' },
          { english: 'sorry', indonesian: 'maaf' },
          { english: 'yes', indonesian: 'ya' },
          { english: 'no', indonesian: 'tidak' },
        ],
      },
      {
        title: 'Numbers',
        order: 2,
        words: [
          { english: 'one', indonesian: 'satu' },
          { english: 'two', indonesian: 'dua' },
          { english: 'three', indonesian: 'tiga' },
          { english: 'four', indonesian: 'empat' },
          { english: 'five', indonesian: 'lima' },
          { english: 'ten', indonesian: 'sepuluh' },
        ],
      },
      {
        title: 'Colors',
        order: 3,
        words: [
          { english: 'red', indonesian: 'merah' },
          { english: 'blue', indonesian: 'biru' },
          { english: 'green', indonesian: 'hijau' },
          { english: 'yellow', indonesian: 'kuning' },
          { english: 'black', indonesian: 'hitam' },
          { english: 'white', indonesian: 'putih' },
        ],
      },
    ],
  },
  {
    title: 'Daily Life',
    order: 2,
    lessons: [
      {
        title: 'Food & Drink',
        order: 1,
        words: [
          { english: 'water', indonesian: 'air' },
          { english: 'rice', indonesian: 'nasi' },
          { english: 'bread', indonesian: 'roti' },
          { english: 'coffee', indonesian: 'kopi' },
          { english: 'tea', indonesian: 'teh' },
          { english: 'egg', indonesian: 'telur' },
          { english: 'fruit', indonesian: 'buah' },
          { english: 'vegetable', indonesian: 'sayur' },
        ],
      },
      {
        title: 'Family',
        order: 2,
        words: [
          { english: 'mother', indonesian: 'ibu' },
          { english: 'father', indonesian: 'ayah' },
          { english: 'brother', indonesian: 'saudara laki-laki' },
          { english: 'sister', indonesian: 'saudara perempuan' },
          { english: 'child', indonesian: 'anak' },
          { english: 'friend', indonesian: 'teman' },
        ],
      },
      {
        title: 'Around the House',
        order: 3,
        words: [
          { english: 'house', indonesian: 'rumah' },
          { english: 'room', indonesian: 'kamar' },
          { english: 'door', indonesian: 'pintu' },
          { english: 'window', indonesian: 'jendela' },
          { english: 'table', indonesian: 'meja' },
          { english: 'chair', indonesian: 'kursi' },
          { english: 'kitchen', indonesian: 'dapur' },
        ],
      },
    ],
  },
]

async function main() {
  for (const unit of units) {
    const createdUnit = await prisma.unit.upsert({
      where: { id: `seed-unit-${unit.order}` },
      update: { title: unit.title, order: unit.order },
      create: { id: `seed-unit-${unit.order}`, title: unit.title, order: unit.order },
    })

    for (const lesson of unit.lessons) {
      const lessonId = `seed-lesson-${unit.order}-${lesson.order}`
      await prisma.lesson.upsert({
        where: { id: lessonId },
        update: { title: lesson.title, order: lesson.order, unitId: createdUnit.id },
        create: {
          id: lessonId,
          title: lesson.title,
          order: lesson.order,
          unitId: createdUnit.id,
        },
      })

      await prisma.word.deleteMany({ where: { lessonId } })
      await prisma.word.createMany({
        data: lesson.words.map((word) => ({
          term: word.english,
          translation: word.indonesian,
          lessonId,
        })),
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
