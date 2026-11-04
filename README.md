# today

A Claude Code mod that shows how much of your weekly limit you can still use today, in the status line beside the prompt:

```
today  8.9% left
```

A week's limit gives each day 100/7 percent, about 14.3%. The number is what those days have added up to so far, counted from the week's reset, minus what you've used. Leftovers stay in it, and each midnight adds another 14.3. Past the budget it reads `2.1% over`. A new session shows the last saved reading marked with `~`, such as `~8.9% left`, until Claude's first reply brings a fresh one. The saved reading is kept per computer, so it can come from another account signed in there.

## Install

From a shell:

```
claude plugin marketplace add georgetchelidze/claude-week
claude plugin install today@claude-week --scope user
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `georgetchelidze/claude-week`, then Add plugin.
