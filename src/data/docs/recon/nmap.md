# Nmap Reference

Nmap ("Network Mapper") is a free and open source utility for network discovery and security auditing.

## Basic Scans

To scan your target {target}:

```bash
nmap -sV -sC {target}
```

## Advanced Techniques

- **Stealth Scan**: `nmap -sS {target}`
- **UDP Scan**: `nmap -sU {target}`
- **OS Detection**: `nmap -O {target}`

## Practical Examples

When attacking {target}, always start with a full port scan:

```bash
nmap -p- -T4 {target}
```
