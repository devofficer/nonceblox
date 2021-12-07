
const { expect } = require("chai");
var BigNumber = require('big-number');

describe("Lottery contract", function () {

  let Lottery;
  let hardhatLottery;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Lottery = await ethers.getContractFactory("Loterry");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatLottery = await Lottery.deploy();
    await hardhatLottery.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatLottery.owner()).to.equal(owner.address);
    });
  });

  describe("User actions", function () {
    it("Should be reverted when trying to join before the period", async function () {
      await expect(
        hardhatLottery.connect(addr1).join()
      ).to.be.revertedWith("Lottery is not started yet");
    });

    it("Should transfer exactly 0.1 Eth to Loterry contract when joining", async function () {
      await hardhatLottery.connect(owner).startLottery();
      const prior_balance = BigNumber(addr1.balance);
      await hardhatLottery.connect(addr1).join();
      expect(BigNumber(addr1.balance) - prior_balance).to.equal(BigNumber(100000000000000000));
    });

    it("Should be reverted when trying to start lottery from non-owner address", async function () {
      await expect(
        hardhatLottery.connect(addr1).startLottery()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    })
  });

  describe("Owner actions", function () {
    it("Should change the set lottery status as true after start", async function () {
      expect(hardhatLottery.lotteryStarted()).to.be.false;
      await hardhatLottery.connect(owner).startLottery();
      expect(hardhatLottery.lotteryStarted()).to.be.true;
    });

    it("Should be reverted when trying start lottery again", async function () {
      await(
        hardhatLottery.connect(owner).startLottery()
      ).to.be.revertedWith("Lottery is already started");
    });

    it("Should be reverted when trying to pick before period", async function () {
      await expect(
        hardhatLottery.connect(owner).pickWinner()
      ).to.be.revertedWith("Lottery is still ongoing");
    });

    it("Should return random id within the range of users", async function () {
      await hardhatLottery.connect(owner).join();
      await hardhatLottery.connect(addr1).join();
      await hardhatLottery.connect(addr2).join();
      await hardhatLottery.connect(addrs).join();
      await hre.network.provider.request({
        method: "evm_increaseTime",
        params:["3600"]
      });
      await hardhatLottery.connect(owner).pickWinner();
      const result = await hardhatLottery.randomResult();
      const bound = await hardhatLottery.users().length;
      expect(result).to.be.above(0);
      expect(result).to.be.most(bound);
    });
  });
});
