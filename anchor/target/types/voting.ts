/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting.json`.
 */
export type Voting = {
  "address": "Ax4euTS9vx3TFxgj7o2JSLmNeRQhG4Rm9JS53wZcWHKT",
  "metadata": {
    "name": "voting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "poll"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closePoll",
      "discriminator": [
        139,
        213,
        162,
        65,
        172,
        150,
        123,
        67
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "poll"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "question"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "durationSeconds",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "emptyQuestion",
      "msg": "Question cannot be empty."
    },
    {
      "code": 6001,
      "name": "questionTooLong",
      "msg": "Question exceeds 200 characters."
    },
    {
      "code": 6002,
      "name": "tooFewOptions",
      "msg": "Need at least 2 options."
    },
    {
      "code": 6003,
      "name": "tooManyOptions",
      "msg": "Maximum 4 options allowed."
    },
    {
      "code": 6004,
      "name": "emptyOption",
      "msg": "Option cannot be empty."
    },
    {
      "code": 6005,
      "name": "optionTooLong",
      "msg": "Option exceeds 50 characters."
    },
    {
      "code": 6006,
      "name": "invalidDuration",
      "msg": "Duration must be greater than zero."
    },
    {
      "code": 6007,
      "name": "pollNotActive",
      "msg": "Poll is not active."
    },
    {
      "code": 6008,
      "name": "pollExpired",
      "msg": "Poll has expired."
    },
    {
      "code": 6009,
      "name": "invalidOptionIndex",
      "msg": "Invalid option index."
    },
    {
      "code": 6010,
      "name": "pollAlreadyClosed",
      "msg": "Poll is already closed."
    },
    {
      "code": 6011,
      "name": "unauthorized",
      "msg": "Only the poll authority can perform this action."
    }
  ],
  "types": [
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "voteCounts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "endsAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "poll",
            "type": "pubkey"
          },
          {
            "name": "optionIndex",
            "type": "u8"
          },
          {
            "name": "votedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
