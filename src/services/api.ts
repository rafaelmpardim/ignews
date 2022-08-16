import axios from '../../node_modules/axios/index'

export const api = axios.create({
  baseURL: '/api'
})