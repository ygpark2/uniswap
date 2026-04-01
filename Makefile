.PHONY: deploy-evm deploy-tron deploy-solana deploy-aptos deploy-all solve install install-tools uninstall-tools build

# Install Node.js dependencies
install:
	npm install --legacy-peer-deps

install-tools:
	@if ! command -v solana > /dev/null; then \
		curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash; \
	else \
		echo "Solana CLI is already installed."; \
	fi
	@if ! command -v aptos > /dev/null; then \
		curl -fsSL "https://aptos.dev/scripts/install_cli.sh" | sh; \
	else \
		echo "Aptos CLI is already installed."; \
	fi

uninstall-tools:
	@echo "Uninstalling Solana CLI..."
	rm -rf $(HOME)/.local/share/solana
	@echo "Uninstalling Aptos CLI..."
	rm -rf $(HOME)/.local/bin/aptos
	@echo "Tools uninstalled. Please manually remove the PATH entries from your ~/.zshrc or ~/.bash_profile if any."

# Build Angular project
build:
	npm run build

# Deploy EVM (Sepolia) contract
deploy-evm:
	cd contracts/evm && npm install && npx hardhat run scripts/deploy-sepolia.js --network sepolia

# Deploy TRON (Nile) contract
deploy-tron:
	cd contracts/tron && npx tronbox migrate --network nile

# Deploy Solana (Local/Default) program
deploy-solana:
	cd contracts/solana && cargo build-sbf
	solana program deploy contracts/solana/target/deploy/solana_swap_gateway.so
	# solana program deploy contracts/solana/target/deploy/solana_swap_gateway.so --url devnet

# Deploy Aptos (Devnet) module
deploy-aptos:
	cd contracts/aptos && aptos move publish \
		--url https://fullnode.devnet.aptoslabs.com/v1 \
		--named-addresses my_addr=$(shell grep APTOS_ACCOUNT_ADDRESS .env | cut -d '=' -f2) \
		--private-key $(shell grep APTOS_PRIVATE_KEY .env | cut -d '=' -f2) \
		--assume-yes

# Deploy all contracts
deploy-all: deploy-evm deploy-tron deploy-solana deploy-aptos

# Run solver (event watcher + automated relay)
solve:
	npm run solve
