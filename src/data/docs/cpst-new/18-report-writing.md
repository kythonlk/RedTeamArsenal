# 18 — Report Writing (This Can Make Or Break Your Pass)

CPTS fails often happen from a **bad report on a mostly-solved exam**, not from failing to hack enough hosts. Treat report writing as a graded deliverable, not an afterthought.

## Document As You Go — Not At The End

For every single exploit/privesc step, capture immediately:
1. The exact command run
2. A screenshot showing the command + output (terminal timestamp visible helps)
3. Why it worked (root cause, e.g. "SMB signing disabled allowed NTLM relay")
4. The resulting access level gained

Keep a running `progress.md` per host, and a master spreadsheet: `Host | IP | Vuln | Access Gained | Screenshot ref | Notes`.

## HTB Report Structure (use their provided template — don't freestyle the skeleton)

1. **Cover page / scope** — dates, tester, targets in scope
2. **Executive summary** — 1-2 paragraphs, non-technical, business risk framing. Written for a manager, not a hacker.
3. **Methodology** — brief description of PTES-style approach used
4. **Findings summary table** — vuln name, affected host, severity (Critical/High/Medium/Low/Info), CVSS if applicable
5. **Detailed findings** — one section per vulnerability:
   - Description of the vulnerability
   - Affected host(s)
   - Steps to reproduce (numbered, command-by-command, with screenshots)
   - Impact
   - Remediation/recommendation
6. **Attack narrative / chain** (often required) — the full story of how you went from external foothold to Domain Admin, in order, referencing the findings above.
7. **Appendix** — full command output, hash dumps, tool output logs if needed.

## Writing Style Rules

- Write in **third person, past tense**: "The tester identified..." not "I found..."
- Every claim needs evidence: a screenshot or command output, not just prose.
- Screenshots must be **legible** — crop tightly, include the command and the relevant output line, not the whole terminal history.
- Redact irrelevant, unrelated real credentials/PII if any leaked into screenshots by mistake.
- Be precise with IPs/hostnames — copy-paste them, don't retype (typos here look sloppy and confuse a reviewer).
- Severity should map to actual impact, not just "cool factor" — e.g., a local-only info leak is not Critical.

## Remediation Advice (have a short one ready for each vuln class)

| Vuln | Remediation One-Liner |
|---|---|
| SQLi | Use parameterized queries / prepared statements |
| Weak/default creds | Enforce strong password policy + MFA |
| SMB signing disabled | Enable SMB signing via GPO |
| Kerberoasting | Use long random passwords for service accounts, consider gMSA |
| Unconstrained delegation | Remove unless required; use constrained/resource-based delegation |
| Outdated software/CVE | Patch management process, timely updates |
| Excessive privileges (ACL abuse) | Principle of least privilege, regular ACL audits |
| Missing input validation (XSS/LFI/cmd inj) | Server-side input validation/allowlisting, output encoding |

## Time Budget

- HTB CPTS gives ~3 of the 10 days as report time — **don't wait until then** to start writing. Draft findings sections the same day you exploit each host. Final 2-3 days = polish, formatting, executive summary, attack narrative, proofread.

## Before Submission Checklist

- [ ] Every finding has a screenshot showing proof
- [ ] Executive summary written for non-technical reader
- [ ] All IPs/hostnames consistent throughout doc
- [ ] Spelling/grammar checked
- [ ] Attack chain/narrative section ties everything together end-to-end
- [ ] Remediation given for every finding
- [ ] Exported as required format (usually PDF) per HTB submission instructions
- [ ] File naming matches HTB's required convention

Next: `19-exam-strategy.md`
