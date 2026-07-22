import paramiko
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('211.253.36.117', port=3322, username='HuMeccA', password='gbapzk12flsnrtm!@')

channel = client.invoke_shell()
time.sleep(1)
channel.send("su - root\n")
time.sleep(1)
channel.send("gbapzk12fnxm!@\n")
time.sleep(2)
channel.send("""node -e "
const fs = require('fs');
let code = fs.readFileSync('/root/setup-katago-auto.mjs', 'utf8');
const old1 = 'res.writeHead(200, { ...CORS_HEADERS, \\\'Content-Type\\\': \\\'application/json\\\' });\\n                res.end(JSON.stringify(getMockResponse(payload)));';
const new1 = 'res.writeHead(503, { ...CORS_HEADERS, \\\'Content-Type\\\': \\\'application/json\\\' });\\n                res.end(JSON.stringify({ error: \\\'KataGo engine search timeout.\\\' }));';
const old2 = 'res.writeHead(200, { ...CORS_HEADERS, \\\'Content-Type\\\': \\\'application/json\\\' });\\n            res.end(JSON.stringify(getMockResponse(payload)));';
const new2 = 'res.writeHead(503, { ...CORS_HEADERS, \\\'Content-Type\\\': \\\'application/json\\\' });\\n            res.end(JSON.stringify({ error: \\\'KataGo engine not ready yet.\\\' }));';
code = code.replace(old1, new1).replace(old2, new2);
fs.writeFileSync('/root/setup-katago-auto.mjs', code, 'utf8');
console.log('NODE REPLACED SUCCESS');
"
pm2 restart all && pm2 save
""")
time.sleep(8)
output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
