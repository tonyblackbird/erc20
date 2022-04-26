import { expect } from "chai";
import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

describe("ERC20", function () {
  let erc20: Contract;

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ScamCoin");
    erc20 = await ERC20.deploy();
    await erc20.deployed();
  });

  it("Mint 1 ERC20 token", async function () {
    const coinDecimals = await erc20.decimals();
    const mintTokensTx = await erc20._mint(erc20.address, parseEther((1 * 10**coinDecimals).toString()));

    await mintTokensTx.wait();

    //expect(await scamCoin.totalSupply()).to.equal("Hola, mundo!");
  });
});
