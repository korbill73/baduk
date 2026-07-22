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
channel.send("/usr/local/httpd/bin/httpd -M | grep proxy\n")
time.sleep(1)
channel.send("ls /usr/local/httpd/conf/\n")
time.sleep(1)
channel.send("tail -n 30 /usr/local/httpd/conf/httpd.conf\n")
time.sleep(2)

output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
