import paramiko
import os
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('211.253.36.117', port=3322, username='HuMeccA', password='gbapzk12flsnrtm!@')

# Upload to temp dir
channel = client.invoke_shell()
time.sleep(1)
channel.send("mkdir -p /home/HuMeccA/dist_temp/assets\n")
time.sleep(1)

sftp = client.open_sftp()
temp_dir = '/home/HuMeccA/dist_temp'

print("Uploading dist/index.html...")
sftp.put('dist/index.html', temp_dir + '/index.html')

print("Uploading dist/assets/...")
for fname in os.listdir('dist/assets'):
    local_path = os.path.join('dist/assets', fname)
    print(f" -> {fname}")
    sftp.put(local_path, f"{temp_dir}/assets/{fname}")

sftp.close()

# Copy to web root as root
channel.send("su - root\n")
time.sleep(1)
channel.send("gbapzk12fnxm!@\n")
time.sleep(2)
channel.send("unalias cp 2>/dev/null; /bin/cp -rf /home/HuMeccA/dist_temp/* /home/humecca/html/\n")
time.sleep(1)
channel.send("chmod -R 755 /home/humecca/html/ && rm -rf /home/HuMeccA/dist_temp\n")
time.sleep(1)

out = ""
while channel.recv_ready():
    out += channel.recv(65536).decode('utf-8', errors='replace')
print("Server:", out)
client.close()
print("Deployment complete!")
