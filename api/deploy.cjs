require('dotenv').config();
const hardhat = require("hardhat");

async function main() {
  try {
    const name = process.env.TOKEN_NAME || "";
    const symbol = process.env.TOKEN_SYMBOL || "";
    const tokenImage = process.env.TOKEN_IMAGE || "";
    const twitter = process.env.TOKEN_TWITTER || "";
    const facebook = process.env.TOKEN_FACEBOOK || "";
    const telegram = process.env.TOKEN_TELEGRAM || "";
    const initialSupply = process.env.TOKEN_SUPPLY || "0";
    const addressOwner = process.env.ADDRESS_OWNER || "";

    console.log("Starting deployment with parameters:", {
      name, symbol, tokenImage, initialSupply, addressOwner
    });

    if (!hardhat.ethers.isAddress(addressOwner)) {
      throw new Error("Invalid address owner");
    }

    const Contract = await hardhat.ethers.getContractFactory("ContractERC20");
    const token = await Contract.deploy(
      name,
      symbol,
      tokenImage,
      twitter,
      facebook,
      telegram,
      initialSupply,
      addressOwner
    );

    await token.waitForDeployment();
    const address = await token.getAddress();
    console.log(`Token deployed to ${address}`);
    return address;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 