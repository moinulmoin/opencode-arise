import type { PluginInput } from "@opencode-ai/plugin";

const BANNER_ASCII = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║               ⚔️  A R I S E !  ⚔️                     ║
║                                                       ║
║         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░           ║
║         ░░    Shadow Army Assembled    ░░░           ║
║         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░           ║
║                                                       ║
║   Monarch ready. Shadows await your command.          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`;

const TOAST_MESSAGE = "⚔️ ARISE! Shadow Army Assembled. Monarch ready.";

let bannerShownThisProcess = false;

export function createAriseBannerHook(ctx: PluginInput) {
  const showToast = async () => {
    try {
      await ctx.client.tui.showToast({
        body: {
          title: "opencode-arise",
          message: TOAST_MESSAGE,
          variant: "info",
          duration: 4000,
        },
      });
    } catch {
      // TUI might not be available (non-interactive mode)
    }
  };

  return {
    async onSessionCreated() {
      if (!bannerShownThisProcess) {
        bannerShownThisProcess = true;
        await showToast();
      }
    },
  };
}

export function getBanner(): string {
  return BANNER_ASCII;
}

export function printBannerToConsole(): void {
  if (!bannerShownThisProcess) {
    console.log(BANNER_ASCII);
    bannerShownThisProcess = true;
  }
}
