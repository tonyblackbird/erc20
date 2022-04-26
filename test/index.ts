import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("ERC20", () => {
  let erc20: Contract;
  let owner: SignerWithAddress, addr1: SignerWithAddress;

  // How to work with bignumbers better?
  const coinDecimals: BigNumber = BigNumber.from(18);
  const oneToken: BigNumber = BigNumber.from(10).pow(coinDecimals);
  const twoTokens:BigNumber = oneToken.mul(2);

  // Is it better to make contract deploy beforeEach
  // Or make the whole testing integrational (like I have)?
  it("Should deploy the contract", async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("Shitcoin", "STC", 18);
    await erc20.deployed();

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should console.log contract data", async () => {
    console.log(await erc20.name());
    console.log(await erc20.symbol());
    console.log(await erc20.decimals());
    console.log((await erc20.totalSupply()).toString());
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

  // How to handle these tests better?
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
  });
});
