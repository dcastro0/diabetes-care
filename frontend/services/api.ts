import { API_URL } from "@/constants/api"
import axios from "axios"

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

