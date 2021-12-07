async function main() {
  if (network.name === "rinkeby") {
    console.warn(
      "You are trying to deploy a contract to the Rinkeby Network"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.deployed();

  console.log("Lottery address:", lottery.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
