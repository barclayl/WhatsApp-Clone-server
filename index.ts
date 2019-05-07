import { ApolloServer, gql, PubSub } from 'apollo-server-express'
import http from 'http'
import jwt from 'jsonwebtoken'
import { app } from './app'
import { pool } from './db'
import { origin, port, secret } from './env'
import schema from './schema'
import { MyContext } from './context'
import sql from 'sql-template-strings'

const pubsub = new PubSub()
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // module: user / auth
    const username = jwt.verify(req.cookies.authToken, secret) as string
    // should be either global or in a shared module
    const db = await pool.connect()
    let currentUser
    if (username) {
      const { rows } =  await db.query(sql`SELECT * FROM users WHERE username === ${username}`)
      currentUser = rows[0]
    }

    return {
      currentUser,
      pubsub,
      db,
    }
  },
  formatResponse: (res: any, { context }: { context: MyContext }) => {
    // this could be moved to GraphQLExtension.willSendResponse
    context.db.release()
    return res
  }
})

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: { credentials: true, origin },
})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
