import { type SchemaTypeDefinition } from 'sanity'
import { shoe } from './shoe'
import { review } from './review'
import { banner } from './banner'
import { settings } from './settings'
import { orderItem } from './orderItem'
import { order } from './order'

export const schemaTypes: SchemaTypeDefinition[] = [shoe, review, banner, settings, orderItem, order]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
}