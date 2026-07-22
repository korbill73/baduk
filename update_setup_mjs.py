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
channel.send("""python3 -c "
with open('/root/setup-katago-auto.mjs', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace timeout mock response with 503 error
old_timeout = '''res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify(getMockResponse(payload)));'''
new_timeout = '''res.writeHead(503, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'KataGo engine search timeout. Please retry.' }));'''

old_not_ready = '''res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMockResponse(payload)));'''
new_not_ready = '''res.writeHead(503, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'KataGo engine not ready yet. Please wait a moment.' }));'''

code = code.replace(old_timeout, new_timeout).replace(old_not_ready, new_not_ready)

with open('/root/setup-katago-auto.mjs', 'w', encoding='utf-8') as f:
    f.write(code)
print('REPLACED SUCCESS')
"
pm2 restart all && pm2 logs --lines 10 --nostream 2>/dev/null
""")
time.sleep(10)
output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
