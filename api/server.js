import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'https://neonfeed.vercel.app','*'],
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
        
        if (!tokenData.addressOwner || 
            tokenData.addressOwner === 'null' || 
            !tokenData.addressOwner.startsWith('0x') || 
            tokenData.addressOwner.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Valid Ethereum address is required'
            });
        }

        const command = `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage}" ` +
            `TOKEN_TWITTER="${tokenData.twitter}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +
            `HARDHAT_CONFIG=hardhat.config.cjs npx hardhat run scripts/deploy.cjs --network ancient8-celestia-testnet`;

        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
            timeout: 180000 // 3 minutes timeout
        });

        if (stderr) {
            console.warn("Deploy stderr:", stderr);
        }

        res.json({ 
            success: true, 
            message: 'Token deployed successfully',
            deploymentResult: stdout,
            logs: stderr
        });
    } catch (error) {
        console.error("Deployment error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deploying token',
            error: error.message,
            command: error.cmd
        });
    }
});

app.post('/verify-token', async (req, res) => {
    try {
        const tokenData = req.body;
        
        if (!tokenData.contractAddress || !tokenData.addressOwner) {
            return res.status(400).json({
                success: false,
                message: 'Contract address and owner address are required'
            });
        }

        const command = `CONTRACT_ADDRESS="${tokenData.contractAddress}" ` +
            `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage}" ` +
            `TOKEN_TWITTER="${tokenData.twitter}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +
            `HARDHAT_CONFIG=hardhat.config.cjs npx hardhat run scripts/verify.cjs --network ancient8-celestia-testnet`;

        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
            timeout: 180000 // 3 minutes timeout
        });

        if (stderr) {
            console.warn("Verify stderr:", stderr);
        }

        res.json({ 
            success: true, 
            message: 'Token verified successfully',
            verificationResult: stdout,
            logs: stderr
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying token',
            error: error.message,
            command: error.cmd
        });
    }
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app; 