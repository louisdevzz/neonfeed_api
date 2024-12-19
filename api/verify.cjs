const { run } = require("hardhat");

async function main() {
  // Get values from environment variables instead of command line arguments
  const {
    CONTRACT_ADDRESS: contractAddress,
    TOKEN_NAME: name,
    TOKEN_SYMBOL: symbol,
    TOKEN_IMAGE: tokenImage,
    TOKEN_TWITTER: twitter,
    TOKEN_FACEBOOK: facebook,
    TOKEN_TELEGRAM: telegram,
    TOKEN_SUPPLY: initialSupply,
    ADDRESS_OWNER: addressOwner
  } = process.env;

  // Add validation and logging
  console.log("Verification parameters:", {
    contractAddress,
    name,
    symbol,
    tokenImage,
    twitter,
    facebook,
    telegram,
    initialSupply,
    addressOwner
  });

  if (!addressOwner || addressOwner === 'null') {
    throw new Error('ADDRESS_OWNER environment variable is required and must be a valid address');
  }

  console.log("Verifying contract on Ancient8 Explorer...");
  console.log("Contract address:", contractAddress);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        name,
        symbol,
        tokenImage,
        twitter,
        facebook,
        telegram,
        initialSupply,
        addressOwner
      ],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 