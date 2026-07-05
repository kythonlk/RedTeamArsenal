# HTB CPTS — A-Z Guide (Index)

Simple, no-fluff notes to prep for and pass the HTB CPTS exam. Each file = one topic.
Read in order, or jump to what you need. Commands > paragraphs.

## How to use this
- Skim the module file, run the commands yourself in a lab (HTB Academy boxes, PG Practice, or your own VMs).
- `17-tools-cheatsheet.md` lists faster/better tool swaps for what HTB Academy teaches — use those in the real exam.
- `19-exam-strategy.md` and `20-tips-and-tricks.md` are the ones to re-read the night before the exam.

## File Map

| # | File | Covers |
|---|------|--------|
| 01 | 01-methodology.md | Overall pentest flow / PTES / how to approach any box |
| 02 | 02-recon-osint.md | Passive recon, OSINT, subdomain enum |
| 03 | 03-scanning-enum-nmap.md | Nmap, port scanning, faster alternatives |
| 04 | 04-service-enumeration.md | Per-service enum (FTP, SMB, SMTP, DNS, SNMP, SQL, RDP, NFS...) |
| 05 | 05-web-enumeration.md | Web recon, dir busting, fingerprinting |
| 06 | 06-web-attacks.md | SQLi, XSS, LFI/RFI, upload, XXE, SSRF, cmd injection, deserialization |
| 07 | 07-password-attacks.md | Hydra, hashcat, john, wordlists, spraying |
| 08 | 08-shells-payloads.md | Reverse/bind shells, msfvenom, shell upgrading |
| 09 | 09-file-transfers.md | Getting files in/out of targets |
| 10 | 10-linux-privesc.md | Linux privesc — manual + automated |
| 11 | 11-windows-privesc.md | Windows privesc — manual + automated |
| 12 | 12-active-directory-enum.md | AD enumeration |
| 13 | 13-active-directory-attacks.md | Kerberoasting, ASREPRoast, relay, delegation, DCSync |
| 14 | 14-lateral-movement.md | PtH, PsExec, WMIExec, Evil-WinRM, PtT |
| 15 | 15-pivoting-tunneling.md | Chisel, Ligolo-ng, SSH tunnels, proxychains |
| 16 | 16-metasploit-notes.md | Metasploit quick reference |
| 17 | 17-tools-cheatsheet.md | Master tool list + better/faster alternatives |
| 18 | 18-report-writing.md | HTB report requirements + template |
| 19 | 19-exam-strategy.md | Exam structure, time management, day-by-day plan |
| 20 | 20-tips-and-tricks.md | Gotchas, exam rules, common mistakes |

## CPTS Exam Quick Facts (as of last known format)
- **Duration:** 10 days total (typically ~7 days active pentest + 3 days report writing), open-book.
- **Format:** Realistic company network — external + internal hosts, AD environment, web apps. You write a full penetration test report.
- **Passing:** Compromise enough hosts / flags per the exam objectives + submit a professional report. Report quality genuinely matters — a hacked box with a bad report can fail.
- **Allowed:** Metasploit, any tool, internet access, notes, scripts you wrote in Academy.
- **Not allowed:** Sharing exam details, attacking out-of-scope hosts, DoS attacks.
- **Core skill mix tested:** Web app pentesting, network/service enumeration, Linux + Windows privesc, Active Directory attacks, pivoting, and — critically — **report writing**.

Next: start with `01-methodology.md`.
