var connected=false;


document.getElementById('btn4').onclick=async function(){
fetch('/findLabels', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    }).then(response=>response.json()).then(async(data)=>{//console.log(data.abi)
      console.log(data.listofLabels);
});
}

/*document.getElementById('btn4').onclick=async function(){
 var getAddress= await ethereum.request({
    "method": "eth_accounts",});
fetch('/upabi', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body:JSON.stringify({address:getAddress[0]})
    }).then(response=>response.json()).then(async(data)=>{//console.log(data.abi)
const transactionParameters = {
  from: getAddress[0], // must match user's active address.
  data:data.universalProfileAbi};
const txHash = await ethereum.request({
  method: 'eth_sendTransaction',
  params: [transactionParameters],
});
console.log(txHash);
});
}*/
