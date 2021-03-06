import vision from '@google-cloud/vision';
import connectPg from './pg.js'
export default async function annotateImage(address,url,blockNumber){
	const client = new vision.ImageAnnotatorClient();
  // Performs label detection on the image file
	  // Performs label detection on the image file

	var newlabels= new Set();
	var newlabelDetails= [];

  const [result] = await client.labelDetection(url);
  const labels = result.labelAnnotations;
  //console.log('Labels:');
  labels.forEach((label)=>{//console.log(label);
		newlabels.add(label.description);newlabelDetails.push(label); });
	console.log(url,"rr")
	console.log(address,"yay")
const values0= [address];
var text0= 'select profilelabels from addresses where address=$1';
var arraylabels=await connectPg(text0,values0);
for (var i in arraylabels){
//console.log(arraylabels[i])
const values1= [address,arraylabels[i]];
var text1= 'update labels set addresses= array_remove(addresses,$1) where label=$2';
await connectPg(text1,values1);
}
const values= [address,Array.from(newlabels),newlabelDetails,blockNumber,url];
var text= 'insert into addresses(address,profilelabels,labeldetails,block,url) values($1,$2 ,$3,$4,$5) on CONFLICT  (address) do update set profilelabels=$2, block=$4,labeldetails=$3, url=$5';
var newArrayLabels=await  connectPg(text,values);

for (var j in Array.from(newlabels)){
//console.log(Array.from(newlabels)[j])
const values2= [address,Array.from(newlabels)[j],[address]]
const text2='insert into labels(label,addresses) values($2,$3) on conflict (label) do update set addresses=array_append(labels.addresses,$1) where labels.label=$2';
var newArrayLabels2=await connectPg(text2,values2);
}
}
