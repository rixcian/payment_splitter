const hre = require("hardhat");

async function main() {
  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy();

  await paymentSplitter.deployed();

  console.log("PaymentSplitter deployed to:", paymentSplitter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
