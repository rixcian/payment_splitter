const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentSplitter", function () {
  it("Should split the amount to recipients", async function () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
    const paymentSplitter = await PaymentSplitter.deploy();

    await paymentSplitter.deployed();

    let ownerBalance = await owner.getBalance();
    let receiver1 = await addr1.getBalance();
    let receiver2 = await addr2.getBalance();
    let receiver3 = await addr3.getBalance();

    console.log();
    console.log('Balance of owner: ', ethers.utils.formatEther(ownerBalance));
    console.log('Balance of 1st receiver: ', ethers.utils.formatEther(receiver1));
    console.log('Balance of 2nd receiver: ', ethers.utils.formatEther(receiver2));
    console.log('Balance of 3rd receiver: ', ethers.utils.formatEther(receiver3));
    console.log();

    console.log('Sending 10ETH...');
    let tx = await paymentSplitter.splitPayment(
      [addr1.address, addr2.address, addr3.address],
      [33, 33, 34],
      {value: ethers.utils.parseEther("10")}
    );

    let finishedTx = await tx.wait();

    console.log();
    console.log('Gas Used: ', finishedTx.gasUsed.toString());
    console.log();

    ownerBalance = await owner.getBalance();
    receiver1 = await addr1.getBalance();
    receiver2 = await addr2.getBalance();
    receiver3 = await addr3.getBalance();

    console.log();
    console.log('Balance of owner: ', ethers.utils.formatEther(ownerBalance));
    console.log('Balance of 1st receiver: ', ethers.utils.formatEther(receiver1));
    console.log('Balance of 2nd receiver: ', ethers.utils.formatEther(receiver2));
    console.log('Balance of 3rd receiver: ', ethers.utils.formatEther(receiver3));
    console.log();

    expect(paymentSplitter.address).to.not.be.null;
  });
});
