import React, { useEffect, useState } from "react";

import { Helmet } from "react-helmet";
import { ethers } from "ethers";

import projectStyles from "../style.module.css";
import styles from "./home.module.css";
// import moonPunks from "../contracts/MooncatPunks.json";
import moonPunks from "../contracts/PUNK.json";
import distProofs from "../utils/dist_proofs.json";

import styled from "styled-components";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Modal/BackDrop";

const CONTRACT_ADDRESS = "0x3c2526f16B770Ca83FfA3DFD9975eB89316aEE2e";

const Home = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [count, setCount] = useState(0);

  const [isModalShown, setIsModalShown] = useState(false);
  const [modalText, setModalText] = useState("");
  const [transactionLink, setTransactionLink] = useState("");
  const [balance, setBalance] = useState();
  const [totalSupply, setTotalSupply] = useState(0);

  const checkIfWalletIsConnected = async () => {
    // First make sure we have access to window.ethereum

    // const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  // Wallet Connect function
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // Fancy method to request access to account.

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      //  This should print out public address once we authorize Metamask.

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      gettotalSupply();
      balanceOf();
    } catch (error) {
      console.log(error);
    }
  };

  //Minted Token Balance Of that address
  const balanceOf = () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          moonPunks.abi,
          signer
        );
        const bal = connectedContract.balanceOf(currentAccount);
        setBalance(bal);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const gettotalSupply = async() => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          moonPunks.abi,
          signer
        );
        const total = await connectedContract.totalSupply();
        setTotalSupply(total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Number of cats to be minted increment function
  const increment = () => {
    setCount((prevCount) => prevCount + 1);
  };

  // Number of cats to be minted decrement function
  // Does not go below 0
  const decrement = () => {
    if (count > 0) {
      setCount((prevCount) => prevCount - 1);
    }
  };

  //Public Mint function
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          moonPunks.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        const price = await connectedContract.MCPPrice_public();
        console.log({ price });

        let nftTxn = await connectedContract.mint(count, {
          value: price,
        });

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`
        );
        //POPUP with this link
        const successText = `Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`;
        const tLink = `https://ropsten.etherscan.io/tx/${nftTxn.hash}`;
        setTransactionLink(tLink);
        setModalText(successText);
        setIsModalShown(true);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const data = [];
  var temp;

  Object.entries(distProofs).forEach((item) => {
    if (item[0].toLowerCase() === currentAccount) {
      item[1].proof.forEach((addProof) => {
        data.push(addProof);
      });
    }
  });

  const askContractToMintWhitelistNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          moonPunks.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        const price = await connectedContract.MCPPrice_whitelist();

        console.log({ price });

        let overrides = {
          gasLimit: 230000,
          value: price,
        };

        Object.entries(distProofs).forEach((item) => {
          if (item[0].toLowerCase() === currentAccount) {
            temp = item[1].leaf;
          }
        });
        console.log(data);

        let nftTxn = await connectedContract.mintWhitelist(
          count,
          data,
          temp,
          overrides
        );

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`
        );

        //POPUP with this link
        const successText = `Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`;
        const tLink = `https://ropsten.etherscan.io/tx/${nftTxn.hash}`;
        setTransactionLink(tLink);
        setModalText(successText);
        setIsModalShown(true);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkWhitelist = () => {
    if (currentAccount in distProofs) {
      askContractToMintWhitelistNft();
    } else {
      askContractToMintNft();
    }
  };

  const closeModal = () => setIsModalShown(false);

  const handleModalOptionClicked = (option) => {
    if (!option || option === "Close") {
      return closeModal();
    }

    window.open(transactionLink);
  };

  //This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className={styles["container"]}>
      <Helmet>
        <title>Mooncat Punks</title>
        <meta property="og:title" content="Mooncat Punks" />
      </Helmet>
      <div className={styles["container01"]}>
        <div className={styles["container02"]}>
          <div className={styles["BtnGroup"]}>
            <a
              href="https://discord.gg/3YVAP3rvgx"
              target="_blank"
              rel="noreferrer noopener"
              className={styles["link"]}
            >
              <img
                src="/playground_assets/discord-white.svg"
                className={styles["image"]}
              />
            </a>
            <a
              href="https://twitter.com/mooncatpunksnft"
              target="_blank"
              rel="noreferrer noopener"
              className={styles["link01"]}
            >
              <img
                src="/playground_assets/twitter-white.svg"
                className={styles["image1"]}
              />
            </a>
            <img
              src="/playground_assets/opensea-white.svg"
              className={styles["image2"]}
            />
          </div>
        </div>
        <img
          alt="logo"
          src="/playground_assets/mooncat%20punks%20logo%20png-600h.png"
          className={styles["image3"]}
        />
        <a
          href="#mint"
          className={` ${styles["link02"]} ${projectStyles["button"]}  `}
        >
          <span className={styles["text"]}>ADOPT A CAT</span>
        </a>
      </div>
      <div className={styles["Hero"]}>
        <div className={styles["container03"]}>
          <h1 className={styles["text01"]}>Never heard of a Mooncat Punk?</h1>
          <span className={styles["text02"]}>
            <span>
              Mooncat Punks are a collection of 6969 cute pixel art style
              kitties...inspired by Crypto Punks from Larva Labs and Moon Cats
              from Ponderware – rest assured these are the most adorable punks
              you’ll find on the internet (ΦωΦ)
            </span>
            <br></br>
            <span></span>
            <br></br>
            <span></span>
          </span>
          <div className={styles["BtnGroup1"]}>
            <a
              href="#mint"
              className={` ${styles["link03"]} ${projectStyles["button"]} `}
            >
              <span className={styles["text06"]}>JOIN DISCORD</span>
            </a>
            <a
              href="#mooncatmap"
              className={` ${styles["link04"]} ${projectStyles["button"]} `}
            >
              <span className={styles["text07"]}>OUR ROADMAP</span>
            </a>
          </div>
          <img
            alt="image"
            src="/playground_assets/webasset%203-1500h.png"
            loading="eager"
            className={styles["image4"]}
          />
        </div>
      </div>
      <div id="the mooncat map" className={styles["Hero1"]}>
        <div className={styles["container04"]}>
          <h1 id="mooncatmap" className={styles["text08"]}>
            MOONCAT PUNKS MAP
          </h1>
          <ul className={` ${styles["ul"]} ${projectStyles["list"]} `}>
            <li className={` ${styles["li"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text09"]}>
                • Mooncat Giveaways to the people who mint.
              </span>
            </li>
            <li className={` ${styles["li1"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text10"]}>
                • Resin Print NFTs - HODL your Mooncat Punks in real life.
              </span>
            </li>
            <li className={` ${styles["li2"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text11"]}>
                • Something for you and your kitties - Merch &amp; Giveaway
                (=^.^=)
              </span>
            </li>
            <li className={` ${styles["li3"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text12"]}>
                <span>• YouTube Channel with a 24/7 Radio. Meow!</span>
                <br></br>
                <span></span>
              </span>
            </li>
            <li className={` ${styles["li4"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text15"]}>
                <span>
                  • Donation to Animal Foster Homes around the globe of the
                  community’s choice.
                </span>
              </span>
            </li>
            <li className={` ${styles["li5"]} ${projectStyles["list-item"]} `}>
              <span className={styles["text17"]}>
                <span>
                  • W3 Integration for MoonCat Punks, Interact with our MoonCat
                  Punk HODLers worldwide in the Pixel Art Metaverse!
                </span>
              </span>
            </li>
          </ul>
          <span className={styles["text19"]}>
            <span>
              [ More about W3 here:
              <span
                dangerouslySetInnerHTML={{
                  __html: " ",
                }}
              />
            </span>
            <a
              href="https://webb.game"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className={styles["text21"]}>
                webb.game
                <span
                  dangerouslySetInnerHTML={{
                    __html: " ",
                  }}
                />
              </span>
            </a>
            <span>]</span>
          </span>
          <a href="#mint" className={styles["link06"]}>
            <div className={styles["BtnGroup2"]}>
              <button
                className={` ${styles["button"]} ${projectStyles["button"]} `}
              >
                <span className={styles["text23"]}>MINT A MOONCAT PUNK</span>
              </button>
            </div>
          </a>
        </div>
        <img
          alt="image"
          src="/playground_assets/mooncat%20mcgif-1500h.gif"
          className={styles["image5"]}
        />
      </div>
      <div className={styles["Hero2"]}>
        <div className={styles["container05"]}>
          {isModalShown && (
            <>
              <Modal
                collapse={closeModal}
                title={"Mint Successful"}
                option1="View"
                option2="Close"
                optionClicked={handleModalOptionClicked}
              >
                {modalText ? modalText : ""}
              </Modal>
              <Backdrop />
            </>
          )}
          <div id="mint" className={styles["container06"]}>
            <h1 className={styles["text24"]}>
              {`${totalSupply} of 6969 adpoted`}
            </h1>
            <h1 className={styles["text25"]}>
              {currentAccount ? "Connected" : "Not connected"}
            </h1>
            <StyledAccountAdd>
              {currentAccount ? currentAccount : ""}
            </StyledAccountAdd>
            <div className={styles["container07"]}>
              <button
                onClick={decrement}
                className={` ${styles["button1"]} ${projectStyles["button"]} `}
              >
                <span className={styles["text26"]}>-</span>
              </button>
              <StyledCounter id="counter">{count}</StyledCounter>{" "}
              <button
                onClick={increment}
                className={` ${styles["button2"]} ${projectStyles["button"]} `}
              >
                <span className={styles["text27"]}>+</span>
              </button>
            </div>
            <button
              onClick={connectWallet}
              className={` ${styles["button3"]} ${projectStyles["button"]} `}
            >
              <span className={styles["text28"]}>CONNECT WALLET</span>
            </button>
            <button
              onClick={checkWhitelist}
              className={` ${styles["button4"]} ${projectStyles["button"]} `}
            >
              <span className={styles["text29"]}>MINT A MEOW</span>
            </button>
          </div>
        </div>
        <div className={styles["container08"]}>
          <h1 className={styles["text30"]}>WHAT THE FAQ?!</h1>
          <div id="accordion" className={styles["accordion"]}>
            <div id="accordion" className={styles["accordion01"]}>
              <span className={styles["text31"]}>How much is mint price?</span>
              <div id="accordion" className={styles["accordion02"]}>
                {/* <span className={styles['text32']}>+</span> */}
              </div>
            </div>
            <div id="accordion" className={styles["accordion03"]}>
              <span className={styles["text33"]}>
                <span>
                  Whitelist Members get to mint at a cheaper price compared to
                  public mint - More details coming soon!
                </span>
                <br></br>
                <span></span>
                <span></span>
                <span></span>
                <br></br>
                <span>Psst. We&apos;re gas optimised ;)</span>
              </span>
            </div>
          </div>
          <div id="accordion" className={styles["accordion04"]}>
            <div id="accordion" className={styles["accordion05"]}>
              <span className={styles["text40"]}>Wen launch?</span>
              <div id="accordion" className={styles["accordion06"]}>
                {/* <span className={styles['text41']}>+</span> */}
              </div>
            </div>
            <div id="accordion" className={styles["accordion07"]}>
              <span className={styles["text42"]}>
                <span>
                  The date and time of launch will be disclosed on discord to
                  our community members. Whitelisted Members have access to
                  early announcements and will be given a heads up an hour prior
                  minting goes live
                  <span
                    dangerouslySetInnerHTML={{
                      __html: " ",
                    }}
                  />
                </span>
                <span>(ΦωΦ</span>
                <br></br>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
          <div id="accordion" className={styles["accordion08"]}>
            <div id="accordion" className={styles["accordion09"]}>
              <span className={styles["text47"]}>
                How to Join the Mooncat Punks Community?
              </span>
              <div id="accordion" className={styles["accordion10"]}>
                {/* <span className={styles['text48']}>+</span> */}
              </div>
            </div>
            <div id="accordion" className={styles["accordion11"]}>
              <span className={styles["text49"]}>
                If you missed the mint, Mooncat Punks should be available to
                purchase on the secondary market such as OpenSea. You may also
                join our discord community of our proud Mooncat Punk HODLers.
              </span>
            </div>
          </div>
        </div>
        <span className={styles["text50"]}>
          <span>Inter-cat with our community, punk.</span>
        </span>
        <div className={styles["container09"]}>
          <a
            href="https://twitter.com/mooncatpunksnft"
            target="_blank"
            rel="noreferrer noopener"
            className={` ${styles["link07"]} ${projectStyles["button"]} `}
          >
            <span className={styles["text52"]}>TWITTER</span>
          </a>
          <a
            href="https://discord.gg/PZPmRNgE"
            target="_blank"
            rel="noreferrer noopener"
            className={` ${styles["link08"]} ${projectStyles["button"]} `}
          >
            <span className={styles["text53"]}>DISCORD</span>
          </a>
          <a
            href="https://opensea.io/"
            target="_blank"
            rel="noreferrer noopener"
            className={` ${styles["link09"]} ${projectStyles["button"]} `}
          >
            <span className={styles["text54"]}>OPENSEA</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;

const StyledCounter = styled.div`
  color: #fff;
  font-size: 1rem;
  margin-top: 2rem;
`;

const StyledAccountAdd = styled.div`
  color: #fff;
  font-size: 1;
  text-align: center;
  margin-top: 2rem;
`;
