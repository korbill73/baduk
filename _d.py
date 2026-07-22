import paramiko, os, time, sys
sys.stdout.reconfigure(encoding='utf-8')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('211.253.36.117', port=3322, username='HuMeccA', password='gbapzk12flsnrtm!@')
ch = client.invoke_shell(); time.sleep(1)
ch.send("mkdir -p /home/HuMeccA/dist_temp/assets\n"); time.sleep(1)
sftp = client.open_sftp()
sftp.put('dist/index.html', '/home/HuMeccA/dist_temp/index.html'); print("index.html OK")
for f in os.listdir('dist/assets'):
    sftp.put(f'dist/assets/{f}', f'/home/HuMeccA/dist_temp/assets/{f}'); print(f"  {f} OK")
sftp.close()
ch.send("su - root\n"); time.sleep(1)
ch.send("gbapzk12fnxm!@\n"); time.sleep(2)
ch.send("unalias cp 2>/dev/null; /bin/cp -rf /home/HuMeccA/dist_temp/* /home/humecca/html/ && chmod -R 755 /home/humecca/html/ && rm -rf /home/HuMeccA/dist_temp && echo DONE\n"); time.sleep(2)
out=""
while ch.recv_ready(): out+=ch.recv(65536).decode('utf-8',errors='replace')
print("Server:", out); client.close(); print("Deploy complete!")
