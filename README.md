# today

A Claude Code mod that shows how much of today's share of your weekly limit you've used, in the status line beside the prompt:

```
today  17%
```

A week's limit gives each day 100/7 percent, about 14.3%. The mod maps today's slice of the week onto 0–100%, counted from the week's reset. Leftovers carry over: under-using earlier days keeps it at 0% for longer, and overspending starts the day above 100%. It fills in after Claude's first reply in a session.

## Install

From a shell:

```
claude plugin marketplace add georgetchelidze/claude-week
claude plugin install today@claude-week --scope user
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `georgetchelidze/claude-week`, then Add plugin.
