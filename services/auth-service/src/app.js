import express from 'express'
import CONFIG from './config.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        service: "auth-service"
    })
})


app.listen(CONFIG.PORT, () => {
    console.log(`Auth service is running at port ${CONFIG.PORT}`);

})