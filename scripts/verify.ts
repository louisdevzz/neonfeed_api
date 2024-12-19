import { run } from "hardhat";

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const [
    contractAddress,
    name,
    symbol,
    tokenImage,
    twitter,
    facebook,
    telegram,
    initialSupply
  ] = args;

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
        initialSupply
      ],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 