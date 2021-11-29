import express from "express";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import Parcel from "@oasislabs/parcel";
import * as jose from 'jose'
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const alg = 'ES256';
const keypair = await jose.generateKeyPair(alg);
const [publicKey, privateKey] = await Promise.all(
  [keypair.publicKey, keypair.privateKey].map(async (k) => {
    const jwk = await jose.exportJWK(k);
    return {
      alg,
      use: 'sig',
      ...jwk,
    };
  }),
);


console.log('========== Public Key ===========');
console.log(JSON.stringify(publicKey));
console.log(publicKey);
console.log('========== Private Key ==========');
console.log(JSON.stringify(privateKey));
console.log(privateKey);
console.log('=================================');


app.listen(port, async () => {
  // port number make sure to kill with control c not some other thing
  console.log(`Test at ${port}`);

  //creating a service client "our app account"
  const parcel = new Parcel({
    clientId: process.env.PARCEL_CLIENT_ID,
    privateKey: JSON.parse(
      readFileSync("private-mp_ZfjfuK3v810vcwGUmNZbkp63X3EJuq45H8Tkdze8.json")
    ),
  });


  //console.log this is our currentIdentity
  const myIdentity = await parcel.getCurrentIdentity();
  const newIdentity =await parcel.createIdentity({
    "tokenVerifiers": [
      {
        "publicKey":
{
  alg: 'ES256',
  use: 'sig',
  kty: 'EC',
  crv: 'P-256',
  x: 'ZGRzofGoFCwxEci1QBkiizrGX9zXiDjpaVVACSGsAKA',
  y: 'CQnZA6dwH1EnOW5BShBo50qo3REUfKs8FLUhShezxg8'
}
      }
    ]
  })
  //creating some data for our first document upload
  const parcel1 = new Parcel({
    principal:'INAaQv5FkuejZeoTa3S2bEK',
    privateKey:
{
  alg: 'ES256',
  use: 'sig',
  kty: 'EC',
  crv: 'P-256',
  x: 'ZGRzofGoFCwxEci1QBkiizrGX9zXiDjpaVVACSGsAKA',
  y: 'CQnZA6dwH1EnOW5BShBo50qo3REUfKs8FLUhShezxg8',
  d: 'HPiT4FvyKRQgkJZJ5nC4z6FB-f2bDaSIUsx2rsfrcDs'
}
,
  });
  await parcel1.createGrant({
  grantee: process.env.ACME_APP_ID,
  condition: { 'document.owner': { $eq:'INAaQv5FkuejZeoTa3S2bEK'} },
});
const parcel1Identity=await parcel1.getCurrentIdentity();
  console.log(newIdentity.id);
  console.log(myIdentity.id);
  console.log(parcel1Identity);
  const identityDetails = {
    title: "My first doc",
    tags: ["greeting", "aaa"],
  };
  const data = "hello";
var docs= await createDocumentForUser("ksjdlfj",process.env.ACME_APP_ID,parcel,identityDetails,data)
console.log(docs);
  // search documents youve created and view
  let searchDocs=await searchDocuments(parcel,myIdentity.id);
console.log(searchDocs);
  //download a specific document by id
  downloadDocument(parcel,'DPd9TRQUkSw3uSYmSatx7eg');

  //uncomment to create document
  //  let document= await createDocument(process.env.ACME_APP_ID,parcel,identityDetails,data);
  // console.log(document);



  //my own thing learning about iterators
  const it=makeIterator();
  console.log(it.next());
  //console.log(myIdentity,",",myIdentity.id,",",document[0],',',document[1]);
});
async function createDocument(appId, parcelObject, documentDetails, data) {
  let document;
  try {
    document = await parcelObject.uploadDocument(data, {
      details: documentDetails,
      toApp: appId,
    }).finished;
    return [document.id, document.owner];
  } catch (error) {
    console.error("unable to upload document");
    return "bad";
  }
}

async function createDocumentForUser(userId,appId,parcelObject,documentDetails,data){
  let document;
  try{
    document=await parcelObject.uploadDocument(data,{
      details:documentDetails,
      owner:userId,
      toApp:appId
    }).finished;
return(document);
  }
  catch(error){
    return(error);
  }
}
async function searchDocuments(parcelObject,id) {
  let uploadedDocuments =(await parcelObject.searchDocuments({
    selectedByCondition: {
      "document.creator":{$eq: id},
    },
  })).results;
  return uploadedDocuments;
}


async function downloadDocument(parcelObject,documentId){
  const download=await (parcelObject.downloadDocument(documentId));
  for await (const variable of download){
    console.log(variable.toString())
  }
}

function makeIterator() {
  let booboo=0;
  return{
    next:function(){
      return booboo==1?{value:booboo,done:true}:{value:booboo++,done:false}
    }
  }
}
