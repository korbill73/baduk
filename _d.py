import paramiko, os, time, sys
sys.stdout.reconfigure(encoding='utf-8')
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('211.253.36.117', port=3322, username='HuMeccA', password='gbapzk12flsnrtm!@')
ch = c.invoke_shell(); time.sleep(1)
ch.send("mkdir -p /home/HuMeccA/dt/assets\n"); time.sleep(1)
s = c.open_sftp()
s.put('dist/index.html', '/home/HuMeccA/dt/index.html'); print("index.html OK")
for f in os.listdir('dist/assets'):
    s.put(f'dist/assets/{f}', f'/home/HuMeccA/dt/assets/{f}'); print(f"  {f}")
s.close()
ch.send("su - root\n"); time.sleep(1); ch.send("gbapzk12fnxm!@\n"); time.sleep(2)
ch.send("unalias cp 2>/dev/null; /bin/cp -rf /home/HuMeccA/dt/* /home/humecca/html/ && chmod -R 755 /home/humecca/html/ && rm -rf /home/HuMeccA/dt && echo OK\n"); time.sleep(2)
out=""
while ch.recv_ready(): out+=ch.recv(65536).decode('utf-8',errors='replace')
print(out); c.close()
