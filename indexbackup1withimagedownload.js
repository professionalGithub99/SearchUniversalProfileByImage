import connectPg from './pg.js'
import express from "express";
import {
  readFileSync
} from "fs";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json";
import ERC725Y from "@erc725/smart-contracts/artifacts/ERC725Y.json"
import fetch from 'node-fetch';
import * as fs from 'fs';
import { ERC725} from "@erc725/erc725.js";
import {port,web3,chainId,schema,blockNumber,increment,provider,config} from './setup.js'
//import quickstart from './locationDetection.js'
//import annotateImage from './imageAnnotation.js'
import updateDb from './imageAnnotationPg.js'
const app = express();
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
async function recursivelyQueueBlock(blockNumber, increment) {
  console.log("new iteration", blockNumber);
  fetch('https://blockscout.com/lukso/l14/api?module=block&action=eth_block_number', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
      //console.log(response)
    if (response.ok) {
      return response.json()
    } else {
      throw 'not json aaa'
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
        //console.log('ab',data)
        if (data.result.length >= 1) {
          for (var i = 0; i < data.result.length; i++) {
            var profileAddress=data.result[i].address;
            const erc725 = new ERC725(schema, data.result[i].address, provider, config);
            try {
              var x = await erc725.fetchData('LSP3Profile');
              var profileTags= x.LSP3Profile.LSP3Profile.tags;
              var profileImage='https://ipfs.lukso.network/ipfs/'+x.LSP3Profile.LSP3Profile.profileImage[0].url.substr(7)
              var backgroundImage='https://ipfs.lukso.network/ipfs/'+x.LSP3Profile.LSP3Profile.backgroundImage[0].url.substr(7);
              var mostUpdatedblock=parseInt(data.result[i].blockNumber)
              console.log(profileAddress,profileTags,profileImage,backgroundImage,mostUpdatedblock,'aziza')
              updateDb(profileAddress,profileTags,profileImage,backgroundImage,mostUpdatedblock)
              //  annotateImage('0x6623b3bcef6a8f2328d49283ae15deb460084589','https://ipfs.lukso.network/ipfs/Qmev9TiXXQCCWW8QHX8PwFbqpDjwMQ2eFLyUqrmEeuivqu',99);
              //annotateImage(data.result[i].address,'https://ipfs.lukso.network/ipfs/' + x.LSP3Profile.LSP3Profile.profileImage[i].url.substr(7),blockNumber);
              fetch('https://ipfs.lukso.network/ipfs/' + x.LSP3Profile.LSP3Profile.profileImage[0].url.substr(7), {
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
