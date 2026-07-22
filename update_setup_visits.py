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
const oldText = 'if (payload.maxVisits && payload.maxVisits > 120) {\\n            payload.maxVisits = 120;\\n          }';
const newText = 'if (!payload.maxVisits || payload.maxVisits < 1) {\\n            payload.maxVisits = 120;\\n          } else if (payload.maxVisits > 350) {\\n            payload.maxVisits = 350;\\n          }';
if (code.includes(oldText)) {
  code = code.replace(oldText, newText);
  fs.writeFileSync('/root/setup-katago-auto.mjs', code, 'utf8');
  console.log('REPLACED VISITS CAP SUCCESS');
} else {
  console.log('OLD TEXT NOT FOUND OR ALREADY MODIFIED');
}
"
pm2 restart all && pm2 save
""")
time.sleep(8)
output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
