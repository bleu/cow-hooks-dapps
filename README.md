# 🪝 CoW Hooks dApps

A collaborative project between Bleu and CoW Protocol teams to enhance CoW Swap with customizable pre and post-swap actions.

## 🎯 Introduction

CoW Hooks dApps is a collection of applications that integrate with CoW Swap's new hooks feature, allowing users to perform additional actions before or after token swaps. This monorepo contains implementations for various hooks that extend CoW Swap's functionality, making complex DeFi operations more streamlined and efficient.

## 🔥 Hooks dApps

Currently implemented hooks:

- **Claim Vesting Pre-Hook**: Claim LlamaPay vested tokens before swapping
- **Create Vesting Post-Hook**: Set up new LlamaPay vesting contracts after swapping
- **Withdraw Pool Pre-Hook**: Withdraw liquidity from CoW AMM before swapping
- **Deposit Pool Post-Hook**: Deposit tokens into CoW AMM after swapping

## 🛠 Project Structure

This is a monorepo using pnpm for package management. Each hook is implemented as a separate application:

```
apps/
  ├── claim-vesting/      # Vesting claim hook
  ├── create-vesting/     # Vesting creation hook
  ├── withdraw-pool/      # Pool withdrawal hook
  └── deposit-pool/       # Pool deposit hook
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- pnpm
- A Web3 wallet (e.g., MetaMask)

### Installation

```bash
# Clone the repository
git clone https://github.com/bleu/cow-hooks-dapps
cd cow-hooks-dapps

# Install dependencies
pnpm install
```

### Running a Hook Locally

1. Navigate to the specific hook app:

```bash
cd apps/<hook-app-name>
```

2. Start the development server:

```bash
pnpm dev
```

3. Connect your hook to CoW Swap:

   - Visit [dev.swap.cow.fi](https://dev.swap.cow.fi/#/100/swap/hooks)
   - Connect your wallet to a supported network
   - Click "Add Pre-Hook Action" or "Add Post-Hook Action"
   - Select "My Custom Hooks"
   - Click "Add custom hook"
   - Enter `http://127.0.0.1:3000` as the hook URL
   - Click "Add"

4. Your hook is now ready to use in the swap interface!

## 🔧 Development

### Linting

```bash
pnpm check
```

### Building

```bash
pnpm build
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for any improvements or bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

For more detailed information about each hook and how to use them, please refer to:

- [CoW Swap Documentation](https://docs.cow.fi)
- [Hooks Guide](https://docs.cow.fi/cow-protocol/reference/core/intents/hooks#creating-orders-with-hooks)

## 🆘 Support

If you need help or have questions:

- Open an [issue](https://github.com/bleu/cow-hooks-dapps/issues)
- Join CoW [Discord](https://discord.gg/cowprotocol)
- Visit CoW [Forum](https://forum.cow.fi)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with 🐮 by [Bleu](http://bleu.builders) & [CoW Protocol](https://cow.fi)
