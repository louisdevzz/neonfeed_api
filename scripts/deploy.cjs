const hre = require("hardhat");

async function main() {
  const name = process.env.TOKEN_NAME || "";
  const symbol = process.env.TOKEN_SYMBOL || "";
  const tokenImage = process.env.TOKEN_IMAGE || "";
  const twitter = process.env.TOKEN_TWITTER || "";
  const facebook = process.env.TOKEN_FACEBOOK || "";
  const telegram = process.env.TOKEN_TELEGRAM || "";
  const initialSupply = process.env.TOKEN_SUPPLY || "0";
  const addressOwner = process.env.ADDRESS_OWNER || "";

  if (!hre.ethers.isAddress(addressOwner)) {
    throw new Error("Invalid address owner");
  }

  console.log("Deploying token with parameters:", {
    name, symbol, tokenImage, twitter, facebook, telegram, initialSupply, addressOwner
  });

  const Contract = await hre.ethers.getContractFactory("ContractERC20");
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
  console.log(`Token deployed to ${await token.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 