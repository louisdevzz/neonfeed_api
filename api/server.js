import express from 'express';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import cors from 'cors';

config();

const app = express();

// Configure CORS with options
const corsOptions = {
  origin: ['http://localhost:3000', 'https://neonfeed.vercel.app','*'], // Add your frontend URLs
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/deploy-token', async (req, res) => {
    try {
        const tokenData = req.body;
        
        // Enhanced validation for addressOwner
        if (!tokenData.addressOwner || 
            tokenData.addressOwner === 'null' || 
            !tokenData.addressOwner.startsWith('0x') || 
            tokenData.addressOwner.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Valid Ethereum address is required for addressOwner (must start with 0x and be 42 characters long)'
            });
        }

        console.log("Token deployment data:", tokenData);
        
        // Add address validation before executing command
        if (tokenData.addressOwner === 'null') {
            throw new Error('Address owner cannot be null');
        }

        const result = execSync(
            `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage}" ` +
            `TOKEN_TWITTER="${tokenData.twitter}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +  // Make sure this is a valid address
            `HARDHAT_CONFIG=hardhat.config.cjs npx hardhat run scripts/deploy.cjs --network ancient8-celestia-testnet`,
            { encoding: 'utf-8' }
        );

        res.json({ 
            success: true, 
            message: 'Token deployed successfully to Ancient8 testnet',
            deploymentResult: result
        });
    } catch (error) {
        console.error("Deployment error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deploying token',
            error: error.message,
            details: 'Make sure addressOwner is a valid Ethereum address'
        });
    }
});

app.post('/verify-token', async (req, res) => {
    try {
        const tokenData = req.body;
        
        // Validate contract address
        if (!tokenData.contractAddress) {
            return res.status(400).json({
                success: false,
                message: 'Contract address is required for verification'
            });
        }

        // Add validation for addressOwner
        if (!tokenData.addressOwner || 
            tokenData.addressOwner === 'null' || 
            !tokenData.addressOwner.startsWith('0x') || 
            tokenData.addressOwner.length !== 42) {
            return res.status(400).json({
                success: false,
                message: 'Valid Ethereum address is required for addressOwner (must start with 0x and be 42 characters long)'
            });
        }

        console.log("Verification data:", tokenData);

        const result = execSync(
            `CONTRACT_ADDRESS="${tokenData.contractAddress}" ` +
            `TOKEN_NAME="${tokenData.name}" ` +
            `TOKEN_SYMBOL="${tokenData.symbol.toUpperCase()}" ` +
            `TOKEN_IMAGE="${tokenData.tokenImage}" ` +
            `TOKEN_TWITTER="${tokenData.twitter}" ` +
            `TOKEN_FACEBOOK="${tokenData.facebook}" ` +
            `TOKEN_TELEGRAM="${tokenData.telegram}" ` +
            `TOKEN_SUPPLY="${tokenData.initialSupply}" ` +
            `ADDRESS_OWNER="${tokenData.addressOwner}" ` +
            `HARDHAT_CONFIG=hardhat.config.cjs npx hardhat run scripts/verify.cjs --network ancient8-celestia-testnet`,
            { encoding: 'utf-8' }
        );

        res.json({ 
            success: true, 
            message: 'Token verified successfully on Ancient8 testnet',
            verificationResult: result
        });
    } catch (error) {
        console.error("Verification error:", error);
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

// This is important for Vercel
export default app; 