module my_addr::swap_gateway {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    struct Deposit has store, drop {
        id: u64,
        user: address,
        amount: u64,
        target_chain: String,
        target_address: String,
        processed: bool,
    }

    struct Gateway has key {
        next_id: u64,
        deposits: vector<Deposit>,
    }

    public entry fun init(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Gateway>(admin_addr), 1);

        move_to(admin, Gateway {
            next_id: 0,
            deposits: vector::empty<Deposit>(),
        });
    }

    public entry fun deposit(
        user: &signer,
        admin_addr: address,
        amount: u64,
        target_chain: String,
        target_address: String
    ) acquires Gateway {
        let gateway = borrow_global_mut<Gateway>(admin_addr);

        coin::withdraw<AptosCoin>(user, amount);

        let id = gateway.next_id;
        gateway.next_id = id + 1;

        vector::push_back(&mut gateway.deposits, Deposit {
            id,
            user: signer::address_of(user),
            amount,
            target_chain,
            target_address,
            processed: false,
        });
    }

    public entry fun mark_processed(
        admin: &signer,
        deposit_id: u64
    ) acquires Gateway {
        let admin_addr = signer::address_of(admin);
        let gateway = borrow_global_mut<Gateway>(admin_addr);

        let len = vector::length(&gateway.deposits);
        let mut i = 0;
        while (i < len) {
            let d = vector::borrow_mut(&mut gateway.deposits, i);
            if (d.id == deposit_id) {
                d.processed = true;
                return;
            };
            i = i + 1;
        };

        abort 404;
    }
}
