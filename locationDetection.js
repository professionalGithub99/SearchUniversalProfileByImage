import vision from '@google-cloud/vision';
export default async function quickstart(address,url){
	const client = new vision.ImageAnnotatorClient();
  // Performs label detection on the image file
  const [result] = await client.objectLocalization(url);
  const labels = result.localizedObjectAnnotations;
  console.log('Labels:');
	labels.forEach(object => {
  console.log(`Name: ${object.name}`);
  console.log(`Confidence: ${object.score}`);
  const veritices = object.boundingPoly.normalizedVertices;
  veritices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
});
}
