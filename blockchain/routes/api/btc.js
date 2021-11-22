var express = require("express");

const { default: axios } = require("axios");
var router = express.Router();

const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
let UserBalance = 5000000;
let SellerBalance = 0;
let UserBTC = 0;
let SellerBTC = 100;
// let avgPrice = 0;
let price = 0;
let BtcPrice = 0;
let bestSellPrice = 0;
let sell = [];
let buy = [];

const Balance = () => {
  return console.log(
    "User Balance = $",
    UserBalance,
    " \n Admin Balance = ",
    SellerBTC,
    "BTC"
  );
};

const avgPrice = async () => {
  await axios
    .get("https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT")
    .then((res) => {
      price = res.data.price;
    })
    .catch((err) => {
      console.log("Error >> ", err);
    });
};

const ExactPrice = async () => {
  await axios
    .get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
    .then((res) => {
      BtcPrice = res.data.price;
    })
    .catch((err) => {
      console.log("Error >> ", err);
    });
};

const BestPrice = async () => {
  await axios
    .get("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT")
    .then((res) => {
      bestSellPrice = res.data.highPrice;
    })
    .catch((err) => {
      console.log("Error >> ", err);
    });
};

router.get("/", function (req, res, next) {
  Balance();
  res.send(`User balance = ${UserBalance} & Admin Balance = ${SellerBTC}`);
});

router.post("/sell", auth, admin, function (req, res, next) {
  avgPrice();
  BestPrice();
  ExactPrice();

  if (
    (BtcPrice >= price - 0.05 * price || BtcPrice <= price + 0.05 * price) &&
    SellerBTC >= 1
  ) {
    if (req.body.quantity === 1) {
      if (buy.length != 0) {
        buy.shift();
        if (BtcPrice < bestSellPrice) {
          SellerBTC = SellerBTC - 1;
          SellerBalance = SellerBalance + BtcPrice;
          UserBTC = UserBTC + 1;
          UserBalance = UserBalance - BtcPrice;
          return res.send(
            `order is Filled \n Your BTC Balance > ${SellerBTC} \n Buyer Remaining Balance > ${UserBalance}`
          );
        }
      } else {
        let obj = {
          type: req.body.type,
          quantity: req.body.quantity,
        };
        sell.push(obj);
        return res.send(
          `Your Order is Pending: \n Order Type: ${req.body.type} && \n Quantity: ${req.body.quantity}`
        );
      }
    } else {
      return res.status(401).send("Quantity must be 1");
    }
  } else {
    return res
      .status(400)
      .send("Price must be 5% less or 5% more than the avg price");
  }
});
router.post("/buy", auth, function (req, res, next) {
  avgPrice();
  BestPrice();
  ExactPrice();
  if (
    (BtcPrice >= price - 0.05 * price || BtcPrice <= price + 0.05 * price) &&
    UserBalance >= BtcPrice
  ) {
    if (req.body.quantity === 1) {
      if (sell.length !== 0) {
        sell.shift();
        if (BtcPrice < bestSellPrice) {
          SellerBTC = SellerBTC - 1;
          SellerBalance = SellerBalance + BtcPrice;
          UserBTC = UserBTC + 1;
          UserBalance = UserBalance - BtcPrice;
          return res.send(
            `order is Filled \n your remaining  Balance is > ${UserBalance} \n Admin BTC Balance is > ${SellerBTC}`
          );
        }
      } else {
        let obj = {
          type: req.body.type,
          quantity: req.body.quantity,
        };
        buy.push(obj);

        return res.send(
          `Your Order is Pending: \n Order Type: ${req.body.type} && \n Quantity: ${req.body.quantity}`
        );
      }
    } else {
      return res.status(401).send("BTC Buyer Quantity must be 1");
    }
  } else {
    return res
      .status(400)
      .send("Price must be 5% less or 5% more than the avg price");
  }
});

setInterval(async function () {
  // console.log(await binance.futuresMarkPrice("BTCUSDT"));

  await axios;
  console.log("Buyer >> ", buy[0], "  Seller > ", sell[0]);
  //this code runs every second
}, 3000);

module.exports = router;
