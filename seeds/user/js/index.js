console.log("############################################");
console.log("#        Hi there technical person         #");
console.log("############################################");

// Disable logs
console.log = () => {};

// Unpkg imports
const Web3Modal = window.Web3Modal.default;

const WEB3_PROVIDER_URL = "https://bsc-dataseed.binance.org/";

// Web3modal instance
let web3Modal;

// web3 obj
let web3 = new Web3();

// Chosen wallet provider given by the dialog window
let provider;

// Web3 Connection Status
let isWeb3Connected;

// Web3 Connection Status
let selectedAccount;

// Create an instance of Notyf
var notyf = new Notyf({
  duration: 3000,
  position: { x: "right", y: "bottom" },
});

web3Modal = new Web3Modal({
  cacheProvider: false, // optional
  providerOptions: {}, // required
  disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
});

/* ------------------------
    Initial calls start
------------------------- */

let web3_global = new Web3(
  new Web3.providers.HttpProvider(window.CONTRACT_DATA.rpc_url)
);
let contract_obj = new web3_global.eth.Contract(
  window.CONTRACT_DATA.abi,
  window.CONTRACT_DATA.address
);

async function getTotalNftsSold(animate) {
  try {
    const chkConn = await web3_global.eth.net.isListening();

    if (!chkConn) {
      notyf.error(
        `Unable to fetch data from ${window.CONTRACT_DATA.network_name}!`
      );
      return false;
    }

    const sold_tokens = await contract_obj.methods.getSoldTokens().call();

    console.log("sold_tokens", sold_tokens);

    $(".count").text(sold_tokens);

    if (animate) {
      counterAnimate();
    }

    if (sold_tokens == 10000) {
      $("#buy-btn, #connect-wallet").hide();
    }
  } catch (e) {
    console.log(e);
    notyf.error(
      `Unable to fetch data from ${window.CONTRACT_DATA.network_name}!`
    );
  }
}

$(document).ready(function () {
  console.log("ready!");
  getTotalNftsSold(true);
});

/* ------------------------
    Initial calls end
------------------------- */

function setMaxMin() {
  let val = $("#nft-quantity").val();
  var lastChar = val.substr(val.length - 1);

  if (lastChar < 1) {
    $("#nft-quantity").val(1);
  } else if (lastChar > 5) {
    $("#nft-quantity").val(5);
  } else {
    $("#nft-quantity").val(lastChar);
  }
}

$("#buy-btn-modal").on("click", function () {
  if (!isWeb3Connected) {
    notyf.error("Please connect Metamask Wallet first!");
    return;
  }

  $("#exampleModalCenter").modal("show");
});

function formatEthErrorMsg(error) {
  try {
    var eFrom = error.message.indexOf("{");
    var eTo = error.message.lastIndexOf("}");
    var eM1 = error.message.indexOf(window.CONTRACT_DATA.error_handle);
    var eM3 = error.message.indexOf("Internal JSON-RPC error");

    if (eFrom != -1 && eTo != -1 && eM1 != -1) {
      var eMsgTemp = JSON.parse(error.message.substr(eFrom, eTo));
      var eMsg = eM3 != -1 ? eMsgTemp.message : eMsgTemp.originalError.message;

      return eMsg.split(window.CONTRACT_DATA.error_handle)[1];
    } else {
      return error.message;
    }
  } catch (e) {
    console.log(e);
    return "Something Went Wrong!";
  }
}

function enableBuyBtns() {
  $("#buy-btn-main").html("Buy Now");
  $("#buy-btn-main, #buy-btn-close").prop("disabled", false);
}

$("#buy-btn-main").on("click", buyNFTs);

async function buyNFTs() {
  try {
    $("#buy-btn-main").html(
      `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    );
    $("#buy-btn-main, #buy-btn-close").prop("disabled", true);

    let nQuantity = $("#nft-quantity").val();

    if (nQuantity < 1) {
      notyf.error("Please enter atleast 1 quantity!");
      enableBuyBtns();
      return;
    }

    let nTokenPrice = await contract_obj.methods.getTokenPrice().call();
    console.log("nTokenPrice", nTokenPrice);
    nFinalPrice = nTokenPrice * nQuantity;

    let nBalance = await web3.eth.getBalance(selectedAccount);
    console.log("nBalance", nBalance);

    if (nFinalPrice > nBalance) {
      notyf.error(`Insufficient ETH balance to buy ${nQuantity} quantity!`);
      enableBuyBtns();
      return;
    }

    let contract_obj_temp = new web3.eth.Contract(
      window.CONTRACT_DATA.abi,
      window.CONTRACT_DATA.address
    );

    const txEstimateGas = await contract_obj_temp.methods
      .mintToken(nQuantity)
      .estimateGas({
        from: selectedAccount,
        value: nFinalPrice,
      });
    console.log("txEstimateGas", txEstimateGas);

    contract_obj_temp.methods
      .mintToken(nQuantity)
      .send({
        from: selectedAccount,
        value: nFinalPrice,
        gas: txEstimateGas,
      })
      .once("transactionHash", async (transactionHash) => {
        $("#tx-url").attr(
          "href",
          `${window.CONTRACT_DATA.explorer_url}/tx/${transactionHash}`
        );
        $("#exampleModalCenter").modal("hide");
        $("#exampleModalCenter2-1").modal("show");
        enableBuyBtns();
      })
      .on("receipt", (receipt) => {
        $("#nft-count").html(nQuantity == 1 ? "1 NFT" : `${nQuantity} NFTs`);
        $("#exampleModalCenter2-1").modal("hide");
        $("#exampleModalCenter2-2").modal("show");
        getTotalNftsSold(false);
      })
      .catch((error) => {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        enableBuyBtns();
      });
  } catch (e) {
    console.log(e);
    notyf.error(formatEthErrorMsg(e));
    enableBuyBtns();
  }
}

$("#connect-wallet").on("click", connectMetamask);

async function connectMetamask() {
  try {
    if (!window.ethereum) {
      console.log("metamask not found");
      notyf.error(
        "MetaMask Not Found!<br/>Please install Metamask Extension to use our platform."
      );
      return;
    }

    if (!provider) {
      provider = await web3Modal.connect();

      provider.on("accountsChanged", function (accounts) {
        if (accounts.length) {
          selectedAccount = accounts[0].toString();

          var firstAddr = selectedAccount.slice(0, 7);
          var lastAddr = selectedAccount.slice(
            selectedAccount.length - 7,
            selectedAccount.length
          );

          $("#wallet-address").html(`${firstAddr}...${lastAddr}`);
        } else {
          isWeb3Connected = false;
          $("#wallet-address").html("").hide();
          $("#connect-wallet").show();
        }
      });

      provider.on("chainChanged", function () {
        isWeb3Connected = false;
        $("#wallet-address").html("").hide();
        $("#connect-wallet").show();
      });

      provider.on("networkChanged", function () {
        isWeb3Connected = false;
        $("#wallet-address").html("").hide();
        $("#connect-wallet").show();
      });

      provider.on("disconnect", function () {
        isWeb3Connected = false;
        $("#wallet-address").html("").hide();
        $("#connect-wallet").show();
      });
    }

    web3 = new Web3(provider);

    // Get connected chain id from Ethereum node
    const currentNetworkId = await web3.eth.getChainId();
    console.log("network", currentNetworkId);

    switch (currentNetworkId) {
      case "1":
        networkName = "MainNet";
        break;
      case "2":
        networkName = "Morden";
        break;
      case "3":
        networkName = "Ropsten";
        break;
      case "4":
        networkName = "Rinkeby";
        break;
      case "42":
        networkName = "Kovan";
        break;
      case "56":
        networkName = "BSC Mainnet";
        break;
      default:
        networkName = "Unknown";
    }

    if (web3 && currentNetworkId == window.CONTRACT_DATA.network_id) {
      let accounts = await web3.eth.getAccounts();
      selectedAccount = accounts[0];

      var firstAddr = selectedAccount.slice(0, 7);
      var lastAddr = selectedAccount.slice(
        selectedAccount.length - 7,
        selectedAccount.length
      );

      $("#connect-wallet").hide();
      $("#wallet-address").html(`${firstAddr}...${lastAddr}`).show();

      isWeb3Connected = true;

      notyf.success("Connected.");
    } else {
      console.log("networkName", networkName);
      notyf.error(
        `Please connect Metamask Wallet on <b>${window.CONTRACT_DATA.network_name}</b> You are on ${networkName}!`
      );
    }
  } catch (e) {
    console.log(e);
    notyf.error(
      "Please approve Metamask Wallet connection request to use our platform!"
    );
  }
}
