import { ethers } from 'hardhat';

export async function deployToken(tokenData) {
    try {
        const Contract = await ethers.getContractFactory("ContractERC20");
        const token = await Contract.deploy(
            tokenData.name,
            tokenData.symbol.toUpperCase(),
            tokenData.tokenImage || '',
            tokenData.twitter || '',
            tokenData.facebook || '',
            tokenData.telegram || '',
            tokenData.initialSupply || '100000000',
            tokenData.addressOwner
        );

        await token.waitForDeployment();
        const address = await token.getAddress();
        
        return {
            success: true,
            contractAddress: address,
            message: `Token deployed to ${address}`
        };
    } catch (error) {
        console.error('Deployment error:', error);
        throw error;
    }
} 