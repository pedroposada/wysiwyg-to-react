import axios from 'axios'
import logger from './logger'
import { API_URL } from './constants'

const config = {
  baseURL: API_URL,
  timeout: 4000
}

const client = axios.create(config)

const api = async (options = {}) => {
  logger.debug('API REQUEST =>', { ...config, ...options })

  try {
    const resp = await client(options)

    logger.debug('API RESPONSE =>', resp)

    return resp
  } catch (error) {
    logger.error(error)

    throw error
  }
}

export default api
