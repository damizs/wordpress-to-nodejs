import { SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'

export default class SnakeCaseSerializer extends SnakeCaseNamingStrategy {
  serializedName(_model: any, propertyName: string): string {
    return string.snakeCase(propertyName)
  }
}
