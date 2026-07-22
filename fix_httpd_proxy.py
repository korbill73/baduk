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
channel.send("ps -ef | grep httpd\n")
time.sleep(1)
channel.send("killall -9 httpd 2>/dev/null; /usr/sbin/httpd\n")
time.sleep(2)
channel.send("ps -ef | grep httpd; curl -i -X POST http://localhost/api/katago -H 'Content-Type: application/json' -d '{\"id\":\"test\",\"moves\":[[\"B\",\"Q16\"],[\"W\",\"D4\"]],\"rules\":\"korean\",\"komi\":6.5,\"boardXSize\":19,\"boardYSize\":19,\"maxVisits\":10}'\n")
time.sleep(4)

output = ""
while channel.recv_ready():
    output += channel.recv(65536).decode('utf-8', errors='replace')
print(output)
client.close()
