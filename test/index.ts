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

  it("Mint 2 ERC20 tokens", async () => {
    await erc20.mint(twoTokens, owner.address);

    const totalSupply = (await erc20.totalSupply()).toString();
    expect(totalSupply).to.equal(twoTokens.toString());
  });

  it("Burn 1 ERC20 token", async () => {
    await erc20.burn(oneToken);

    const totalSupply = (await erc20.totalSupply()).toString();
    expect(totalSupply).to.equal(oneToken);
  });

  it("Transfer 1 ERC20 token", async () => {
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
