import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'https://neonfeed.vercel.app','*'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Helper function to run scripts
const runScript = async (scriptPath, env) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('node', [scriptPath], {
      env: { 
        ...process.env, 
        ...env,
      },
      cwd: path.resolve(__dirname)
    });

    let output = '';
    let error = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString()); // Log output in real-time
    });

    childProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(data.toString()); // Log errors in real-time
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Process exited with code ${code}`);
        reject(new Error(`Script exited with code ${code}\n${error}`));
      } else {
        resolve({ output, error });
      }
    });

    childProcess.on('error', (err) => {
      console.error('Failed to start subprocess:', err);
      reject(err);
    });
  });
};

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

        const scriptEnv = {
            TOKEN_NAME: tokenData.name,
            TOKEN_SYMBOL: tokenData.symbol.toUpperCase(),
            TOKEN_IMAGE: tokenData.tokenImage,
            TOKEN_TWITTER: tokenData.twitter,
            TOKEN_FACEBOOK: tokenData.facebook,
            TOKEN_TELEGRAM: tokenData.telegram,
            TOKEN_SUPPLY: tokenData.initialSupply,
            ADDRESS_OWNER: tokenData.addressOwner,
            HARDHAT_CONFIG: '../hardhat.config.cjs'
        };

        const { output, error } = await runScript('./deploy.cjs', scriptEnv);

        res.json({ 
            success: true, 
            message: 'Token deployed successfully',
            deploymentResult: output,
            logs: error
        });
    } catch (error) {
        console.error("Deployment error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deploying token',
            error: error.message
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

        const scriptEnv = {
            CONTRACT_ADDRESS: tokenData.contractAddress,
            TOKEN_NAME: tokenData.name,
            TOKEN_SYMBOL: tokenData.symbol.toUpperCase(),
            TOKEN_IMAGE: tokenData.tokenImage,
            TOKEN_TWITTER: tokenData.twitter,
            TOKEN_FACEBOOK: tokenData.facebook,
            TOKEN_TELEGRAM: tokenData.telegram,
            TOKEN_SUPPLY: tokenData.initialSupply,
            ADDRESS_OWNER: tokenData.addressOwner,
            HARDHAT_CONFIG: 'hardhat.config.cjs'
        };

        const { output, error } = await runScript('./scripts/verify.cjs', scriptEnv);

        res.json({ 
            success: true, 
            message: 'Token verified successfully',
            verificationResult: output,
            logs: error
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying token',
            error: error.message
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