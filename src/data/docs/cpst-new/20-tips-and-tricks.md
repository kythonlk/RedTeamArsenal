# 20 — Tips, Tricks & Gotchas

## Exam Rules — Don't Get Disqualified

- No sharing exam materials/questions publicly, ever (even after passing).
- Only attack in-scope IPs — double check every IP before running exploits (VPN can connect you to unrelated labs if misconfigured).
- No DoS/DDoS attacks — avoid `nmap --script vuln` blasting fragile services, avoid Hydra with huge thread counts against login forms (can lock accounts or crash services).
- Read the connection/scope PDF fully before touching anything.

## Common Mistakes That Cost People The Exam

1. **Bad/rushed report** despite good hacking — allocate real days to it, not hours.
2. **Not enumerating UDP** — SNMP/DNS/TFTP findings are easy points people skip.
3. **Ignoring low-priv creds** — every cred, even a guest account, should trigger a BloodHound collection and a spray attempt.
4. **Not taking screenshots live** — trying to reproduce a step days later after losing access wastes hours.
5. **Tunnel-visioning on one host** — if stuck 45+ min, switch targets; often another host unlocks the stuck one.
6. **Not trying default/weak creds first** — people jump to exploits before trying `admin:admin`, blank passwords, or creds found in configs/comments.
7. **Forgetting to re-check for privesc after lateral movement** — every new host = new local enum from scratch, don't assume you're already high-priv.
8. **Not reading error messages/banners carefully** — version numbers, stack traces, and verbose errors often hand you the exact CVE.

## Note-Taking / Efficiency Tips

- Keep a **snippets file** of your most-used one-liners (reverse shells, common nmap command, TTY upgrade) so you're not re-typing/re-searching mid-exam.
- Use `tmux` or multiple terminal tabs — one per host, keep long scans running in background panes.
- Alias your common commands in `.bashrc` on your attack VM ahead of time:
  ```bash
  alias nse-quick='nmap -sC -sV -Pn'
  alias ttyup='python3 -c "import pty;pty.spawn(\"/bin/bash\")"'
  ```

## Things People Forget Exist

- `/etc/hosts` — add every discovered hostname/domain, many web apps break/misbehave without correct Host headers.
- Password never expires / description fields in AD often literally contain the password.
- Old backup files on web servers: `.bak`, `.old`, `~`, `.swp` (vim swap files), `.git/` folders left exposed.
- `.git` exposed on a web root → `git-dumper` or `githacker` to pull full source + history (may reveal old hardcoded creds).
- Wayback Machine / `gau` for old endpoints that still work but aren't linked anymore.
- Shared local admin passwords across a whole AD estate (LAPS not deployed) — one cracked local admin hash often works everywhere via PtH.

## Mental Framing

- CPTS tests **breadth and process discipline** more than deep 0-day skill. Following the loop in `01-methodology.md` consistently beats being clever.
- Every stuck point has almost always been solved before by someone on an HTB Academy module — the exam mirrors Academy content closely, so if a technique feels unfamiliar, it's probably something from an Academy module you should review, not something exotic.
- Take breaks. A tired brain misses the obvious (like forgetting UDP scans or reusing a password you already have).

## Final Pre-Submission Sanity Check

- [ ] All required objectives/flags achieved (re-read scope doc one more time)
- [ ] Report proofread, screenshots legible, findings evidenced
- [ ] Submitted in correct format via correct HTB portal before deadline

Good luck — go build the muscle memory in a lab before exam day, then just execute the loop.
