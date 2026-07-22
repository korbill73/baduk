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
channel.send("""mv /root/katago-bin/katago /root/katago-bin/katago.old 2>/dev/null; cat << 'EOF' > /root/katago-bin/katago
#!/bin/bash
export LD_LIBRARY_PATH="/root/katago-env/lib:$LD_LIBRARY_PATH"
exec /root/katago-env/bin/katago "$@"
EOF
chmod +x /root/katago-bin/katago && /root/katago-bin/katago version && /root/katago-bin/katago benchmark -model /root/katago-bin/model.bin.gz -config /root/katago-bin/analysis_config.cfg -v 5
""")
time.sleep(15)
output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
