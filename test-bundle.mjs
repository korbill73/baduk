async function check() {
  const r = await fetch('http://localhost:5173/');
  const html = await r.text();
  console.log('HTML snippet:', html.substring(0, 300));
  const m = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
  if (m) {
    console.log('Bundle script:', m[1]);
    const jsResp = await fetch('http://localhost:5173/assets/' + m[1]);
    const js = await jsResp.text();
    console.log('Bundle has queryKataGo forceTest:', js.includes('forceTest'));
    console.log('Bundle has 16000 timeout:', js.includes('16000'));
  } else {
    console.log('No index bundle match in HTML, checking dev mode script tags.');
  }
}
check();
