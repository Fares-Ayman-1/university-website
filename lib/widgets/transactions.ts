/*
 * Small transaction simulations for the Lecture 1 walkthrough (databases). Pure, so the
 * server can check the page's numbers and the scenes can draw the same values.
 */

export type Accounts = { A: number; B: number };

/** The page's example: funds_transfer.sql moves 500 from A to B. Both walkthrough text and scenes use these. */
export const START: Accounts = { A: 2000, B: 1000 };
export const AMOUNT = 500;

/** The transfer in funds_transfer.sql: A pays B `amount`, optionally crashing between the two UPDATEs. */
export function transfer(start: Accounts, amount: number, crashAfterDebit = false) {
  const afterDebit = { ...start, A: start.A - amount };
  if (crashAfterDebit) {
    // Before COMMIT nothing is durable: recovery undoes the debit from the log.
    return { afterDebit, beforeRecovery: afterDebit, final: { ...start }, committed: false };
  }
  const final = { ...afterDebit, B: afterDebit.B + amount };
  return { afterDebit, beforeRecovery: final, final, committed: true };
}

export const total = (a: Accounts) => a.A + a.B;

export type TxEvent = {
  who: "T1" | "T2";
  op: "lock" | "wait" | "read" | "write" | "unlock";
  /** The value read or written, or the balance on disk for lock/wait/unlock */
  value: number;
  /** The balance stored in the database after this event */
  db: number;
};

/**
 * Two deposits into the same account, interleaved. Without locking both read the old
 * balance and the second write overwrites the first (a lost update); with locking T2 waits
 * for T1's lock and reads the new balance.
 */
export function deposits(start: number, d1: number, d2: number, locking: boolean) {
  const events: TxEvent[] = [];
  let db = start;
  const log = (who: TxEvent["who"], op: TxEvent["op"], value: number) => events.push({ who, op, value, db });

  if (!locking) {
    const r1 = db;
    log("T1", "read", r1);
    const r2 = db;
    log("T2", "read", r2);
    db = r1 + d1;
    log("T1", "write", db);
    db = r2 + d2;
    log("T2", "write", db);
  } else {
    log("T1", "lock", db);
    const r1 = db;
    log("T1", "read", r1);
    log("T2", "wait", db);
    db = r1 + d1;
    log("T1", "write", db);
    log("T1", "unlock", db);
    log("T2", "lock", db);
    const r2 = db;
    log("T2", "read", r2);
    db = r2 + d2;
    log("T2", "write", db);
    log("T2", "unlock", db);
  }
  const correct = start + d1 + d2;
  return { events, final: db, correct, lost: correct - db };
}
