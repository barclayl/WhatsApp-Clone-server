import { PubSub } from 'apollo-server-express'
import { User } from './db'
import { PoolClient } from 'pg'

export type MyContext = {
  pubsub: PubSub,
  currentUser: User,
  db: PoolClient,
}
