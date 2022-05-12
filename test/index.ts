import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber, Contract, providers, ContractFactory, utils } from "ethers";
import { ethers, network  } from "hardhat";
import {} from "@nomiclabs/hardhat-ethers";
import { parseEther } from "ethers/lib/utils";
import { WETH } from "../typechain";

describe("Farming contract", () => {
  let Farming: ContractFactory;
  let farming: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  const lpHolderAddress = "0x1108996f4A5048dFEf3352a5aE56a6467a283F1B";
  let lpHolder: providers.JsonRpcSigner;
  let lpToken: Contract;

  const shitCoinAdminAddr = "0x1108996f4A5048dFEf3352a5aE56a6467a283F1B";
  let shitCoinAdmin: providers.JsonRpcSigner;
  let shitCoin: Contract;

  let WETH: ContractFactory;
  let weth: Contract;


  const grantAdmin = async (to: string) => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [shitCoinAdminAddr],
    });

    await network.provider.send("hardhat_setBalance", [
      shitCoinAdminAddr,
      "0xffffffffffffffffff"
    ]);

    shitCoinAdmin = ethers.provider.getSigner(shitCoinAdminAddr);
    shitCoin = await ethers.getContractAt("ShitCoin", "0x8DbD9197e9e7eD7d9DB44a2976C2254173bB0cd3");

    await shitCoin.connect(shitCoinAdmin).grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", to);
    
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [shitCoinAdminAddr],
    });
  }  

  const sendLpTokens = async (to: string, amount: BigNumber) => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [lpHolderAddress],
    });

    await network.provider.send("hardhat_setBalance", [
      lpHolderAddress,
      "0xffffffffffffffffff"
    ]);

    lpHolder = ethers.provider.getSigner(lpHolderAddress);
    lpToken = await ethers.getContractAt("IERC20", "0x8BAe696C6D18BC0532C49856fFC313e1e60DE97a");

    await lpToken.connect(lpHolder).transfer(to, amount);
    
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [lpHolderAddress],
    });
  }  


  before(async () => {
    [owner, addr1] = await ethers.getSigners();

    Farming = await ethers.getContractFactory("STCFarming");
    WETH = await ethers.getContractFactory("WETH");
  });

  beforeEach(async () => {
    farming = await Farming.deploy();
    await farming.deployed();

    weth = await WETH.deploy();
    await weth.deployed();
  });

  describe("Should pass these tests", () => {
    it("Should deposit and widthdraw WETH", async () => {
      await weth.Deposit({
        value: parseEther("0.1")
      });
      expect(await weth.balanceOf(owner.address)).to.equal(parseEther("0.1"));

      await weth.Widthdraw(parseEther("0.1"));
      expect(await weth.balanceOf(owner.address)).to.equal("0");
    });

    it("Should stake and get staking userInfo", async () => {
      await sendLpTokens(owner.address, parseEther("1"));

      await lpToken.approve(farming.address, parseEther("1"));
      await farming.stake(parseEther("1"));

      expect(await lpToken.balanceOf(farming.address)).to.equal(parseEther("1"));

      const userInfo = await farming.getUserInfo(owner.address);
      expect(userInfo[0]).to.equal(BigNumber.from("0x0de0b6b3a7640000")); //parseEther("1")
      expect(userInfo[2]).to.equal(BigNumber.from("0"));
    });

    it("Should stake and calculate rewards", async () => {
      await sendLpTokens(owner.address, parseEther("1"));

      await lpToken.approve(farming.address, parseEther("1"));
      await farming.stake(parseEther("1"));

      const week = 7 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [52 * week]);
      await ethers.provider.send('evm_mine', []);

      const rewards = await farming.calculateRewards(owner.address);
      expect(rewards).to.be.equal("200000000000000000");
    });

    it("Should claim rewards", async () => {
      await grantAdmin(farming.address);
      await sendLpTokens(owner.address, parseEther("1"));

      await lpToken.approve(farming.address, parseEther("1"));
      await farming.stake(parseEther("1"));

      const balBefore = BigNumber.from(await lpToken.balanceOf(owner.address));
      await farming.claim();
      const balAfter = BigNumber.from(await lpToken.balanceOf(owner.address));
      expect(balAfter.sub(balBefore).toString()).to.equal(parseEther("0"));
    });

    it("Should stake twice", async () => {
      await grantAdmin(farming.address);
      await sendLpTokens(owner.address, parseEther("1"));

      await lpToken.approve(farming.address, parseEther("1"));
      await farming.stake(parseEther("0.5"));
      await farming.stake(parseEther("0.5"));
    });

    it("Should widthdraw LP tokens", async () => {
      await grantAdmin(farming.address);
      await sendLpTokens(owner.address, parseEther("1"));

      await lpToken.approve(farming.address, parseEther("1"));
      await farming.stake(parseEther("1"));

      const balBefore = BigNumber.from(await lpToken.balanceOf(owner.address));
      await farming.withdraw(parseEther("1"));
      const balAfter = BigNumber.from(await lpToken.balanceOf(owner.address));
      expect(balAfter.sub(balBefore).toString()).to.equal(parseEther("1"));
    });
  });


  describe("Should fail these tests", async () => {
    it("Shouldn't widthdraw WETH", async () => {
      await weth.Deposit({
        value: parseEther("0.1")
      });
      expect(await weth.balanceOf(owner.address)).to.equal(parseEther("0.1"));

      expect(weth.Widthdraw(parseEther("69")))
        .to.be.revertedWith("Not enough WETH to widthdraw");
    });

    it("Shouldn't claim rewards", async () => {      
      expect(farming.claim()).to.be.revertedWith("You have not deposited yet");
    });

    it("Shouldn't withdraw", async () => {
      await grantAdmin(farming.address);
      await sendLpTokens(owner.address, parseEther("0.1"));

      await lpToken.approve(farming.address, parseEther("0.1"));
      await farming.stake(parseEther("0.1"));

      expect(farming.withdraw(parseEther("69")))
        .to.be.revertedWith("Insufficient deposit");
    });

    it("Shouldn't calculateRewards", async () => {      
      expect(farming.calculateRewards(owner.address))
        .to.be.revertedWith("The user hasn't deposited");
    });
  });
});


describe("ShitCoin", () => {
  let erc20: Contract;
  let owner: SignerWithAddress, addr1: SignerWithAddress;

  const oneToken: BigNumber = utils.parseUnits("1", 18);
  const twoTokens:BigNumber = oneToken.mul(2);

  describe("Passing tests", () => {
    it("Should deploy the contract", async () => {
      const ERC20 = await ethers.getContractFactory("ShitCoin");
      erc20 = await ERC20.deploy();
      await erc20.deployed();

      [owner, addr1] = await ethers.getSigners();
    });

    it("Should check contract data", async () => {
      expect(await erc20.name()).to.equal("ShitCoin");
      expect(await erc20.symbol()).to.equal("STC");
      expect(await erc20.decimals()).to.equal(18);
      expect(await erc20.totalSupply()).to.equal(0);
    });  

    it("Should mint 2 ERC20 tokens", async () => {
      await erc20.mint(owner.address, twoTokens);

      const totalSupply = (await erc20.totalSupply()).toString();
      expect(totalSupply).to.equal(twoTokens.toString());
    });

    it("Should burn 1 ERC20 token", async () => {
      await erc20.burn(owner.address, oneToken);

      const totalSupply = (await erc20.totalSupply()).toString();
      expect(totalSupply).to.equal(oneToken);
    });

    it("Should transfer 1 ERC20 token", async () => {
      const balanceBefore = (await erc20.balanceOf(addr1.address));

      await erc20.transfer(addr1.address, oneToken);

      const balanceAfter = (await erc20.balanceOf(addr1.address));
      expect((balanceAfter - balanceBefore).toString()).to.equal(oneToken.toString());
    });

    it("Should approve 1 ERC20 token", async () => {
      await erc20.connect(addr1).approve(owner.address, oneToken);

      expect(await erc20.allowance(addr1.address, owner.address)).to.equal(oneToken);
    });

    it("Should send 1 ERC20 token from addr1 to owner", async () => {
      await erc20.transferFrom(addr1.address, owner.address, oneToken)

      expect(await erc20.allowance(addr1.address, owner.address)).to.equal(0);
    });
  });

  describe("Failing tests", () => {
    it("Should fail to .mint 2 ERC20 tokens (not owner)", async () => {
      await expect(
        erc20.connect(addr1).mint(owner.address, twoTokens)
      ).to.be.revertedWith("You're not an owner");
    });

    it("Should fail to .transfer 69 ERC20 tokens (insufficient balance)", async () => {
      await expect(
        erc20.transfer(owner.address, oneToken.mul(69))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail to .transferFrom 69 ERC20 tokens (insufficient balance)", async () => {
      await erc20.mint(owner.address, twoTokens);

      await expect(
        erc20.transferFrom(owner.address, addr1.address, oneToken.mul(69))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail to .transferFrom 2 ERC20 tokens (insufficient allowance)", async () => {
      await erc20.mint(owner.address, twoTokens);

      await expect(
        erc20.transferFrom(owner.address, addr1.address, twoTokens)
      ).to.be.revertedWith("Insufficient allowance");
    });

    it("Should fail to .burn 69 ERC20 tokens (insufficient balance)", async () => {
      await expect(
        erc20.burn(owner.address, oneToken.mul(69))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail to .burn 69 ERC20 tokens (insufficient balance)", async () => {
      await expect(
        erc20.connect(addr1).burn(owner.address, oneToken.mul(69))
      ).to.be.revertedWith("You're not an owner");
    });
  });
});