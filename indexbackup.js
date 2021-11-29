import {
  LSPFactory
} from "@lukso/lsp-factory.js";

import pg from 'pg';
import express from "express";
import {
  readFileSync
} from "fs";
import dotenv from "dotenv";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json";
import ERC725Y from "@erc725/smart-contracts/artifacts/ERC725Y.json"
import {
  ethers
} from "ethers";
import fetch from 'node-fetch';
import * as fs from 'fs';
import {
  ERC725
} from "@erc725/erc725.js";

import Web3 from 'web3'
import quickstart from './locationDetection.js'
import annotateImage from './imageAnnotation.js'
dotenv.config();
const app = express();
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
const port = process.env.PORT || 8000;

const web3provider = new Web3(
  new Web3.providers.HttpProvider('https://rpc.l14.lukso.network'),
);
      annotateImage('0x6623b3bcef6a8f2328d49283ae15deb460084589','https://ipfs.lukso.network/ipfs/Qmev9TiXXQCCWW8QHX8PwFbqpDjwMQ2eFLyUqrmEeuivqu',99);
var web3 = new Web3(web3provider);
const chainId = 22 // Chain Id of the network you want to connect to
var provider = 'https://rpc.l14.lukso.network'
const deployKey = "0x9930822416aeee3b4375c635606003ed690608718c1f6133c6038bedc069780f" // Private key of the account which will deploy UPs
const lspFactory = new LSPFactory(provider, {
  deployKey,
  chainId
});
const schema = [{
    name: 'SupportedStandards:ERC725Account',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
    keyType: 'Mapping',
    valueContent: '0xafdeb5d6',
    valueType: 'bytes',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address',
  },
];
var blockNumber = 8634120;
var increment = 50;
const address = '0x3000783905Cc7170cCCe49a4112Deda952DDBe24';
const provier = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
};

async function recursivelyQueueBlock(blockNumber, increment) {
  console.log("new iteration", blockNumber);
  fetch('https://blockscout.com/lukso/l14/api/?module=block&action=eth_block_number', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (response.ok) {
      return response.json()
    } else {
      throw 'not json'
    }
  }).then(async (data) => {
    console.log(web3.utils.hexToNumber(data.result))
    if (blockNumber >= data.result) {
      setTimeout(function() {
        recursivelyQueueBlock(blockNumber, increment)
      }, 800);
    } else {
      var toBlock = (blockNumber + increment) >= data.result ? data.result - 1 : (blockNumber + increment - 1);
      console.log('z')
      fetch(`https://blockscout.com/lukso/l14/api?module=logs&action=getLogs&fromBlock=${blockNumber}&toBlock=${toBlock}&topic0=0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2&topic0_1_opr=and&topic1=0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw 'not json'
        }
      }).then(async (data) => {
        console.log('ab')
        if (data.result.length >= 1) {
          for (var i = 0; i < data.result.length; i++) {
            console.log(data.result[i].address, 'address');
            const erc725 = new ERC725(schema, data.result[i].address, provier, config);
            try {
              var x = await erc725.fetchData('LSP3Profile');
              console.log(x)
              console.log(x.LSP3Profile.LSP3Profile.profileImage[i].url.substr(7))
              console.log('https://ipfs.lukso.network/ipfs/' + x.LSP3Profile.LSP3Profile.profileImage[i].url.substr(7), "\n")

    //  annotateImage('0x6623b3bcef6a8f2328d49283ae15deb460084589','https://ipfs.lukso.network/ipfs/Qmev9TiXXQCCWW8QHX8PwFbqpDjwMQ2eFLyUqrmEeuivqu',99);
                annotateImage(data.result[i].address,'https://ipfs.lukso.network/ipfs/' + x.LSP3Profile.LSP3Profile.profileImage[i].url.substr(7),blockNumber);
              fetch('https://ipfs.lukso.network/ipfs/' + x.LSP3Profile.LSP3Profile.profileImage[i].url.substr(7), {
                method: 'GET',
                headers: {
                  'Content-Type': 'image/*'
                }
              }).then((response) => {
                if (response.ok) {
                  new Promise((resolve, reject) => {
                    const dest = fs.createWriteStream(`filename.png`);
                    response.body.pipe(dest);
                    response.body.on('end', () => resolve());
                    dest.on('error', reject);
                  })
                } else {
                  throw 'bad response'
                }
              }).catch((error) => {
                console.error(error)
              })
            } catch (error) {
              console.log('oh no')
            }
          }
        }
        setTimeout(function() {
          blockNumber += increment;
          recursivelyQueueBlock(blockNumber, increment);
        }, 800);
      }).catch(error => {
        console.log(error)
        setTimeout(function() {
          recursivelyQueueBlock(blockNumber, increment);
        }, 6000)
      })
    }
  }).catch(error => {
    console.log('ll')
    console.log(error)
    setTimeout(function() {
      recursivelyQueueBlock(blockNumber, increment);
    }, 6000);
  })
}

recursivelyQueueBlock(blockNumber, increment);

app.use('/', express.static('public'));

app.get('/findLabels', async function(req, res) {
  console.log('AAAAAAAAAAAAAAA')
const Client = pg.Client;
const client = new Client({
  user:process.env.USERNAME,
  host:process.env.HOST,
  database:process.env.DATABASE,
  password:process.env.PASSWORD,
  port:process.env.PORTDB,
})
const test= await client.connect()
var x=await client.query(text,values);
client.end()
try{
  return x.rows[0].profilelabels;
}
catch(error){return error}

  res.send({
    labelList:listofLabels,
    });
});

app.listen(port, async () => {
  var subscription = web3.eth.subscribe('logs', {
      fromBlock: 11498002,
      topics: ['0x00000000000000000000000062b3364ea3558c3a7d1597c5c5cc4d0d584c6ea0']
    }, function(error, result) {
      if (!error)
        console.log(result, "WOOWW");
    }).on("connected", function(subscriptionId) {
      console.log(subscriptionId);
    })
    .on("data", function(log) {
      console.log(log);
    })
    .on("changed", function(log) {});

  // port number make sure to kill with control c not some other thing
  console.log(`Test at ${port}`);
});
