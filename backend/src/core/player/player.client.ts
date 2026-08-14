import axios from "axios"
const archiveClient = axios.create({
    baseURL: "https://archive.org",
    timeout: 8000,
});
export {archiveClient}