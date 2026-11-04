# week

A Claude Code mod that puts your weekly limit next to an even daily budget of 100/7 percent a day, in the status line beside the prompt:

```
week  31% / 42.9% today
```

The first number is how much of the weekly limit you've used. The second is what an even pace allows by the end of today, counted from the week's reset. It fills in after Claude's first reply in a session.

## Install

In a terminal session:

```
/plugin install week --marketplace georgetchelidze/claude-week
```

Answer `y` to add the marketplace, then choose the user scope to have it in every session.

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `georgetchelidze/claude-week`, then Add plugin.
