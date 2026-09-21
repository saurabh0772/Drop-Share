import express from 'express'
import CONFIG from './config.js';
const app = express();

app.use(express.json());


app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        service: "API Gateway is running."
    })
})


app.listen(CONFIG.PORT, () => {
    console.log(`Api Gateway is running at port ${CONFIG.PORT}`);

})

