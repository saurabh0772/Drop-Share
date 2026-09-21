import dotenv from 'dotenv'
dotenv.config();

const CONFIG = {
    PORT: process.env.PORT || 5002
}

export default CONFIG;