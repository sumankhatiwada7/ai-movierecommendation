import "dotenv/config";
import env from "dotenv"
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authroute from '././src/module/auth/auth.route'
import movieroute from '././src/module/movie/movie.route'
import watchroute from '././src/module/watch/watch.route'
import recommendationroute from '././src/module/recommendation/recommendation.route'
env.config();
const app = express();
const port = Number(process.env.PORT ?? process.env.port ?? 3000);
const clientUrl = process.env.CLIENT_URL ?? process.env.client_url;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: clientUrl,
    credentials: true,
}))

app.get('/', (req, res) => {
    res.send('Backend is running!');
});
app.use("/api/v1/auth",authroute);
app.use("/api/v1/movies",movieroute);
app.use("/api/v1/watch",watchroute);
app.use("/api/v1/recommendations",recommendationroute);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});


async function startserver() {
    try {
        app.listen(port, async () => {
            console.log(`Server is running on port ${port}`);
        })
    } catch (error) {
        console.error("Error starting the server:", error);
    }
}

startserver();