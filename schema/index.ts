import { importSchema } from 'graphql-import'
import { makeExecutableSchema, IResolvers } from 'graphql-tools'
import resolvers from './resolvers'

const typeDefs = importSchema('schema/typeDefs.graphql')

// module: root
export default makeExecutableSchema({
  resolvers: resolvers as IResolvers,
  typeDefs,
})
