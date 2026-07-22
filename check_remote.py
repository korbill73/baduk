import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('211.253.36.117', port=3322, username='HuMeccA', password='gbapzk12flsnrtm!@')

print("=== USER PROCESSES ===")
stdin, stdout, stderr = client.exec_command('ps -ef')
lines = stdout.read().decode('utf-8', errors='replace').splitlines()
for line in lines:
    if any(k in line.lower() for k in ['python', 'node', 'katago', '63333', 'server', 'flask', 'uvicorn', 'baduk']):
        print(line)

print("=== SUDO NETSTAT & PROCESSES ===")
stdin, stdout, stderr = client.exec_command('echo "gbapzk12flsnrtm!@" | sudo -S netstat -tulpn | grep 63333; echo "gbapzk12flsnrtm!@" | sudo -S ps -ef | grep -E "python|node|katago|server"')
print(stdout.read().decode('utf-8', errors='replace'))
print("=== ROOT LOGIN TEST ===")
try:
    client2 = paramiko.SSHClient()
    client2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client2.connect('211.253.36.117', port=3322, username='root', password='gbapzk12fnxm!@', timeout=3)
    print("Logged in as root directly!")
    client2.close()
except Exception as e:
    print("Root direct login:", e)

client.close()
