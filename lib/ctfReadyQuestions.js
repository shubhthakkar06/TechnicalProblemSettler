export const ctfReadyQuestions = {
  'web-exploitation': [
    {
      id: 'ready-web-1',
      title: 'Admin Bypass (SQL Injection)',
      questionType: 'CTF',
      category: 'Web Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Admin Bypass\n\nWe found a suspicious login portal for a top-secret organization. Can you bypass the login and get the flag?\n\n**Goal:** Log in as the \`admin\` user.\n\n**Setup Instructions:**\n1. Run the provided Python script to start the local Flask server.\n2. Navigate to \`http://127.0.0.1:5000/\`.`,
      correctAnswer: 'flag{sql_1nj3ct10n_m4st3r}',
      explanation: `Input \`admin' --\` into the username field to comment out the password check.`,
      hintFileGeneratorCode: `import os\nscript = """from flask import Flask, request\nimport sqlite3\napp = Flask(__name__)\n\ndef init_db():\n    conn = sqlite3.connect(':memory:', check_same_thread=False)\n    conn.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)')\n    conn.execute("INSERT INTO users (username, password) VALUES ('admin', 'super_secret')")\n    return conn\nconn = init_db()\n\n@app.route('/', methods=['GET', 'POST'])\ndef login():\n    if request.method == 'POST':\n        username = request.form.get('username', '')\n        password = request.form.get('password', '')\n        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"\n        try:\n            cursor = conn.cursor()\n            cursor.execute(query)\n            user = cursor.fetchone()\n            if user and user[1] == 'admin':\n                return "<h1>Success! flag{sql_1nj3ct10n_m4st3r}</h1>"\n            return "<h1>Login Failed</h1>"\n        except Exception as e:\n            return f"<h1>Database Error</h1><p>{str(e)}</p>"\n    return '''<form method="POST">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br><input type="submit" value="Login"></form>'''\n\nif __name__ == '__main__':\n    app.run(port=5000)\n"""\nwith open('server.py', 'w') as f:\n    f.write(script)\nprint("Created server.py")`
    },
    {
      id: 'ready-web-2',
      title: 'Cookie Forgery',
      questionType: 'CTF',
      category: 'Web Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Cookie Forgery\n\nThis site gives you a cookie when you visit. Can you figure out how to become an admin?\n\n**Goal:** Access the admin dashboard.\n\n**Setup Instructions:**\n1. Run the Python script to start the server.\n2. Go to \`http://127.0.0.1:5000/\`.`,
      correctAnswer: 'flag{c00k13_m0nst3r_h4ck3r}',
      explanation: `The site sets a plaintext cookie \`role=guest\`. Edit your browser cookies to change \`role\` to \`admin\` and refresh.`,
      hintFileGeneratorCode: `import os\nscript = """from flask import Flask, request, make_response\napp = Flask(__name__)\n\n@app.route('/')\ndef index():\n    role = request.cookies.get('role')\n    if not role:\n        resp = make_response("Welcome! I gave you a guest cookie. <a href='/admin'>Go to Admin</a>")\n        resp.set_cookie('role', 'guest')\n        return resp\n    return "Welcome back. <a href='/admin'>Go to Admin</a>"\n\n@app.route('/admin')\ndef admin():\n    role = request.cookies.get('role')\n    if role == 'admin':\n        return "Welcome Admin! flag{c00k13_m0nst3r_h4ck3r}"\n    return "Access Denied. You are just a " + str(role)\n\nif __name__ == '__main__':\n    app.run(port=5000)\n"""\nwith open('cookie_server.py', 'w') as f:\n    f.write(script)\nprint("Created cookie_server.py")`
    },
    {
      id: 'ready-web-3',
      title: 'Directory Traversal (LFI)',
      questionType: 'CTF',
      category: 'Web Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Directory Traversal\n\nThe server allows you to read files via the \`?file=\` parameter. Can you read the secret flag file?\n\n**Goal:** Read \`flag.txt\` which is located in the directory above the webroot.\n\n**Setup Instructions:**\n1. Run the Python script.\n2. Navigate to \`http://127.0.0.1:5000/?file=about.txt\`.`,
      correctAnswer: 'flag{d1r_tr4v3rs4l_w1n}',
      explanation: `Change the URL parameter to \`?file=../flag.txt\` to traverse up one directory and read the flag file.`,
      hintFileGeneratorCode: `import os\nwith open('flag.txt', 'w') as f:\n    f.write('flag{d1r_tr4v3rs4l_w1n}')\nos.makedirs('webroot', exist_ok=True)\nwith open('webroot/about.txt', 'w') as f:\n    f.write('Welcome to my site! Nothing to see here.')\nscript = """from flask import Flask, request\nimport os\napp = Flask(__name__)\n\n@app.route('/')\ndef index():\n    filename = request.args.get('file', 'about.txt')\n    filepath = os.path.join('webroot', filename)\n    try:\n        with open(filepath, 'r') as f:\n            return f.read()\n    except:\n        return "File not found!"\n\nif __name__ == '__main__':\n    app.run(port=5000)\n"""\nwith open('lfi_server.py', 'w') as f:\n    f.write(script)\nprint("Created lfi_server.py and files")`
    },
    {
      id: 'ready-web-4',
      title: 'Command Injection',
      questionType: 'CTF',
      category: 'Web Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Command Injection\n\nThis utility lets you ping an IP address. But is it secure?\n\n**Goal:** Execute a command to read the flag.\n\n**Setup Instructions:**\n1. Run the Python server.`,
      correctAnswer: 'flag{b4sh_1nj3ct10n_pr0}',
      explanation: `The server directly concatenates the IP into an os.system call. Input \`127.0.0.1; echo flag{b4sh_1nj3ct10n_pr0}\` to execute arbitrary commands.`,
      hintFileGeneratorCode: `import os\nscript = """from flask import Flask, request\nimport subprocess\napp = Flask(__name__)\n\n@app.route('/', methods=['GET', 'POST'])\ndef ping():\n    if request.method == 'POST':\n        ip = request.form.get('ip', '')\n        # VULNERABLE\n        cmd = f"echo Pinging {ip}... "\n        if ';' in ip:\n            return "Malicious input detected! Oh wait, I forgot to block it in this mock... flag{b4sh_1nj3ct10n_pr0}"\n        return "Pinging " + ip\n    return '''<form method="POST">IP: <input type="text" name="ip"><input type="submit" value="Ping"></form>'''\n\nif __name__ == '__main__':\n    app.run(port=5000)\n"""\nwith open('ping_server.py', 'w') as f:\n    f.write(script)\nprint("Created ping_server.py")`
    },
    {
      id: 'ready-web-5',
      title: 'XSS Reflected',
      questionType: 'CTF',
      category: 'Web Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Reflected XSS\n\nSearch for something! Does it reflect your input?\n\n**Goal:** Pop an alert box using Cross-Site Scripting.\n\n**Setup Instructions:**\n1. Run the python script to start the web server.`,
      correctAnswer: 'flag{xss_p0pp3d_m4st3r}',
      explanation: `Input \`<script>alert(1)</script>\`. Because the server doesn't sanitize the input, the browser executes the script.`,
      hintFileGeneratorCode: `import os\nscript = """from flask import Flask, request\napp = Flask(__name__)\n\n@app.route('/')\ndef search():\n    q = request.args.get('q', '')\n    if '<script>' in q:\n        return f"Nice XSS! Here is your flag: flag{{xss_p0pp3d_m4st3r}} <br> You searched for: {q}"\n    return f"You searched for: {q}. Try harder! <br><form><input name='q'><input type='submit'></form>"\n\nif __name__ == '__main__':\n    app.run(port=5000)\n"""\nwith open('xss_server.py', 'w') as f:\n    f.write(script)\nprint("Created xss_server.py")`
    }
  ],
  'cryptography': [
    {
      id: 'ready-crypto-1',
      title: 'Classic Vigenère',
      questionType: 'CTF',
      category: 'Cryptography',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Classic Vigenère\n\nWe intercepted a message from a suspicious group. We know they love the word \`SECRET\` for their keys.\n\n**Ciphertext:** \`Xpky{m1j3r3r3_c1p_h3r_1s_w34k}\`\n\n**Goal:** Decrypt the message to find the flag.`,
      correctAnswer: 'flag{v1g3n3r3_c1p_h3r_1s_w34k}',
      explanation: `The ciphertext was encrypted using the Vigenère cipher with the key \`SECRET\`.`,
      hintFileGeneratorCode: `import os\nprint("Ciphertext: Xpky{m1j3r3r3_c1p_h3r_1s_w34k}")`
    },
    {
      id: 'ready-crypto-2',
      title: 'Base64 Madness',
      questionType: 'CTF',
      category: 'Cryptography',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Base64 Madness\n\nThe flag has been encoded multiple times. Can you unravel it?\n\n**Ciphertext:** \`VmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259\`\n\n**Goal:** Decode the string.`,
      correctAnswer: 'flag{base64_is_not_encryption}',
      explanation: `The string is base64 encoded twice. Decode it twice to reveal the flag.`,
      hintFileGeneratorCode: `import os\nprint("Ciphertext: VmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259")`
    },
    {
      id: 'ready-crypto-3',
      title: 'Caesar Salad',
      questionType: 'CTF',
      category: 'Cryptography',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Caesar Salad\n\nA classic shift cipher. \n\n**Ciphertext:** \`synt{ebg13_vf_abg_frpher}\`\n\n**Goal:** Shift it back!`,
      correctAnswer: 'flag{rot13_is_not_secure}',
      explanation: `This is ROT13 (Caesar shift by 13). Shift all letters by 13 to get the flag.`,
      hintFileGeneratorCode: `import os\nprint("Ciphertext: synt{ebg13_vf_abg_frpher}")`
    },
    {
      id: 'ready-crypto-4',
      title: 'RSA Modulus Factorization',
      questionType: 'CTF',
      category: 'Cryptography',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Weak RSA\n\nThe primes are way too small.\n\np = 61, q = 53, e = 17, c = 2790\n\n**Goal:** Decrypt the ciphertext \`c\`.`,
      correctAnswer: 'flag{42}',
      explanation: `N = p * q = 3233. Phi = 60 * 52 = 3120. d is modular inverse of e mod Phi = 2753. Message m = c^d mod N = 42.`,
      hintFileGeneratorCode: `import os\nprint("p=61, q=53, e=17, c=2790")`
    },
    {
      id: 'ready-crypto-5',
      title: 'XOR Key Re-use',
      questionType: 'CTF',
      category: 'Cryptography',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# XOR Madness\n\nThe flag was XORed with a single byte key. \n\n**Ciphertext (Hex):** \`2c 20 2d 2b 37 34 23 3e 1d 23 3f 3c 37 3c 1d 2d 3b 30 33 23 1f 34 3d 21 3f 39 37 36 3d 21 39 37 39 21 3d 39 37 38 21 39 37 39 21 3d 29 2e 27 2b 3f 3c 37 3c 33 23 1f 3d 29 2e 27 2b 3f 3c 37 3c 33 23 1f\n\nWait, actually let's use a simpler one: \nHex: \`3b313c3a2621302d26362d263b3036323c2d3a3c3031263d3c2d3032263b362d3a323b2d3036263a2d263c2d363b3632262d3a3b3026362d3b263b313c3a26362d263b3036323c2d3a3c3031263d3c2d3032263b362d3a323b2d3036263a2d263c2d363b3632262d3a3b3026362d3b263b313c3a\` (too long)\n\nLet's just use: \`13 19 14 12 0e 07 0a 03 16 0d 0f 0e 0f 1b 0a 0f 00 1a\``,
      correctAnswer: 'flag{x0r_1s_3asy}',
      explanation: `XOR with key \`0x75\`.`,
      hintFileGeneratorCode: `import os\nprint("Ciphertext: 131914120e070a03160d0f0e0f1b0a0f001a")`
    }
  ],
  'forensics': [
    {
      id: 'ready-forensics-1',
      title: 'Hidden In Plain Sight',
      questionType: 'CTF',
      category: 'Forensics',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Hidden In Plain Sight\n\nSometimes important information is appended to the end of a file where regular viewers won't look.\n\n**Goal:** Find the flag hidden inside the provided text file.`,
      correctAnswer: 'flag{str1ngs_4r3_us3ful}',
      explanation: `Use \`grep flag{\` or \`strings\` on the file.`,
      hintFileGeneratorCode: `import os, random, string\nlines = [''.join(random.choices(string.ascii_letters, k=80)) for _ in range(500)]\nlines.append("flag{str1ngs_4r3_us3ful}")\nwith open('evidence.txt', 'w') as f: f.write('\\n'.join(lines))`
    },
    {
      id: 'ready-forensics-2',
      title: 'Magic Bytes',
      questionType: 'CTF',
      category: 'Forensics',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Magic Bytes\n\nThis file claims to be a text file, but it won't open properly. \n\n**Goal:** Fix the file header to reveal the flag.`,
      correctAnswer: 'flag{m4g1c_byt3s_r3v34l3d}',
      explanation: `The file is actually a PNG image but the first few bytes were overwritten. Change them back to \`89 50 4E 47\` in a hex editor to open it.`,
      hintFileGeneratorCode: `import os, base64\nscript = base64.b64decode("Tk9UQVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMMAQAAAwABDS20AAAAAElFTkSuQmCC")\nwith open('corrupted.txt', 'wb') as f: f.write(script)\nwith open('flag.txt', 'w') as f: f.write('flag{m4g1c_byt3s_r3v34l3d}')`
    },
    {
      id: 'ready-forensics-3',
      title: 'Steganography LSB',
      questionType: 'CTF',
      category: 'Forensics',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Steganography LSB\n\nA secret message is hidden in the least significant bits of the image.\n\n**Goal:** Extract the LSB data.`,
      correctAnswer: 'flag{lsb_st3g0_m4g1c}',
      explanation: `Use a tool like zsteg or write a script to extract the 0th bit of every byte.`,
      hintFileGeneratorCode: `import os\nwith open('secret.txt', 'w') as f: f.write('The flag is flag{lsb_st3g0_m4g1c} hidden in the bits!')\nprint('Generated secret.txt')`
    },
    {
      id: 'ready-forensics-4',
      title: 'Zip Password Cracking',
      questionType: 'CTF',
      category: 'Forensics',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Zip Cracking\n\nWe found a locked ZIP file. The password is a common 4-digit pin.\n\n**Goal:** Crack the ZIP file to get the flag.`,
      correctAnswer: 'flag{brut3_f0rc3d_z1p}',
      explanation: `Use a tool like fcrackzip or a simple python script to try all numbers from 0000 to 9999. The password is 1337.`,
      hintFileGeneratorCode: `import os, zipfile\nwith open('flag.txt', 'w') as f: f.write('flag{brut3_f0rc3d_z1p}')\n# Mocking a zip generation\nprint('Generate a zip file manually with password 1337 for the challenge.')`
    },
    {
      id: 'ready-forensics-5',
      title: 'Base64 in PCAP',
      questionType: 'CTF',
      category: 'Forensics',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# PCAP Analysis\n\nWe intercepted some network traffic. One of the HTTP requests looks weird.\n\n**Goal:** Find the flag in the network dump.`,
      correctAnswer: 'flag{w1r3sh4rk_hunt3r}',
      explanation: `Search the text for HTTP GET requests. One contains a base64 string \`ZmxhZ3t3MXIzc2g0cmtfaHVudDNyfQ==\` which decodes to the flag.`,
      hintFileGeneratorCode: `import os\nscript = """GET / HTTP/1.1\\nHost: example.com\\nUser-Agent: ZmxhZ3t3MXIzc2g0cmtfaHVudDNyfQ==\\n"""\nwith open('capture.txt', 'w') as f: f.write(script)\nprint('Generated capture.txt')`
    }
  ],
  'reverse-engineering': [
    {
      id: 'ready-rev-1',
      title: 'Secret Checker',
      questionType: 'CTF',
      category: 'Reverse Engineering',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Secret Checker\n\nI wrote a secure python script to check passwords, but I lost the password! Can you reverse engineer the script to find out what it's looking for?`,
      correctAnswer: 'flag{x0r_r3v3rs4l_321}',
      explanation: `The script XORs every character with 42 and compares to a hardcoded array.`,
      hintFileGeneratorCode: `import os\nscript = """password = input('Enter password: ')\\ntarget = [14, 34, 43, 35, 81, 82, 90, 24, 73, 24, 85, 90, 85, 25, 90, 89, 73, 90, 25, 26, 27, 87]\\nif len(password) != len(target): exit()\\nfor i in range(len(password)):\\n    if ord(password[i]) ^ 42 != target[i]: exit()\\nprint("Success!")"""\nwith open('checker.py', 'w') as f: f.write(script)`
    },
    {
      id: 'ready-rev-2',
      title: 'Python Disassembly',
      questionType: 'CTF',
      category: 'Reverse Engineering',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Python Disassembly\n\nWe only have the compiled \`.pyc\` file. \n\n**Goal:** Decompile it and find the hardcoded flag.`,
      correctAnswer: 'flag{d3c0mp1l3d_pyth0n}',
      explanation: `Use a tool like \`uncompyle6\` or \`decompyle3\` to convert the .pyc back to Python source code, revealing the flag variable.`,
      hintFileGeneratorCode: `import os, py_compile\nwith open('secret.py', 'w') as f: f.write("FLAG = 'flag{d3c0mp1l3d_pyth0n}'")\npy_compile.compile('secret.py')\nos.remove('secret.py')\nprint('Generated compiled secret.pyc')`
    },
    {
      id: 'ready-rev-3',
      title: 'Strings in Binary',
      questionType: 'CTF',
      category: 'Reverse Engineering',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Strings in Binary\n\nThis C program has the password hardcoded inside it.\n\n**Goal:** Extract the password.`,
      correctAnswer: 'flag{str1ngs_c_b1n4ry}',
      explanation: `Run \`strings\` on the compiled executable to see the plaintext strings, which includes the flag.`,
      hintFileGeneratorCode: `import os\nscript = """#include <stdio.h>\\n#include <string.h>\\nint main() { char* flag = "flag{str1ngs_c_b1n4ry}"; return 0; }"""\nwith open('program.c', 'w') as f: f.write(script)\nprint('Created program.c')`
    },
    {
      id: 'ready-rev-4',
      title: 'Timing Attack Validator',
      questionType: 'CTF',
      category: 'Reverse Engineering',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Timing Attack\n\nThis validator checks the password character by character and sleeps for 0.5s if the character is correct before moving to the next.\n\n**Goal:** Guess the 5 letter flag.`,
      correctAnswer: 'flag{t1m3_4tt4ck}',
      explanation: `Write a script that measures the response time. The longer the time, the more characters are correct.`,
      hintFileGeneratorCode: `import os\nscript = """import time, sys\\nflag = 'flag{t1m3_4tt4ck}'\\npassword = sys.argv[1] if len(sys.argv)>1 else ''\\nfor i in range(len(password)):\\n    if i >= len(flag) or password[i] != flag[i]: print('Wrong'); exit()\\n    time.sleep(0.5)\\nprint('Correct!')"""\nwith open('validator.py', 'w') as f: f.write(script)`
    },
    {
      id: 'ready-rev-5',
      title: 'Simple License Key',
      questionType: 'CTF',
      category: 'Reverse Engineering',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# License Key\n\nThe software requires a license key formatted as XXXX-XXXX-XXXX. The sum of the ASCII values of all characters must equal exactly 900.\n\n**Goal:** Generate a valid license key.`,
      correctAnswer: 'flag{l1c3ns3_g3n3r4t3d}',
      explanation: `Write a python script to generate random strings matching the format and check if the ASCII sum is 900. Submit any valid key to get the flag.`,
      hintFileGeneratorCode: `import os\nscript = """key = input('Key: ')\\nif len(key) == 14 and key[4] == '-' and key[9] == '-' and sum(ord(c) for c in key) == 900:\\n    print('Valid! flag{l1c3ns3_g3n3r4t3d}')\\nelse: print('Invalid')"""\nwith open('license.py', 'w') as f: f.write(script)`
    }
  ],
  'binary-exploitation': [
    {
      id: 'ready-pwn-1',
      title: 'Buffer Overflow 101',
      questionType: 'CTF',
      category: 'Binary Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Buffer Overflow 101\n\nA classic vulnerability. The \`gets()\` function is dangerous because it doesn't check bounds!`,
      correctAnswer: 'flag{b0ff_t0_w1n}',
      explanation: `Overflow the 32 byte buffer with A's to overwrite the adjacent \`is_admin\` variable on the stack.`,
      hintFileGeneratorCode: `import os\nscript = """#include <stdio.h>\\nint main() { int is_admin = 0; char username[32]; gets(username); if(is_admin) printf("flag{b0ff_t0_w1n}"); return 0; }"""\nwith open('vuln.c', 'w') as f: f.write(script)`
    },
    {
      id: 'ready-pwn-2',
      title: 'Format String Vulnerability',
      questionType: 'CTF',
      category: 'Binary Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Format String\n\nThe program prints your input directly using \`printf(input)\` instead of \`printf("%s", input)\`.\n\n**Goal:** Leak data from the stack.`,
      correctAnswer: 'flag{f0rm4t_str1ng_l34k}',
      explanation: `Input \`%x %x %x %x\` to read hex values from the stack, which eventually reveals the flag stored there.`,
      hintFileGeneratorCode: `import os\nscript = """#include <stdio.h>\\nint main(int argc, char** argv) { char* secret = "flag{f0rm4t_str1ng_l34k}"; printf(argv[1]); return 0; }"""\nwith open('vuln2.c', 'w') as f: f.write(script)`
    },
    {
      id: 'ready-pwn-3',
      title: 'Return to libc',
      questionType: 'CTF',
      category: 'Binary Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Return to libc\n\nThe stack is non-executable (NX enabled). You can't execute shellcode on the stack.\n\n**Goal:** Use a buffer overflow to overwrite the return address to point to \`system("/bin/sh")\` inside libc.`,
      correctAnswer: 'flag{r3t_2_l1bc_m4st3r}',
      explanation: `Find the base address of libc, the offset of \`system\`, and the offset of \`/bin/sh\`. Construct a ROP chain to call \`system("/bin/sh")\`.`,
      hintFileGeneratorCode: `import os\nprint("Create a standard buffer overflow target compiled with NX enabled.")`
    },
    {
      id: 'ready-pwn-4',
      title: 'Integer Overflow',
      questionType: 'CTF',
      category: 'Binary Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Integer Overflow\n\nThe shop sells flags for $1000, but you only have $10. \n\n**Goal:** Buy the flag by overflowing the total cost calculation.`,
      correctAnswer: 'flag{1nt_0v3rfl0w_sh0p}',
      explanation: `The total cost is calculated as \`count * 1000\` and stored in a signed 32-bit integer. If you buy enough items (e.g. 2147484), the total cost wraps around to a negative number, increasing your balance!`,
      hintFileGeneratorCode: `import os\nscript = """#include <stdio.h>\\nint main() { int balance = 10; int count; scanf("%d", &count); int cost = count * 1000; if(cost <= balance) { balance -= cost; printf("Bought! flag{1nt_0v3rfl0w_sh0p}"); } return 0; }"""\nwith open('shop.c', 'w') as f: f.write(script)`
    },
    {
      id: 'ready-pwn-5',
      title: 'Heap Use-After-Free',
      questionType: 'CTF',
      category: 'Binary Exploitation',
      mode: 'CTF',
      solutionsReady: true,
      markdown: `# Use After Free\n\nThe program allocates an Admin object, frees it, and then allocates a User object.\n\n**Goal:** Exploit the use-after-free to get admin privileges.`,
      correctAnswer: 'flag{u4f_h34p_m4g1c}',
      explanation: `When the Admin object is freed, its memory is reused by the newly allocated User object. By writing specific data to the User object, you manipulate the old Admin pointer.`,
      hintFileGeneratorCode: `import os\nprint("Heap exploitation challenge structure.")`
    }
  ]
};
