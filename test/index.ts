import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

describe("Farming contract", () => {
  let farming: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async () => {
    const Farming = await ethers.getContractFactory("STCFarming");
    farming = await Farming.deploy();
    await farming.deployed();

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should stake", async () => {

  });
});

/*
describe("ShitCoin", () => {
  let erc20: Contract;
  let owner: SignerWithAddress, addr1: SignerWithAddress;

  const oneToken: BigNumber = utils.parseUnits("1", 18);
  const twoTokens:BigNumber = oneToken.mul(2);

  // TODO: Deploy contract in beforeEach
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
  });
});
*/