/* eslint-disable no-unused-vars */
/* eslint-disable quotes */

const { expect } = require('chai');

///////////////HOSHINI///CONTRACT////TOKEN////////////////

describe("HoshiNi contract token", () => {
  const TOTAL_SUPPLY = ethers.utils.parseEther('10000000000')
  let HoshiNi, hoshiNi, owner;

  beforeEach(async function () {
    [owner, alice, HoshiNi, hoshiNi] = await ethers.getSigners();
    HoshiNi = await ethers.getContractFactory('HoshiNi');
    hoshiNi = await HoshiNi.connect(owner).deploy(owner.address, TOTAL_SUPPLY);
    await hoshiNi.deployed();
  });

  describe('Deployment hoshiNi token', function () {
    it("should make msg.sender the owner of this contract", async function () {
      expect(await hoshiNi.connect(owner).owner()).to.equal(owner.address)
    });

    it('should have a total supply of 10 000 000 000 of HON tokens', async function () {
      expect(await hoshiNi.totalSupply()).to.equal(ethers.utils.parseEther('10000000000'))
    });

    it('should mint 10 000 000 000 tokens for the owner of the contract', async function () {
      const HoshiNiS = await ethers.getContractFactory('HoshiNi');
      hoshiNi = await HoshiNiS.connect(owner).deploy(owner.address, TOTAL_SUPPLY);
      await hoshiNi.deployed();
      expect(await hoshiNi.balanceOf(owner.address)).to.equal(ethers.utils.parseEther('10000000000'))
    });

    it("should have name of HoshiNi ", async function () {
      expect(await hoshiNi.name()).to.equal("HoshiNi")
    });

    it("should have symbol HON of HoshiNi", async function () {
      expect(await hoshiNi.symbol()).to.equal("HON")
    });
  });
});

////////////////////ICO/////HOSHINI////////////////////////

describe('ICOHoshiNi testing', () => {
  const TOTAL_SUPPLY = ethers.utils.parseEther('10000000000')
    let HoshiNi, hoshiNi, ICO, ico, owner, alice, bob, charlie;

    beforeEach(async function () {
    [HoshiNi, hoshiNi, ICO, ico, owner, alice, bob, charlie] = await ethers.getSigners();

    HoshiNi = await ethers.getContractFactory('HoshiNi');
    hoshiNi = await HoshiNi.connect(owner).deploy(owner.address, TOTAL_SUPPLY);
    await hoshiNi.deployed();

    ICO = await ethers.getContractFactory('IcoHoshiNi');
    ico = await ICO.connect(owner).deploy(hoshiNi.address);
    await ico.deployed();
    await hoshiNi.connect(owner).approve(ico.address, ethers.utils.parseEther('10000000000'));
    ico.connect(owner).startIco(ethers.utils.parseEther('10000000000'))
    });

    describe('Deployment ICO HoshiNi', function () {

      it("Should has start counting time until the end of the ICO", async function () {
        expect(await ico.secondeRemaining()).to.equal(1209600);
        await ethers.provider.send('evm_increaseTime', [10]);
        await ethers.provider.send('evm_mine');
        expect(await ico.secondeRemaining()).to.equal(1209590);
      });

      it("Should rate equal 1e9", async function () {
        expect(await ico.connect(owner).rate()).to.equal(1e9);
      });
    });

    describe('function startIco', function () {
      it("Should revert if its not deployed by the owner of hoshiNi", async function () {
        await expect(ico.connect(alice).startIco(500)).to.revertedWith("Ownable: caller is not the owner")
      });

      it("Should get timer is on", async function () {
        await ethers.provider.send('evm_increaseTime', [9600]);
        await ethers.provider.send('evm_mine');
        expect (await ico.secondeRemaining()).to.equal(1200000)
      });

    });

    describe('functions receive and  buyTokens', function () {

      it("Should emit event 'Sold'", async function () {
        await expect(alice.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address}))
          .to.emit(ico, 'Sold')
          .withArgs(alice.address, (await ethers.utils.parseEther('100000000')));
      });
    });

    describe('function withdrawAll', function () {
      it("Should revert if its not called by owner", async function () {
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(alice).withdrawAll()).to.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if balance is empty", async function () {
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdrawAll()).to.revertedWith("ICO: cannot withdraw 0 ether");
      });

      it("Should emit event 'Withdrew'", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await bob.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdrawAll())
          .to.emit(ico, "Withdrew")
          .withArgs(ico.address, (await ethers.utils.parseEther('0.315')));
      });
    });

    describe('function totalSupply', function () {
      it("Should display the total supply of HoshiNi", async function () {
        expect (await ico.totalSupply()).to.equal(ethers.utils.parseEther('10000000000'))
      });
    });

    describe('function tokenPrice', function () {
      it("Should display the price of HoshiNi", async function () {
        expect (await ico.tokenPrice()).to.equal(await ethers.utils.parseEther('0.000000001'))
      });
    });

    describe('function supplyICO', function () {
      it("Should see amount of token remaining", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        expect (await ico.supplyICO()).to.equal(ethers.utils.parseEther('9800000000'))
      });                                                                                     
    });

    describe('function tokenSold', function () {
      it("Should see the total of token solded", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await charlie.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        expect(await ico.connect(owner).tokenSold()).to.equal((await ethers.utils.parseEther('0.315').mul(await ico.rate())));
      });
    });

    describe('function balanceOf', function () {
      it("Should see token amount of the account sender", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        expect (await ico.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('200000000'))
      });                                                                                     
    });

    describe('function rate', function () {
      it("Should convert token between HoshiNi and ETH is equal to 1e9.", async function () {
        expect (await ico.rate()).to.equal(1e9)
      });                                                                                     
    });

});

///////////////////CALCULATOR///////////////SORRY//THEY//DO//NOT//PASTED////////////

describe("Calculator", () => {
  let HoshiNi, hoshiNi, ico, CALCULATOR, calculator, owner, alice, bob, charlie;
  
  beforeEach(async function () {
  [HoshiNi, hoshiNi, ico, CALCULATOR, calculator, owner, alice, bob, charlie] = await ethers.getSigners();

  HoshiNi = await ethers.getContractFactory('HoshiNi');
  hoshiNi = await HoshiNi.connect(owner).deploy(owner.address, '500000000');
  await hoshiNi.deployed();

  await hoshiNi.connect(owner).approve(ico.address, ethers.utils.parseEther('500000000'));
  await hoshiNi.connect(owner).transfer(alice.address, 20)
  await hoshiNi.connect(owner).transfer(bob.address, 20)
  
  CALCULATOR = await ethers.getContractFactory('Calculator');
  calculator = await CALCULATOR.connect(owner).deploy(hoshiNi.address);
  await calculator.deployed();
  await hoshiNi.connect(alice).approve(calculator.address, ethers.utils.parseEther('500000000'));
  await hoshiNi.connect(bob).approve(calculator.address, ethers.utils.parseEther('500000000'));
  });
  
  describe('Deployment calculator', function () {
    it("should make msg.sender the owner of this contract", async function () {
      expect(await calculator.owner()).to.equal(owner.address)
    });
  });

  describe('function add()', function () {
    it("should revert if the sender do not have HoshiNi", async function () {
      await hoshiNi.connect(charlie).HasAppproved(calculator.address, ethers.utils.parseEther('500000000'));
      await expect(calculator.connect(charlie.add(1, 2)).to.revertedWith("Calculator: not enought HoshiNi money"))
    });
  
  it("should revert if the sender has not approved calculator", async function () {
    await hoshiNi.connect(owner).transfer(charlie.address, 20)
    await expect(calculator.connect(charlie).add(1,2)).to.revertedWith("Calculator: approve this contract in first")
  });

  it("should emit event with result", async function () {
    await expect(calculator.connect(owner).add(1,2)).to.emit(calculator, "Result").withArgs(owner.address, 3)
  });
  });
  
  describe('function sub', function () {
  it("should emit event with result", async function () {
    await expect(calculator.connect(alice).sub(5,2)).to.emit(calculator, "Result").withArgs(alice.address, 3)
  });
  });
  
  describe('function mul', function () {
  it("should emit event with result", async function () {
    await expect(calculator.connect(alice).mul(5,2)).to.emit(calculator, "Result").withArgs(alice.address, 10)
  });
  });
  
  describe('function div', function () {
  it("should emit event with result", async function () {
    await expect(calculator.connect(alice).div(6,2)).to.emit(calculator, "Result").withArgs(alice.address, 3)
  });
  });
  
  describe('function mod', function () {
  it("should emit event with result", async function () {
    await expect(calculator.connect(alice).mod(6,4)).to.emit(calculator, "Result").withArgs(alice.address, 2)
  });
  });
  });
