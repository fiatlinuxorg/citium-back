import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import DatabaseSeeder from '../app/database/database_seeder.js'

export default class SeedDatabase extends BaseCommand {
  static commandName = 'seed:database'
  static description = 'seeds the database with initial data as admin and construction sites'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Seeding the database...')
    const seeder = new DatabaseSeeder()
    await seeder.run()
    this.logger.success('Database seeded successfully')

    process.exit(0)
  }
}
