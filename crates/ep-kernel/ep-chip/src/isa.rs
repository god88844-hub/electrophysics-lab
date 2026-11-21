//! RV32IM instruction-field extraction and reference-exact encoders.
//!
//! The encoders mirror `packages/chip-engine/src/rv32.mjs`'s `asm` helpers
//! bit-for-bit (word-level little-endian packing), so test programs assembled
//! here decode identically under both JS reference engines and this crate.

/// Decoded instruction fields of one 32-bit RV32 word.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Fields {
    pub word: u32,
    pub opcode: u32,
    pub rd: usize,
    pub f3: u32,
    pub rs1: usize,
    pub rs2: usize,
    pub f7: u32,
    /// Sign-extended I-type immediate.
    pub imm_i: i32,
    /// Sign-extended S-type immediate.
    pub imm_s: i32,
    /// Sign-extended B-type immediate.
    pub imm_b: i32,
    /// U-type upper immediate (already shifted: `word & 0xfffff000`).
    pub imm_u: u32,
    /// Sign-extended J-type immediate.
    pub imm_j: i32,
}

/// Extract the exact field set used by both reference engines.
///
/// The JS engines sign-extend via `<< (32-n) >> (32-n)` on int32 values; the
/// arithmetic below produces identical two's-complement results for every
/// 32-bit word.
#[must_use]
pub fn decode(word: u32) -> Fields {
    let imm_i = ((((word >> 20) & 0xfff) << 20) as i32) >> 20;
    let imm_s = ((((((word >> 25) & 0x7f) << 5) | ((word >> 7) & 0x1f)) << 20) as i32) >> 20;
    let imm_b = ((((((word >> 31) & 1) << 12)
        | (((word >> 7) & 1) << 11)
        | (((word >> 25) & 0x3f) << 5)
        | (((word >> 8) & 0xf) << 1)) as i32)
        << 19)
        >> 19;
    let imm_j = ((((((word >> 31) & 1) << 20)
        | (((word >> 12) & 0xff) << 12)
        | (((word >> 20) & 1) << 11)
        | (((word >> 21) & 0x3ff) << 1)) as i32)
        << 11)
        >> 11;
    Fields {
        word,
        opcode: word & 0x7f,
        rd: ((word >> 7) & 0x1f) as usize,
        f3: (word >> 12) & 0x7,
        rs1: ((word >> 15) & 0x1f) as usize,
        rs2: ((word >> 20) & 0x1f) as usize,
        f7: word >> 25,
        imm_i,
        imm_s,
        imm_b,
        imm_u: word & 0xffff_f000,
        imm_j,
    }
}

/// Reference-exact word encoders (`asm` helpers of `packages/chip-engine/src/rv32.mjs`).
pub mod encode {
    /// `asm.R(f7, rs2, rs1, f3, rd, op)`
    #[must_use]
    pub fn r_type(f7: u32, rs2: u32, rs1: u32, f3: u32, rd: u32, opcode: u32) -> u32 {
        (f7 << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | opcode
    }
    /// `asm.I(imm, rs1, f3, rd, op)`
    #[must_use]
    pub fn i_type(imm: i32, rs1: u32, f3: u32, rd: u32, opcode: u32) -> u32 {
        (((imm & 0xfff) as u32) << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | opcode
    }
    /// `asm.S(imm, rs2, rs1, f3, op)`
    #[must_use]
    pub fn s_type(imm: i32, rs2: u32, rs1: u32, f3: u32, opcode: u32) -> u32 {
        let imm12 = (imm & 0xfff) as u32;
        (((imm12 >> 5) & 0x7f) << 25)
            | (rs2 << 20)
            | (rs1 << 15)
            | (f3 << 12)
            | ((imm12 & 0x1f) << 7)
            | opcode
    }
    /// `asm.B(imm, rs2, rs1, f3, op)`
    #[must_use]
    pub fn b_type(imm: i32, rs2: u32, rs1: u32, f3: u32, opcode: u32) -> u32 {
        let imm13 = (imm & 0x1fff) as u32;
        (((imm13 >> 12) & 1) << 31)
            | (((imm13 >> 5) & 0x3f) << 25)
            | (rs2 << 20)
            | (rs1 << 15)
            | (f3 << 12)
            | (((imm13 >> 1) & 0xf) << 8)
            | (((imm13 >> 11) & 1) << 7)
            | opcode
    }
    /// `asm.J(imm, rd, op)`
    #[must_use]
    pub fn j_type(imm: i32, rd: u32, opcode: u32) -> u32 {
        let imm21 = (imm & 0x1f_ffff) as u32;
        (((imm21 >> 20) & 1) << 31)
            | (((imm21 >> 1) & 0x3ff) << 21)
            | (((imm21 >> 11) & 1) << 20)
            | (((imm21 >> 12) & 0xff) << 12)
            | (rd << 7)
            | opcode
    }
    /// `asm.opImm(f3, rd, rs1, imm)` — OP-IMM with opcode 0x13.
    #[must_use]
    pub fn op_imm(f3: u32, rd: u32, rs1: u32, imm: i32) -> u32 {
        i_type(imm, rs1, f3, rd, 0x13)
    }
    /// `asm.halt()` — `addi x0, x0, 1` HALT sentinel of the twin harness.
    #[must_use]
    pub fn halt_sentinel() -> u32 {
        i_type(1, 0, 0, 0, 0x13)
    }
    /// EBREAK `0x00100073` — strict-harness stop (`ok: true`).
    #[must_use]
    pub const fn ebreak() -> u32 {
        0x0010_0073
    }
    /// ECALL `0x00000073` — strict-harness environment-call trap (`ok: false`).
    #[must_use]
    pub const fn ecall() -> u32 {
        0x0000_0073
    }
    /// M-extension OP with `f7 = 0x01` and the given `funct3`.
    #[must_use]
    pub fn m_ext(f3: u32, rd: u32, rs1: u32, rs2: u32) -> u32 {
        r_type(1, rs2, rs1, f3, rd, 0x33)
    }
    /// LUI (opcode 0x37) with a raw 20-bit immediate.
    #[must_use]
    pub fn u_lui(rd: u32, imm20: u32) -> u32 {
        ((imm20 & 0xf_ffff) << 12) | (rd << 7) | 0x37
    }
    /// AUIPC (opcode 0x17) with a raw 20-bit immediate.
    #[must_use]
    pub fn u_auipc(rd: u32, imm20: u32) -> u32 {
        ((imm20 & 0xf_ffff) << 12) | (rd << 7) | 0x17
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Encoder/decoder round-trips must hold for representative operands
    /// (same invariants the JS `asm` helpers satisfy in tests/rv32i.test.mjs).
    #[test]
    fn encode_decode_round_trip() {
        let w = encode::r_type(0x20, 2, 1, 0, 3, 0x33);
        let f = decode(w);
        assert_eq!(
            (f.f7, f.rs2, f.rs1, f.f3, f.rd, f.opcode),
            (0x20, 2, 1, 0, 3, 0x33)
        );

        let w = encode::i_type(-2048, 1, 2, 3, 0x03);
        let f = decode(w);
        assert_eq!(f.imm_i, -2048);
        assert_eq!((f.rs1, f.f3, f.rd, f.opcode), (1, 2, 3, 0x03));

        let w = encode::s_type(-4, 2, 1, 2, 0x23);
        let f = decode(w);
        assert_eq!(f.imm_s, -4);
        assert_eq!((f.rs2, f.rs1, f.f3, f.opcode), (2, 1, 2, 0x23));

        let w = encode::b_type(-8, 0, 1, 1, 0x63);
        let f = decode(w);
        assert_eq!(f.imm_b, -8);

        let w = encode::b_type(4094, 0, 1, 1, 0x63);
        assert_eq!(decode(w).imm_b, 4094);

        let w = encode::j_type(-2, 1, 0x6f);
        let f = decode(w);
        assert_eq!(f.imm_j, -2);

        // J immediates carry an implicit zero LSB: 0xf_fffe is the largest
        // positive encodable value.
        let w = encode::j_type(0xf_fffe, 1, 0x6f);
        assert_eq!(decode(w).imm_j, 0xf_fffe);
        // The J immediate is signed 21-bit: bit 20 set wraps negative.
        let w = encode::j_type(0x10_0000, 1, 0x6f);
        assert_eq!(decode(w).imm_j, -1_048_576);

        // HALT sentinel decodes to addi x0, x0, 1.
        let f = decode(encode::halt_sentinel());
        assert_eq!((f.opcode, f.rd, f.rs1, f.imm_i), (0x13, 0, 0, 1));
    }

    /// Reference-exact encodings for hand-assembled Phase 8 program words.
    #[test]
    fn reference_word_matches() {
        // addi x1, x0, 5 (tests/rv32i.test.mjs: 0x00500093)
        assert_eq!(encode::op_imm(0, 1, 0, 5), 0x0050_0093);
        // lui x5, 0x80000 (benchmarks/phase8: 0x800002b7)
        assert_eq!(encode::u_lui(5, 0x8_0000), 0x8_00002b7);
        // ebreak/ecall fixed words
        assert_eq!(encode::ebreak(), 0x0010_0073);
        assert_eq!(encode::ecall(), 0x0000_0073);
    }
}
