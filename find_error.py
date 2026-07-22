import os
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                for idx, line in enumerate(file, 1):
                    if '외부 전문 KataGo' in line or '반환하지 못했거나' in line or 'queryKataGo' in line:
                        print(f"{path}:{idx}: {line.strip()}")
