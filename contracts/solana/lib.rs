use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct DepositState {
    pub user: Pubkey,
    pub amount: u64,
    pub processed: bool,
    pub target_chain: String,
    pub target_address: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SwapInstruction {
    Deposit { 
        amount: u64,
        target_chain: String,
        target_address: String,
    },
    MarkProcessed,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = SwapInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    let accounts_iter = &mut accounts.iter();
    let state_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    match instruction {
        SwapInstruction::Deposit { amount, target_chain, target_address } => {
            let state = DepositState {
                user: *user_account.key,
                amount,
                processed: false,
                target_chain: target_chain.clone(),
                target_address: target_address.clone(),
            };

            state.serialize(&mut &mut state_account.data.borrow_mut()[..])
                .map_err(|_| ProgramError::AccountDataTooSmall)?;

            // Structured log for the relayer to parse
            msg!("Deposited: {}, {}, {}, {}", amount, target_chain, target_address, user_account.key);
        }
        SwapInstruction::MarkProcessed => {
            let mut state = DepositState::try_from_slice(&state_account.data.borrow())
                .map_err(|_| ProgramError::InvalidAccountData)?;

            state.processed = true;

            state.serialize(&mut &mut state_account.data.borrow_mut()[..])
                .map_err(|_| ProgramError::AccountDataTooSmall)?;

            msg!("Deposit marked processed");
        }
    }

    Ok(())
}
