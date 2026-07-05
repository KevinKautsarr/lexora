// Seed konten LEXORA dari prisma/vocabulary-seed.json.
// Idempotent: upsert berdasarkan kunci alami (level.code; unit levelId+order;
// lesson unitId+order; word lessonId+term) — aman dijalankan berulang tanpa
// duplikasi dan tanpa menghapus progress user. Kata yang dihapus dari JSON
// ikut dihapus dari lesson terkait agar DB selalu mencerminkan JSON.
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type WordSeed = { english: string; indonesian: string }
type LessonSeed = { title: string; order: number; words: WordSeed[] }
type UnitSeed = { title: string; order: number; lessons: LessonSeed[] }
type LevelSeed = {
  code: string
  name: string
  order: number
  description: string
  units: UnitSeed[]
}
type SeedFile = { levels: LevelSeed[] }

const MIN_WORDS_PER_LESSON = 4

function fail(message: string): never {
  throw new Error(`vocabulary-seed.json tidak valid: ${message}`)
}

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') fail(`${label} kosong atau bukan string`)
  return value.trim()
}

function validate(data: SeedFile): void {
  if (!Array.isArray(data.levels) || data.levels.length === 0) fail('levels[] kosong')

  const codes = new Set<string>()
  const orders = new Set<number>()
  for (const level of data.levels) {
    const where = `Level "${level.code}"`
    nonEmpty(level.code, `${where}: code`)
    nonEmpty(level.name, `${where}: name`)
    nonEmpty(level.description, `${where}: description`)
    if (!Number.isInteger(level.order)) fail(`${where}: order bukan integer`)
    if (codes.has(level.code)) fail(`${where}: code duplikat`)
    if (orders.has(level.order)) fail(`${where}: order ${level.order} duplikat`)
    codes.add(level.code)
    orders.add(level.order)

    if (!Array.isArray(level.units) || level.units.length === 0) fail(`${where}: units[] kosong`)
    const unitOrders = new Set<number>()
    for (const unit of level.units) {
      const uWhere = `${where} > Unit ${unit.order} "${unit.title}"`
      nonEmpty(unit.title, `${uWhere}: title`)
      if (!Number.isInteger(unit.order)) fail(`${uWhere}: order bukan integer`)
      if (unitOrders.has(unit.order)) fail(`${uWhere}: order duplikat dalam level`)
      unitOrders.add(unit.order)

      if (!Array.isArray(unit.lessons) || unit.lessons.length === 0)
        fail(`${uWhere}: lessons[] kosong`)
      const lessonOrders = new Set<number>()
      for (const lesson of unit.lessons) {
        const lWhere = `${uWhere} > Lesson ${lesson.order} "${lesson.title}"`
        nonEmpty(lesson.title, `${lWhere}: title`)
        if (!Number.isInteger(lesson.order)) fail(`${lWhere}: order bukan integer`)
        if (lessonOrders.has(lesson.order)) fail(`${lWhere}: order duplikat dalam unit`)
        lessonOrders.add(lesson.order)

        if (!Array.isArray(lesson.words) || lesson.words.length < MIN_WORDS_PER_LESSON)
          fail(`${lWhere}: minimal ${MIN_WORDS_PER_LESSON} kata, dapat ${lesson.words?.length ?? 0}`)
        const englishSeen = new Set<string>()
        for (const word of lesson.words) {
          const english = nonEmpty(word.english, `${lWhere}: english`)
          nonEmpty(word.indonesian, `${lWhere}: indonesian untuk "${english}"`)
          if (englishSeen.has(english)) fail(`${lWhere}: kata "${english}" duplikat dalam lesson`)
          englishSeen.add(english)
        }
      }
    }
  }
}

async function main() {
  const filePath = path.join(__dirname, 'vocabulary-seed.json')
  let data: SeedFile
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    fail(`gagal membaca/parse ${filePath}: ${(error as Error).message}`)
  }
  validate(data)

  const perLevel: Record<string, { units: number; lessons: number; words: number }> = {}

  for (const level of data.levels) {
    const createdLevel = await prisma.level.upsert({
      where: { code: level.code },
      update: { name: level.name, order: level.order, description: level.description },
      create: {
        code: level.code,
        name: level.name,
        order: level.order,
        description: level.description,
      },
    })
    const stats = { units: 0, lessons: 0, words: 0 }

    for (const unit of level.units) {
      const createdUnit = await prisma.unit.upsert({
        where: { levelId_order: { levelId: createdLevel.id, order: unit.order } },
        update: { title: unit.title },
        create: { title: unit.title, order: unit.order, levelId: createdLevel.id },
      })
      stats.units++

      for (const lesson of unit.lessons) {
        const createdLesson = await prisma.lesson.upsert({
          where: { unitId_order: { unitId: createdUnit.id, order: lesson.order } },
          update: { title: lesson.title },
          create: { title: lesson.title, order: lesson.order, unitId: createdUnit.id },
        })
        stats.lessons++

        const terms = lesson.words.map((w) => w.english.trim())
        await prisma.word.deleteMany({
          where: { lessonId: createdLesson.id, term: { notIn: terms } },
        })
        await Promise.all(
          lesson.words.map((word) =>
            prisma.word.upsert({
              where: {
                lessonId_term: { lessonId: createdLesson.id, term: word.english.trim() },
              },
              update: { translation: word.indonesian.trim() },
              create: {
                term: word.english.trim(),
                translation: word.indonesian.trim(),
                lessonId: createdLesson.id,
              },
            }),
          ),
        )
        stats.words += lesson.words.length
      }
    }
    perLevel[`${level.code} ${level.name}`] = stats
  }

  console.table(perLevel)
  const totals = Object.values(perLevel).reduce(
    (acc, s) => ({
      units: acc.units + s.units,
      lessons: acc.lessons + s.lessons,
      words: acc.words + s.words,
    }),
    { units: 0, lessons: 0, words: 0 },
  )
  console.log(`Total: ${Object.keys(perLevel).length} level, ${totals.units} unit, ${totals.lessons} lesson, ${totals.words} kata`)
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
