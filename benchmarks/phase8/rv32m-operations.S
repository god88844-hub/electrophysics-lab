/* RV32M 2.0 compiled-binary differential test against QEMU user-mode.
 * 12 word outputs cover all eight M operations plus integer edge cases.
 * Linux write() is executed only in QEMU; the JS emulator stops at ECALL.
 * This is functional instruction evidence, not hardware validation.
 */
.option norvc
.option norelax
.section .text
.global _start
_start:
  addi t0,zero,7
  addi t1,zero,11
  mul s0,t0,t1               /* 77 */
  lui t0,0x80000             /* INT32_MIN */
  addi t1,zero,-1
  mulh s1,t0,t1              /* signed high: 0 */
  mulhsu s2,t0,t1            /* signed x unsigned high: 0x80000000 */
  mulhu s3,t0,t1             /* unsigned high: 0x7fffffff */
  div s4,t0,t1               /* signed overflow: INT32_MIN */
  divu s5,t0,t1              /* 0x80000000 / 0xffffffff => 0 */
  rem s6,t0,t1               /* signed overflow remainder: 0 */
  remu s7,t0,t1              /* 0x80000000 % 0xffffffff => 0x80000000 */
  addi t2,zero,7
  div s8,t2,zero             /* divide by zero: all one bits */
  divu s9,t2,zero
  rem s10,t0,zero            /* divisor zero: dividend */
  remu s11,t0,zero
  lla t4,result_words
  sw s0,0(t4)
  sw s1,4(t4)
  sw s2,8(t4)
  sw s3,12(t4)
  sw s4,16(t4)
  sw s5,20(t4)
  sw s6,24(t4)
  sw s7,28(t4)
  sw s8,32(t4)
  sw s9,36(t4)
  sw s10,40(t4)
  sw s11,44(t4)
  addi a0,zero,1            /* stdout */
  addi a1,t4,0              /* pointer to result_words */
  addi a2,zero,48           /* exactly 12 little-endian words */
  addi a7,zero,64           /* Linux RISC-V write */
  ecall                     /* JS stops here (no OS model) */
  addi a0,zero,0
  addi a7,zero,93
  ecall                     /* QEMU exits */

.section .data
.balign 4
result_words:
  .zero 48
