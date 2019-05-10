import { PubSub } from 'apollo-server-express'
import { User } from './db'
import { Response } from 'express'
import { UnsplashApi } from "./schema/unsplash.api";

export type MyContext = {
  pubsub: PubSub,
  currentUser: User,
  res: Response,
  dataSources: {
    unsplashApi: UnsplashApi,
  },
}
