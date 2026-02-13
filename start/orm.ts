import { BaseModel } from '@adonisjs/lucid/orm'
import SnakeCaseSerializer from '../app/naming_strategy.js'

BaseModel.namingStrategy = new SnakeCaseSerializer()
