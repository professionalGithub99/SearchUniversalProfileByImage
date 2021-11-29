import vision from '@google-cloud/vision';
async function quickstart(){
	const client = new vision.ImageAnnotatorClient();
  // Performs label detection on the image file
  const [result] = await client.labelDetection('https://ipfs.lukso.network/ipfs/QmUNc1KNLNfkuQSnGJ7Eez4u7XzbC7F4a5wALkovvDDLw9');
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label));
}
quickstart();
