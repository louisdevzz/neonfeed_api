import pkg from 'hardhat';
const { ethers } = pkg;

export async function deployToken(tokenData) {
    try {
        // Get the Token contract factory
        const Token = await ethers.getContractFactory("Token");
        
        // Deploy the contract with the provided parameters
        const token = await Token.deploy(
            tokenData.name,
            tokenData.symbol,
            tokenData.addressOwner
        );

        // Wait for deployment to complete
        await token.deployed();

        return {
            success: true,
            message: 'Token deployed successfully',
            contractAddress: token.address,
            tokenData: {
                name: tokenData.name,
                symbol: tokenData.symbol,
                owner: tokenData.addressOwner
            }
        };
    } catch (error) {
        throw new Error(`Token deployment failed: ${error.message}`);
    }
} 