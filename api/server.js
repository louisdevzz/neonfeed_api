import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { deployToken } from './deployToken.js';

config();

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'https://neonfeed.vercel.app', '*'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/deploy-token', async (req, res) => {
    try {
        const tokenData = req.body;
        
        // Validate required fields
        if (!tokenData || !tokenData.name || !tokenData.symbol || !tokenData.addressOwner) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, symbol, or addressOwner'
            });
        }

        // Validate address format
        if (!tokenData.addressOwner.startsWith('0x') || tokenData.addressOwner.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Ethereum address format'
            });
        }

        const result = await deployToken(tokenData);
        res.json(result);
    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deploying token',
            error: error.message,
            details: error.stack
        });
    }
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app; 