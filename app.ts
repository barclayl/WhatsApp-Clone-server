import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from './db'
import { expiration, origin, secret } from './env'
import { validateLength, validatePassword } from './validators'
import sql from 'sql-template-strings'

export const app = express()

app.use(cors({ credentials: true, origin }))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/_ping', (req, res) => {
  res.send('pong')
})

// module: user/auth
app.post('/sign-up', async (req, res) => {
  const { name, username, password, passwordConfirm } = req.body

  try {
    validateLength('req.name', name, 3, 50)
    validateLength('req.username', name, 3, 18)
    validatePassword('req.password', password)

    if (password !== passwordConfirm) {
      throw Error("req.password and req.passwordConfirm don't match")
    }

    const { rows } = await pool.query(sql`SELECT * FROM users WHERE username = ${username}`)
    if (rows[0]) {
      throw Error("username already exists")
    }
  } catch (e) {
    return res.status(400).send(e.message)
  }

  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8))

  const { rows } = await pool.query(sql`
    INSERT INTO users(password, picture, username, name)
    VALUES(${passwordHash}, '', ${username}, ${name})
    RETURNING *
  `)

  const user = rows[0]

  res.status(200).send({ id: user.id })
})

// module: user/auth
app.post('/sign-in', async (req, res) => {
  const { username, password } = req.body

  const { rows } = await pool.query(sql`SELECT * FROM users WHERE username = ${username}`)
  const user = rows[0]

  if (!user) {
    return res.status(404).send('user not found')
  }

  const passwordsMatch = bcrypt.compareSync(password, user.password)

  if (!passwordsMatch) {
    return res.status(400).send('password is incorrect')
  }

  const authToken = jwt.sign(username, secret)

  res.cookie('authToken', authToken, { maxAge: expiration })
  res.status(200).send({ id: user.id })
})
