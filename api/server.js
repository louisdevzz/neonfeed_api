import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        const command = `cd ${path.resolve(__dirname, '..')} && ` +
            `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage || ''}" ` +
            `TOKEN_TWITTER="${tokenData.twitter || ''}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook || ''}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram || ''}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply || '100000000'}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +
            `npx hardhat run scripts/deploy.cjs --network ancient8-celestia-testnet`;

        console.log('Executing command:', command);

        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        if (stderr) {
            console.warn('Deploy stderr:', stderr);
        }

        // Look for the contract address in the output
        const addressMatch = stdout.match(/Token deployed to (0x[a-fA-F0-9]{40})/);
        const contractAddress = addressMatch ? addressMatch[1] : null;

        res.json({
            success: true,
            message: 'Token deployed successfully',
            contractAddress,
            output: stdout,
            logs: stderr
        });
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

app.post('/verify-token', async (req, res) => {
    try {
        const tokenData = req.body;
        
        // Validate required fields
        if (!tokenData || !tokenData.contractAddress || !tokenData.name || !tokenData.symbol || !tokenData.addressOwner) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: contractAddress, name, symbol, or addressOwner'
            });
        }

        // Validate contract address format
        if (!tokenData.contractAddress.startsWith('0x') || tokenData.contractAddress.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contract address format'
            });
        }

        // Validate owner address format
        if (!tokenData.addressOwner.startsWith('0x') || tokenData.addressOwner.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Invalid owner address format'
            });
        }

        const command = `cd ${path.resolve(__dirname, '..')} && ` +
            `CONTRACT_ADDRESS="${tokenData.contractAddress}" ` +
            `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage || ''}" ` +
            `TOKEN_TWITTER="${tokenData.twitter || ''}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook || ''}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram || ''}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply || '100000000'}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +
            `npx hardhat run scripts/verify.cjs --network ancient8-celestia-testnet`;

        console.log('Executing verification command:', command);

        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        if (stderr) {
            console.warn('Verify stderr:', stderr);
        }

        // Look for verification success message
        const isVerified = stdout.includes('Successfully verified') || 
                          stdout.includes('Already verified');

        res.json({
            success: true,
            message: isVerified ? 'Token verified successfully' : 'Verification process completed',
            verified: isVerified,
            output: stdout,
            logs: stderr
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying token',
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