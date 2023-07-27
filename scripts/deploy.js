// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function sleep(ms){
  return new Promise((resolve)=>setTimeout(resolve,ms));
}
async function main(){
  //Deploy the NFT Contract
  const nftContract = await
  hre.ethers.deployContract("CryptoDevsNFT");
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to:",nftContract.target);

  //Deploy the Fake marketplace Contract
  const fakeNftMarketplaceContract = await
  hre.ethers.deployContract(
    "FakeNFTMarketplace"
  );
  await fakeNftMarketplaceContract.waitForDeployment();
  console.log(
    "FakeNFTMarketplace deployed to:",
    fakeNftMarketplaceContract.target

  );
  //Deploy the DAO Contract
  const amount = hre.ethers.parseEther("1");
  const daoContract =await
  hre.ethers.deployContract("CryptoDevsDAO",[
    fakeNftMarketplaceContract.target,
    nftContract.target,
  ],{value:amount,});
  await daoContract.waitForDeployment();
  console.log("CryptoDevsDAO deployed to:",daoContract.target);

  //Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(30*1000);
  //Verify the NFT Contract
  await hre,run("verify:verify",{
    address:nftContract.target,
    constructorArguments:[],
  });
  //Verify the Fake Marketplace Contract
  await hre.run("verify:verify",{
    address:fakeNftMarketplaceContract.target,
    constructorArguments:[],
  });
  //Verify the DAO Contract
  await hre.run("verify:verify",{
    address:daoContract.target,
    constructorArguments:[
      fakeNftMarketplaceContract.target,
      nftContract.target,
    ],
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
