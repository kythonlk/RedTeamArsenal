# 19 — Exam Strategy: Start To Finish

## Before Exam Day

- [ ] Do at least 3-5 full "assumed breach" / AD-heavy HTB Academy modules end-to-end without hints (Attacking Enterprise Networks module is closest to the real exam style).
- [ ] Practice on PG Practice / HTB retired AD boxes, timing yourself.
- [ ] Have your toolkit installed and tested (see `17-tools-cheatsheet.md`) — don't discover a broken tool install on exam day.
- [ ] Prepare your note-taking system (Obsidian/CherryTree/plain markdown folders) and your screenshot tool.
- [ ] Get the official HTB report template, know its sections cold.
- [ ] Sleep well. This is a marathon (10 days), not a sprint — pace yourself, don't burn out day 1-2.

## Day-by-Day Plan (typical 10-day window)

**Day 1:**
- Read the exam scope/objectives document fully, twice. Note exactly what's required to pass (usually specific flags/objectives per host + full report).
- Set up VPN, verify connectivity, do full network sweep (`nmap -sn`) to find all live hosts.
- Full port scans on every host, queue them in the background while you start manual enum on the first ones that finish.

**Day 2-3:**
- Enumerate every host's services. Get initial footholds on the easier/external-facing machines first (usually web apps).
- Start `progress.md` immediately: host, status, creds found.
- The moment you get ANY domain credential (even low priv), run BloodHound collection.

**Day 4-6:**
- Privesc on owned hosts, loot credentials, pivot into internal networks.
- Follow BloodHound's shortest-path-to-DA suggestions.
- Credential-spray every new cred against the whole known host list constantly (this is often how you jump to the next host, not always a fresh exploit).
- Start drafting report findings sections for hosts you've already fully finished — don't wait.

**Day 7:**
- Push for the final objectives (Domain Admin / all required flags). If stuck, revisit `01-methodology.md`'s stuck-checklist — re-enumerate.
- Finish all screenshots and evidence gathering while access is still live (don't assume you can go back easily).

**Day 8-10 (Report days):**
- Day 8: write/finish all detailed findings sections + attack narrative.
- Day 9: executive summary, remediation, formatting, consistency pass.
- Day 10: final proofread, export, submit early (don't submit at the last hour — upload issues happen).

## Time Management Rules

- **30-45 minute stuck rule:** if no progress on a host for that long, switch to another host or re-run full enumeration (`-p-`, all UDP, re-check every banner) rather than guessing exploits blindly.
- **Don't rabbit-hole rare/exotic bugs** early — check the obvious stuff first (creds reuse, default creds, known CVEs for the exact version) before assuming a custom 0-day is needed.
- **Track time on report writing from day 1** by drafting as you go — this is the most common reason people run out of time.

## Priority Order When Multiple Paths Are Open

1. Anything with a known public CVE + easy exploit (searchsploit hit)
2. Default/weak credentials
3. Misconfigurations (writable shares, null sessions, GPP passwords)
4. Web app vulnerabilities
5. Credential reuse across services
6. AD-specific attacks (Kerberoasting, ACL abuse, delegation)
7. Kernel exploits (last resort — can be unstable)

## What "Good Enough" Looks Like

You don't need to fully compromise 100% of every possible host if the objectives don't require it — read the scope doc carefully for exactly what's graded (usually: compromise specific flag hosts / reach Domain Admin / demonstrate specific attack chains). Don't waste days on out-of-scope rabbit holes.

Next: `20-tips-and-tricks.md`
