import request from "@/api/request.js";
import axios from "axios";

export const getCpuInfo = () => {
    return request.get('/getCpuInfo')
}

export const getGpuInfo = () => {
    return request.get('/getGpuInfo')
}

export const getMemoryInfo = () => {
    return request.get('/getMemoryInfo')
}

export const getCpuTemp = () => {
    return axios.get('/systemInfo/data.json')
}