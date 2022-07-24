const { ethers } = require("hardhat");

function makeERC721CallData(name, symbol) {
  let ABI = [
    "function setUp(string memory _name, string memory _symbol)"
  ];
  
  let interface = new ethers.utils.Interface(ABI);

  return interface.encodeFunctionData("setUp", [name, symbol]);
}

module.exports = {
  makeERC721CallData
}