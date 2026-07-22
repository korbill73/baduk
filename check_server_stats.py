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
channel.send("lscpu | grep -E '(Model name|CPU\(s\):)'\n")
time.sleep(1)
channel.send("grep -E '(maxVisits|numAnalysisThreads|numSearchThreads|nnCacheSize)' /root/katago-bin/analysis_config.cfg\n")
time.sleep(1)
channel.send("grep -C 10 'maxVisits' /root/setup-katago-auto.mjs\n")
time.sleep(1)
output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
