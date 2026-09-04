# ModelSwitch Marketplace

Free AI API provider templates for [ModelSwitch](https://github.com/joyloe/modelswitch-marketplace).

## Templates

This repository maintains a curated list of free-tier AI API providers. The `templates.json` file is automatically checked and updated daily by a GitHub Action.

## Auto-Update

A GitHub Action runs daily at 08:00 UTC to:
- Check each provider's `/v1/models` endpoint
- Update the available models list
- Mark provider status (alive/degraded/down)

## Usage

Raw URL for ModelSwitch app:
```
https://raw.githubusercontent.com/joyloe/modelswitch-marketplace/main/templates.json
```
