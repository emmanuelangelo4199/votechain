use anchor_lang::prelude::*;

declare_id!("Ax4euTS9vx3TFxgj7o2JSLmNeRQhG4Rm9JS53wZcWHKT");

#[program]
pub mod voting {
    use super::*;

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        question: String,
        options: Vec<String>,
        duration_seconds: i64,
    ) -> Result<()> {
        require!(question.len() > 0, VoteError::EmptyQuestion);
        require!(question.len() <= 200, VoteError::QuestionTooLong);
        require!(options.len() >= 2, VoteError::TooFewOptions);
        require!(options.len() <= 4, VoteError::TooManyOptions);
        for opt in &options {
            require!(opt.len() > 0, VoteError::EmptyOption);
            require!(opt.len() <= 50, VoteError::OptionTooLong);
        }
        require!(duration_seconds > 0, VoteError::InvalidDuration);

        let poll = &mut ctx.accounts.poll;
        let clock = Clock::get()?;
        poll.authority = ctx.accounts.authority.key();
        poll.question = question;
        poll.vote_counts = vec![0u64; options.len()];
        poll.options = options;
        poll.is_active = true;
        poll.created_at = clock.unix_timestamp;
        poll.ends_at = clock.unix_timestamp + duration_seconds;
        poll.bump = ctx.bumps.poll;
        msg!("Poll created: '{}' ending at {}", poll.question, poll.ends_at);
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let clock = Clock::get()?;
        require!(poll.is_active, VoteError::PollNotActive);
        require!(clock.unix_timestamp <= poll.ends_at, VoteError::PollExpired);
        require!((option_index as usize) < poll.options.len(), VoteError::InvalidOptionIndex);

        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.poll = poll.key();
        vote_record.option_index = option_index;
        vote_record.voted_at = clock.unix_timestamp;
        vote_record.bump = ctx.bumps.vote_record;
        poll.vote_counts[option_index as usize] += 1;
        msg!("Vote cast by {} for option {}", vote_record.voter, option_index);
        Ok(())
    }

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(poll.is_active, VoteError::PollAlreadyClosed);
        poll.is_active = false;
        msg!("Poll '{}' has been closed.", poll.question);
        Ok(())
    }
}

#[account]
pub struct Poll {
    pub authority: Pubkey,
    pub question: String,
    pub options: Vec<String>,
    pub vote_counts: Vec<u64>,
    pub is_active: bool,
    pub created_at: i64,
    pub ends_at: i64,
    pub bump: u8,
}

impl Poll {
    pub const MAX_SIZE: usize =
        8 + 32 + (4 + 200) + (4 + (4 + 50) * 4) + (4 + 8 * 4) + 1 + 8 + 8 + 1;
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub option_index: u8,
    pub voted_at: i64,
    pub bump: u8,
}

impl VoteRecord {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 1 + 8 + 1;
}

#[derive(Accounts)]
#[instruction(question: String, options: Vec<String>)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = authority,
        space = Poll::MAX_SIZE,
        seeds = [b"poll", authority.key().as_ref(), question.as_bytes()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    #[account(
        init,
        payer = voter,
        space = VoteRecord::MAX_SIZE,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    #[account(mut, has_one = authority @ VoteError::Unauthorized)]
    pub poll: Account<'info, Poll>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum VoteError {
    #[msg("Question cannot be empty.")]
    EmptyQuestion,
    #[msg("Question exceeds 200 characters.")]
    QuestionTooLong,
    #[msg("Need at least 2 options.")]
    TooFewOptions,
    #[msg("Maximum 4 options allowed.")]
    TooManyOptions,
    #[msg("Option cannot be empty.")]
    EmptyOption,
    #[msg("Option exceeds 50 characters.")]
    OptionTooLong,
    #[msg("Duration must be greater than zero.")]
    InvalidDuration,
    #[msg("Poll is not active.")]
    PollNotActive,
    #[msg("Poll has expired.")]
    PollExpired,
    #[msg("Invalid option index.")]
    InvalidOptionIndex,
    #[msg("Poll is already closed.")]
    PollAlreadyClosed,
    #[msg("Only the poll authority can perform this action.")]
    Unauthorized,
}
